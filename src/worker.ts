export interface Env {
  DB: D1Database;
  PDFS: R2Bucket;
  SITE_URL: string;
  STRIPE_RETURN_URL: string;
  STRIPE_CANCEL_URL: string;
  PAYPAL_RETURN_URL: string;
  PAYPAL_CANCEL_URL: string;
  PAYPAL_SUCCESS_URL: string;
  CUSTOMER_SESSION_SECRET?: string;
  STRIPE_SECRET_KEY: string;
  PAYPAL_CLIENT_ID: string;
  PAYPAL_CLIENT_SECRET: string;
  PAYPAL_API_BASE?: string;
}

const json = (data: unknown, init?: ResponseInit) =>
  Response.json(data, {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET,POST,OPTIONS',
      'access-control-allow-headers': 'Content-Type'
    },
    ...init
  });

const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-allow-headers': 'Content-Type'
};

const readTotal = async (request: Request) => {
  const body = await request.json().catch(() => ({}));
  return Number((body as { total?: unknown }).total);
};

const readJson = async (request: Request) => request.json().catch(() => ({}));

const customerIdFromEmail = (email: string) => `cust_${email.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;

const makePrivatePdfKey = (orderId: string, bookId: string) => `customer-pdfs/${orderId}/${bookId}.pdf`;
const makeRootPdfKey = (bookId: string) => `${bookId}.pdf`;

const signCustomerToken = async (env: Env, email: string) => {
  const payload = `${email}:${Date.now()}`;
  const encoder = new TextEncoder();
  const keyData = encoder.encode(env.CUSTOMER_SESSION_SECRET || env.PAYPAL_CLIENT_SECRET || env.STRIPE_SECRET_KEY);
  const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const token = `${btoa(payload)}.${btoa(String.fromCharCode(...new Uint8Array(signature)))}`;
  return token;
};

const verifyCustomerToken = async (env: Env, token: string) => {
  const [payloadB64, signatureB64] = token.split('.');
  if (!payloadB64 || !signatureB64) return null;

  const encoder = new TextEncoder();
  const keyData = encoder.encode(env.CUSTOMER_SESSION_SECRET || env.PAYPAL_CLIENT_SECRET || env.STRIPE_SECRET_KEY);
  const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const payload = atob(payloadB64);
  const expected = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const expectedB64 = btoa(String.fromCharCode(...new Uint8Array(expected)));
  if (expectedB64 !== signatureB64) return null;

  const [email, timestamp] = payload.split(':');
  if (!email || !timestamp) return null;
  return { email, timestamp: Number(timestamp) };
};

const cents = (amount: number) => Math.round(amount * 100);

const base64 = (value: string) => {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
};

const paypalApiBase = (env: Env) => env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';

const stripeCheckoutSession = async (env: Env, total: number) => {
  const form = new URLSearchParams();
  form.set('mode', 'payment');
  form.set('success_url', env.STRIPE_RETURN_URL);
  form.set('cancel_url', env.STRIPE_CANCEL_URL);
  form.set('line_items[0][quantity]', '1');
  form.set('line_items[0][price_data][currency]', 'eur');
  form.set('line_items[0][price_data][unit_amount]', String(cents(total)));
  form.set('line_items[0][price_data][product_data][name]', 'Commande Livres de Jean');
  form.set('metadata[total_eur]', total.toFixed(2));
  form.set('metadata[source]', 'livres-de-jean');

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: form.toString()
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || 'Stripe checkout creation failed');
  }

  return data as { url?: string; id?: string };
};

const paypalAccessToken = async (env: Env) => {
  const response = await fetch(`${paypalApiBase(env)}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${base64(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error_description || 'PayPal auth failed');
  }

  return data.access_token as string;
};

const paypalCreateOrder = async (env: Env, total: number) => {
  const token = await paypalAccessToken(env);
  const response = await fetch(`${paypalApiBase(env)}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: 'commande-livres-de-jean',
          description: 'Commande Livres de Jean',
          amount: {
            currency_code: 'EUR',
            value: total.toFixed(2)
          }
        }
      ],
      application_context: {
        return_url: env.PAYPAL_RETURN_URL,
        cancel_url: env.PAYPAL_CANCEL_URL,
        user_action: 'PAY_NOW'
      }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || 'PayPal order creation failed');
  }

  const approveUrl = (data.links || []).find((link: { rel?: string; href?: string }) => link.rel === 'approve')?.href;
  return { id: data.id as string | undefined, approveUrl };
};

const paypalCaptureOrder = async (env: Env, orderId: string) => {
  const token = await paypalAccessToken(env);
  const response = await fetch(`${paypalApiBase(env)}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || 'PayPal capture failed');
  }

  return data as { id?: string; status?: string };
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\/+/g, '/');

    if (pathname === '/health') {
      return json({ ok: true });
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (pathname === '/') {
      return json({
        ok: true,
        routes: {
          stripe: '/api/payments/stripe',
          paypal: '/api/payments/paypal',
          health: '/health'
        }
      });
    }

    if (pathname === '/payment/success') {
      return Response.redirect(env.STRIPE_RETURN_URL, 302);
    }

    if (pathname === '/payment/cancel') {
      return Response.redirect(env.STRIPE_CANCEL_URL, 302);
    }

    if (pathname === '/api/account/login' && request.method === 'POST') {
      const body = await readJson(request);
      const email = String(body?.email || '').trim().toLowerCase();
      if (!email) {
        return json({ error: 'Missing email' }, { status: 400 });
      }
      const customerId = customerIdFromEmail(email);
      await env.DB.prepare(
        'INSERT INTO customers (id, email, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?) ON CONFLICT(email) DO UPDATE SET first_name=excluded.first_name, last_name=excluded.last_name, phone=excluded.phone'
      ).bind(
        customerId,
        email,
        String(body?.firstName || 'Client'),
        String(body?.lastName || ''),
        String(body?.phone || '')
      ).run();
      const token = await signCustomerToken(env, email);
      return json({
        token,
        profile: {
          id: customerId,
          email,
          firstName: String(body?.firstName || 'Client'),
          lastName: String(body?.lastName || ''),
          phone: String(body?.phone || ''),
          orderIds: [],
          digitalAccessGranted: false
        }
      });
    }

    if (pathname === '/api/account/orders' && request.method === 'GET') {
      const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || url.searchParams.get('token') || '';
      const session = token ? await verifyCustomerToken(env, token) : null;
      const email = (url.searchParams.get('email') || session?.email || '').toLowerCase();
      if (!email) return json({ error: 'Missing email' }, { status: 400 });
      const customer = await env.DB.prepare('SELECT id FROM customers WHERE email = ?').bind(email).first<{ id: string }>();
      if (!customer?.id) return json({ orders: [] });
      const rows = await env.DB.prepare('SELECT id, payload_json FROM orders WHERE customer_id = ? ORDER BY created_at DESC').bind(customer.id).all<{ id: string; payload_json: string }>();
      return json({ orders: (rows.results || []).map((r) => JSON.parse(r.payload_json)) });
    }

    if (pathname === '/api/account/orders' && request.method === 'POST') {
      const body = await readJson(request);
      const email = String(body?.email || '').trim().toLowerCase();
      const order = body?.order;
      if (!email || !order?.id) {
        return json({ error: 'Missing email or order' }, { status: 400 });
      }
      try {
        if (!env.DB) {
          return json({ ok: true, persisted: false });
        }

        const customerId = customerIdFromEmail(email);
        await env.DB.prepare(
          'INSERT INTO customers (id, email, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?) ON CONFLICT(email) DO NOTHING'
        ).bind(
          customerId,
          email,
          String(body?.firstName || 'Client'),
          String(body?.lastName || ''),
          String(body?.phone || '')
        ).run();
        await env.DB.prepare(
          'INSERT OR REPLACE INTO orders (id, customer_id, payload_json) VALUES (?, ?, ?)'
        ).bind(order.id, customerId, JSON.stringify(order)).run();
        return json({ ok: true, persisted: true });
      } catch (error) {
        console.error('Failed to persist order', error);
        return json({ ok: true, persisted: false });
      }
    }

    // Admin: fulfill an order by copying digital PDFs into R2, updating order payload, sending email, and logging audit
    if (pathname === '/api/account/orders/fulfill' && request.method === 'POST') {
      const body = await readJson(request);
      const orderId = String(body?.orderId || '');
      if (!orderId) return json({ error: 'Missing orderId' }, { status: 400 });

      // Admin authentication: require X-Admin-Secret header matching env.ADMIN_SECRET
      const adminSecretHeader = request.headers.get('x-admin-secret') || '';
      if (!env.ADMIN_SECRET || !adminSecretHeader || adminSecretHeader !== env.ADMIN_SECRET) {
        return json({ error: 'Unauthorized' }, { status: 401 });
      }

      try {
        const orderRow = await env.DB.prepare('SELECT customer_id, payload_json FROM orders WHERE id = ?').bind(orderId).first<{ customer_id: string; payload_json: string }>();
        if (!orderRow?.payload_json) return json({ error: 'Order not found' }, { status: 404 });

        const customerId = orderRow.customer_id;
        const order = JSON.parse(orderRow.payload_json) as { items?: Array<{ bookId: string; digitalPdfUrl?: string; format?: string; title?: string }>; paymentStatus?: string; orderStatus?: string; customer?: { email?: string } };

        // For each digital item, fetch the source PDF and put into R2 under customer-pdfs/{orderId}/{bookId}.pdf
        const downloadUrls: string[] = [];
        for (const item of (order.items || [])) {
          if (!(item.format === 'numerique_pdf' || item.format === 'pack_duo')) continue;
          const srcUrl = item.digitalPdfUrl;
          if (!srcUrl) continue;

          try {
            const res = await fetch(srcUrl);
            if (!res.ok) {
              console.warn('Failed to fetch source PDF', srcUrl, res.status);
              continue;
            }
            const arrayBuffer = await res.arrayBuffer();
            const key = makePrivatePdfKey(orderId, item.bookId);
            // store in R2
            await env.PDFS.put(key, arrayBuffer, { httpMetadata: { contentType: 'application/pdf' } });
            // update item's digitalPdfUrl to point to the worker download endpoint
            const downloadUrl = `${env.SITE_URL.replace(/\/$/, '')}/api/download/${orderId}/${item.bookId}`;
            item.digitalPdfUrl = downloadUrl;
            downloadUrls.push(downloadUrl);
          } catch (err) {
            console.error('Error copying PDF for', item.bookId, err);
          }
        }

        // mark order as paid/fulfilled by admin action
        order.paymentStatus = 'paye';
        // optional: set orderStatus to a fulfilled state
        order.orderStatus = order.orderStatus || 'completed';

        // persist updated order payload
        await env.DB.prepare('UPDATE orders SET payload_json = ? WHERE id = ?').bind(JSON.stringify(order), orderId).run();

        // create audit table if not exists and insert an audit row
        try {
          await env.DB.prepare('CREATE TABLE IF NOT EXISTS orders_audit (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id TEXT, action TEXT, actor TEXT, timestamp TEXT, details TEXT)').run();
          await env.DB.prepare('INSERT INTO orders_audit (order_id, action, actor, timestamp, details) VALUES (?, ?, ?, ?, ?)')
            .bind(orderId, 'fulfill', adminSecretHeader ? 'admin' : 'unknown', new Date().toISOString(), JSON.stringify({ downloadUrls }))
            .run();
        } catch (auditErr) {
          console.warn('Failed to write audit log', auditErr);
        }

        // send an email notification to the customer if SENDGRID_API_KEY is configured
        try {
          const customerEmail = order.customer?.email || '';
          if (env.SENDGRID_API_KEY && customerEmail && downloadUrls.length) {
            const msg = {
              personalizations: [{ to: [{ email: customerEmail }], subject: 'Votre commande est prête — Téléchargement' }],
              from: { email: 'no-reply@livres-de-jean.fr', name: 'Livres de Jean' },
              content: [
                { type: 'text/plain', value: `Bonjour,\n\nVotre commande ${orderId} a été traitée. Téléchargez vos fichiers ici:\n\n${downloadUrls.join('\n')}\n\nMerci.` }
              ]
            };

            await fetch('https://api.sendgrid.com/v3/mail/send', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${env.SENDGRID_API_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(msg)
            });

            // insert audit entry for email
            try {
              await env.DB.prepare('INSERT INTO orders_audit (order_id, action, actor, timestamp, details) VALUES (?, ?, ?, ?, ?)')
                .bind(orderId, 'email_sent', 'system', new Date().toISOString(), JSON.stringify({ to: customerEmail, downloadUrls }))
                .run();
            } catch (emailAuditErr) {
              console.warn('Failed to write email audit log', emailAuditErr);
            }
          }
        } catch (emailErr) {
          console.warn('Failed to send email', emailErr);
        }

        return json({ ok: true, orderId, downloadUrls });
      } catch (err) {
        console.error('Failed to fulfill order', err);
        return json({ error: 'Failed to fulfill order' }, { status: 500 });
      }
    }

    if (pathname === '/api/account/digital' && request.method === 'GET') {
      const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || url.searchParams.get('token') || '';
      const session = token ? await verifyCustomerToken(env, token) : null;
      if (!session?.email) {
        return json({ error: 'Unauthorized' }, { status: 401 });
      }

      const customer = await env.DB.prepare('SELECT id FROM customers WHERE email = ?').bind(session.email).first<{ id: string }>();
      if (!customer?.id) return json({ downloads: [] });

      const rows = await env.DB.prepare('SELECT id, payload_json FROM orders WHERE customer_id = ? ORDER BY created_at DESC').bind(customer.id).all<{ id: string; payload_json: string }>();
      const downloads = (rows.results || []).flatMap((row) => {
        const order = JSON.parse(row.payload_json) as { items?: Array<{ bookId: string; title: string; format: string }> };
        return (order.items || [])
          .filter((item) => item.format === 'numerique_pdf' || item.format === 'pack_duo')
          .map((item) => ({
            orderId: row.id,
            bookId: item.bookId,
            title: item.title,
            downloadUrl: `/api/download/${row.id}/${item.bookId}`
          }));
      });

      return json({ downloads });
    }

    if (pathname.startsWith('/api/download/') && request.method === 'GET') {
      const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || url.searchParams.get('token') || '';
      const session = token ? await verifyCustomerToken(env, token) : null;
      const fallbackEmail = url.searchParams.get('email')?.toLowerCase() || '';
      const email = session?.email || fallbackEmail;
      if (!email) {
        return json({ error: 'Unauthorized' }, { status: 401 });
      }

      const [, , orderId, bookId] = pathname.split('/');
      if (!orderId || !bookId) {
        return json({ error: 'Missing order or book' }, { status: 400 });
      }

      const customer = await env.DB.prepare('SELECT id FROM customers WHERE email = ?').bind(email).first<{ id: string }>();
      if (!customer?.id) return json({ error: 'Customer not found' }, { status: 404 });

      const orderRow = await env.DB.prepare('SELECT payload_json FROM orders WHERE id = ? AND customer_id = ?').bind(orderId, customer.id).first<{ payload_json: string }>();
      let orderJson = orderRow?.payload_json || '';
      if (!orderJson) {
        const fallbackRows = await env.DB.prepare('SELECT payload_json FROM orders WHERE customer_id = ? ORDER BY created_at DESC').bind(customer.id).all<{ payload_json: string }>();
        const fallbackOrder = (fallbackRows.results || []).map((row) => JSON.parse(row.payload_json) as { items?: Array<{ bookId: string; format: string }>; paymentStatus?: string }).find((order) =>
          order.items?.some((entry) => entry.bookId === bookId && (entry.format === 'numerique_pdf' || entry.format === 'pack_duo'))
        );
        if (!fallbackOrder) return json({ error: 'Order not found' }, { status: 404 });
        orderJson = JSON.stringify(fallbackOrder);
      }

      const order = JSON.parse(orderJson) as { paymentStatus?: string; items?: Array<{ bookId: string; format: string; digitalPdfUrl?: string }> };
      if (order.paymentStatus !== 'paye') {
        return json({ error: 'Payment not validated' }, { status: 403 });
      }

      const item = order.items?.find((entry) => entry.bookId === bookId && (entry.format === 'numerique_pdf' || entry.format === 'pack_duo'));
      if (!item) {
        return json({ error: 'Digital entitlement not found' }, { status: 403 });
      }

      const keyCandidates = [makePrivatePdfKey(orderId, bookId), makeRootPdfKey(bookId)];
      let object: R2ObjectBody | null = null;
      for (const key of keyCandidates) {
        object = await env.PDFS.get(key);
        if (object) break;
      }
      if (!object) {
        return json({ error: 'PDF not found in storage' }, { status: 404 });
      }

      const headers = new Headers();
      headers.set('content-type', 'application/pdf');
      headers.set('content-disposition', `attachment; filename="${bookId}.pdf"`);
      headers.set('cache-control', 'private, max-age=60');
      return new Response(object.body, { headers });
    }

    if (
      (pathname === '/api/payments/stripe' || pathname === '/checkout/stripe') &&
      request.method === 'POST'
    ) {
      const total = await readTotal(request);
      if (!Number.isFinite(total) || total <= 0) {
        return json({ error: 'Invalid total' }, { status: 400 });
      }

      try {
        const session = await stripeCheckoutSession(env, total);
        return json({
          provider: 'stripe',
          total,
          sessionId: session.id,
          checkoutUrl: session.url,
          successUrl: env.STRIPE_RETURN_URL,
          cancelUrl: env.STRIPE_CANCEL_URL
        });
      } catch (error) {
        return json(
          { error: error instanceof Error ? error.message : 'Stripe checkout failed' },
          { status: 500 }
        );
      }
    }

    if (
      (pathname === '/api/payments/paypal' || pathname === '/checkout/paypal') &&
      request.method === 'POST'
    ) {
      const total = await readTotal(request);
      if (!Number.isFinite(total) || total <= 0) {
        return json({ error: 'Invalid total' }, { status: 400 });
      }

      try {
        const order = await paypalCreateOrder(env, total);
        return json({
          provider: 'paypal',
          total,
          orderId: order.id,
          approveUrl: order.approveUrl,
          returnUrl: env.PAYPAL_RETURN_URL,
          cancelUrl: env.PAYPAL_CANCEL_URL
        });
      } catch (error) {
        return json(
          { error: error instanceof Error ? error.message : 'PayPal order failed' },
          { status: 500 }
        );
      }
    }

    if ((pathname === '/api/payments/paypal/complete' || pathname === '/checkout/paypal/complete') && request.method === 'GET') {
      const orderId = url.searchParams.get('token');
      if (!orderId) {
        return json({ error: 'Missing PayPal token' }, { status: 400 });
      }

      try {
        const capture = await paypalCaptureOrder(env, orderId);
        const redirectUrl = new URL(env.PAYPAL_SUCCESS_URL);
        redirectUrl.searchParams.set('payment', 'paypal-success');
        redirectUrl.searchParams.set('token', orderId);
        if (capture.id) {
          redirectUrl.searchParams.set('captureId', capture.id);
        }
        return Response.redirect(redirectUrl.toString(), 302);
      } catch (error) {
        const redirectUrl = new URL(env.PAYPAL_CANCEL_URL);
        redirectUrl.searchParams.set('payment', 'paypal-error');
        redirectUrl.searchParams.set('token', orderId);
        return Response.redirect(redirectUrl.toString(), 302);
      }
    }

    return new Response('Not found', { status: 404, headers: corsHeaders });
  }
};
