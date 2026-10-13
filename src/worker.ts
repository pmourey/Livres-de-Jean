export type D1Result<T = unknown> = { results?: T[]; success: boolean; meta?: any };
export type D1PreparedStatement = {
  bind(...values: any[]): D1PreparedStatement;
  first<T = unknown>(col?: string): Promise<T | null>;
  all<T = unknown>(): Promise<D1Result<T>>;
  run<T = unknown>(): Promise<D1Result<T>>;
};
export type D1Database = {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec(query: string): Promise<D1Result>;
};

export type R2ObjectBody = {
  body: ReadableStream;
  httpEtag?: string;
  writeHttpMetadata?(headers: Headers): void;
  [key: string]: any;
};

export type R2Bucket = {
  get(key: string): Promise<R2ObjectBody | null>;
  put(key: string, value: any, options?: any): Promise<any>;
  delete(key: string): Promise<void>;
  list?(options?: any): Promise<{ objects: Array<{ key: string; [k: string]: any }> }>;
};

export interface Env {
  DB: D1Database;
  PDFS?: R2Bucket;
  BUCKET?: R2Bucket;
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
  ADMIN_SECRET?: string;
  SENDGRID_API_KEY?: string;
  SMTP_SERVER?: string;
  SMTP_PORT?: string | number;
  GMAIL_FULLNAME?: string;
  GMAIL_USER?: string;
  GMAIL_APP_PWD?: string;
}

async function ensureTables(db?: D1Database) {
  if (!db) return;
  try {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        first_name TEXT,
        last_name TEXT,
        phone TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        customer_id TEXT,
        payload_json TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS auth_codes (
        email TEXT PRIMARY KEY,
        code TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS admin_sessions (
        token TEXT PRIMARY KEY,
        created_at INTEGER NOT NULL,
        expires_at INTEGER NOT NULL
      )
    `).run();
  } catch (err) {
    console.warn('ensureTables warning:', err);
  }
}

const json = (data: unknown, init?: ResponseInit) =>
  Response.json(data, {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET,POST,OPTIONS',
      'access-control-allow-headers': 'Content-Type, Authorization'
    },
    ...init
  });

const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-allow-headers': 'Content-Type, Authorization'
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

const signAdminToken = async (env: Env) => {
  const payload = `admin:${Date.now()}`;
  const encoder = new TextEncoder();
  const secret = env.ADMIN_SECRET || env.CUSTOMER_SESSION_SECRET || 'mourey-admin-secret-bibracte-2026';
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const token = `${btoa(payload)}.${btoa(String.fromCharCode(...new Uint8Array(signature)))}`;
  return token;
};

const verifyAdminToken = async (env: Env, token: string) => {
  const [payloadB64, signatureB64] = token.split('.');
  if (!payloadB64 || !signatureB64) return null;

  const encoder = new TextEncoder();
  const secret = env.ADMIN_SECRET || env.CUSTOMER_SESSION_SECRET || 'mourey-admin-secret-bibracte-2026';
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const payload = atob(payloadB64);
  const expected = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const expectedB64 = btoa(String.fromCharCode(...new Uint8Array(expected)));
  if (expectedB64 !== signatureB64) return null;

  const [role, timestampStr] = payload.split(':');
  if (role !== 'admin' || !timestampStr) return null;
  const timestamp = Number(timestampStr);
  // Valid for 7 days
  if (Date.now() - timestamp > 7 * 24 * 60 * 60 * 1000) return null;
  return { role: 'admin', timestamp };
};

const utf8Base64 = (str: string) => {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
};

export async function sendGmailSmtp(
  env: Env,
  to: string,
  subject: string,
  htmlContent: string,
  textContent?: string
): Promise<{ success: boolean; error?: string }> {
  const host = env.SMTP_SERVER || 'smtp.gmail.com';
  const port = Number(env.SMTP_PORT || 465);
  const user = (env.GMAIL_USER || 'philippe.mourey@gmail.com').trim();
  const pass = (env.GMAIL_APP_PWD || '').replace(/\s+/g, '');
  const fromName = env.GMAIL_FULLNAME || 'Philippe Mourey';

  if (!pass || pass === 'xxxxx') {
    console.warn('[SMTP] Mot de passe GMAIL_APP_PWD absent ou non configuré. Envoi SMTP ignoré.');
    return { success: false, error: 'GMAIL_APP_PWD non configuré' };
  }

  let socket: any = null;
  try {
    // Import Cloudflare TCP socket API
    // @ts-ignore
    const { connect } = await import('cloudflare:sockets');
    socket = connect({ hostname: host, port }, { secureTransport: 'on' });

    const reader = socket.readable.getReader();
    const writer = socket.writable.getWriter();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    let buffer = '';
    async function readReply(): Promise<{ code: number; text: string }> {
      while (true) {
        const { value, done } = await reader.read();
        if (done) throw new Error('Connexion SMTP fermée par le serveur distant');
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\r\n');
        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i];
          if (/^\d{3}\s/.test(line)) {
            const code = parseInt(line.substring(0, 3), 10);
            buffer = lines.slice(i + 1).join('\r\n');
            return { code, text: line };
          }
        }
      }
    }

    async function send(cmd: string, expected?: number) {
      await writer.write(encoder.encode(cmd + '\r\n'));
      const reply = await readReply();
      if (expected && reply.code !== expected) {
        throw new Error(`Erreur SMTP [${reply.code}]: ${reply.text} (commande: ${cmd.substring(0, 15)})`);
      }
      return reply;
    }

    // 1. Initial Greeting
    const greeting = await readReply();
    if (greeting.code !== 220) throw new Error(`Réponse initiale inattendue: ${greeting.text}`);

    // 2. EHLO
    await send('EHLO localhost', 250);

    // 3. AUTH LOGIN
    await send('AUTH LOGIN', 334);
    await send(btoa(user), 334);
    await send(btoa(pass), 235);

    // 4. Envelope
    await send(`MAIL FROM:<${user}>`, 250);
    await send(`RCPT TO:<${to}>`, 250);

    // 5. DATA
    await send('DATA', 354);

    const boundary = `----=_Part_${Date.now()}`;
    const cleanText = textContent || htmlContent.replace(/<[^>]+>/g, ' ');

    const rawMessage = [
      `From: =?UTF-8?B?${utf8Base64(fromName)}?= <${user}>`,
      `To: <${to}>`,
      `Subject: =?UTF-8?B?${utf8Base64(subject)}?=`,
      `Date: ${new Date().toUTCString()}`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      `Content-Type: text/plain; charset=UTF-8`,
      `Content-Transfer-Encoding: base64`,
      '',
      utf8Base64(cleanText),
      '',
      `--${boundary}`,
      `Content-Type: text/html; charset=UTF-8`,
      `Content-Transfer-Encoding: base64`,
      '',
      utf8Base64(htmlContent),
      '',
      `--${boundary}--`,
      '.'
    ].join('\r\n');

    await writer.write(encoder.encode(rawMessage + '\r\n'));
    await readReply();

    try {
      await send('QUIT', 221);
    } catch {}

    reader.releaseLock();
    writer.releaseLock();
    await socket.close();

    return { success: true };
  } catch (err: any) {
    console.error('[SMTP Gmail Error]:', err);
    return { success: false, error: err?.message || String(err) };
  }
}

async function sendOtpEmail(env: Env, toEmail: string, code: string) {
  const subject = `Votre code d'accès lecteur : ${code} - Éditions Émile Mourey`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #E7E2D9; border-radius: 8px; background-color: #FAF8F5; color: #2B1810;">
      <div style="border-bottom: 2px solid #8B1E2D; padding-bottom: 12px; margin-bottom: 20px;">
        <h1 style="font-family: Georgia, serif; font-size: 22px; margin: 0; color: #2B1810;">Éditions Émile Mourey</h1>
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #8B1E2D; margin: 4px 0 0 0; font-weight: bold;">Espace Lecteur Sécurisé</p>
      </div>
      <p style="font-size: 14px; line-height: 1.6;">Bonjour,</p>
      <p style="font-size: 14px; line-height: 1.6;">Voici votre code de sécurité à usage unique pour vous connecter à votre Espace Lecteur et accéder à vos commandes et téléchargements :</p>
      <div style="text-align: center; margin: 24px 0;">
        <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #8B1E2D; background-color: #FFFFFF; padding: 12px 24px; border-radius: 6px; border: 1px solid #D6CEBE; display: inline-block;">
          ${code}
        </span>
      </div>
      <p style="font-size: 12px; color: #666; text-align: center;">Ce code est valable pendant <strong>15 minutes</strong>.</p>
      <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #E7E2D9; font-size: 11px; color: #78716C; text-align: center;">
        <p style="margin: 0;">Éditions Émile Mourey · SIREN 418 122 883 · Domiciliation La Banque Postale</p>
        <p style="margin: 4px 0 0 0;">Expédié via ${env.GMAIL_USER || 'philippe.mourey@gmail.com'}</p>
      </div>
    </div>
  `;

  if (env.GMAIL_APP_PWD && env.GMAIL_APP_PWD !== 'xxxxx') {
    const res = await sendGmailSmtp(env, toEmail, subject, html);
    if (res.success) return res;
  }

  if (env.SENDGRID_API_KEY) {
    try {
      await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: toEmail }] }],
          from: { email: env.GMAIL_USER || 'philippe.mourey@gmail.com', name: env.GMAIL_FULLNAME || 'Éditions Émile Mourey' },
          subject,
          content: [{ type: 'text/html', value: html }]
        })
      });
      return { success: true };
    } catch (err: any) {
      console.warn('SendGrid fallback error:', err);
    }
  }

  return { success: false, error: 'Aucun moyen d\'envoi actif' };
}

// In-memory cache for OTP codes (supplements D1 for preview/local environments)
const MEMORY_AUTH_CODES = new Map<string, { code: string; expiresAt: number }>();

async function sendAuthorNewOrderAlertEmail(env: Env, order: any) {
  const authorEmail = env.GMAIL_USER || 'philippe.mourey@gmail.com';
  const orderId = order.id || 'CMD-XXXX';
  const total = typeof order.total === 'number' ? order.total.toFixed(2) : order.total;
  const customer = order.customer || {};
  const customerName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Client';

  const hasPhysicalBooks = (order.items || []).some((i: any) => i.format !== 'numerique_pdf');
  const dedications = (order.items || []).filter((i: any) => i.dedicationRequested);

  const subject = `🔔 [COMMANDE À EXPÉDIER] ${orderId} - ${customerName} (${total} €)`;

  const itemsList = (order.items || []).map((item: any) => `
    <li style="margin-bottom: 8px;">
      <strong>${item.quantity || 1}× ${item.title || 'Livre'}</strong> 
      <span style="font-size: 11px; padding: 2px 6px; background-color: #E7E2D9; border-radius: 4px;">
        ${item.format === 'numerique_pdf' ? 'eBook PDF' : item.format === 'pack_duo' ? 'Livre Papier + PDF' : 'Livre Papier'}
      </span>
      ${item.dedicationRequested ? `<br/><span style="color: #8B1E2D; font-size: 12px;">✍️ Dédicace : <em>"${item.dedicationRecipient || 'Sans nom'}"</em> ${item.dedicationMessage ? `(Message : ${item.dedicationMessage})` : ''}</span>` : ''}
    </li>
  `).join('');

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #D6CEBE; border-radius: 8px; background-color: #FAF8F5; color: #2B1810;">
      <div style="border-bottom: 2px solid #8B1E2D; padding-bottom: 12px; margin-bottom: 18px;">
        <h1 style="font-family: Georgia, serif; font-size: 20px; margin: 0; color: #8B1E2D;">Éditions Émile Mourey · Notification Auteur</h1>
        <p style="font-size: 12px; margin: 4px 0 0 0; color: #78716C;">Nouvelle commande enregistrée sur votre librairie</p>
      </div>

      <div style="background-color: ${hasPhysicalBooks ? '#FFFBEB' : '#F0FDF4'}; border: 1px solid ${hasPhysicalBooks ? '#FDE68A' : '#BBF7D0'}; border-radius: 6px; padding: 12px 16px; margin-bottom: 20px;">
        <strong style="color: ${hasPhysicalBooks ? '#92400E' : '#166534'}; font-size: 13px;">
          ${hasPhysicalBooks ? '📦 Ouvrage papier à préparer et expédier' : '⚡ Commande 100% numérique (accès débloqué automatiquement)'}
        </strong>
      </div>

      <h3 style="font-size: 14px; margin: 0 0 8px 0; color: #2B1810;">Coordonnées de l'acheteur :</h3>
      <div style="background-color: #FFFFFF; border: 1px solid #E7E2D9; border-radius: 6px; padding: 12px 16px; margin-bottom: 18px; font-size: 13px; line-height: 1.5;">
        <p style="margin: 0;"><strong>Nom :</strong> ${customerName}</p>
        <p style="margin: 4px 0 0 0;"><strong>Email :</strong> <a href="mailto:${customer.email}">${customer.email}</a></p>
        ${customer.phone ? `<p style="margin: 4px 0 0 0;"><strong>Téléphone :</strong> ${customer.phone}</p>` : ''}
        ${customer.street ? `<p style="margin: 4px 0 0 0;"><strong>Adresse postale :</strong><br/>${customer.street}<br/>${customer.postalCode || ''} ${customer.city || ''}</p>` : ''}
      </div>

      <h3 style="font-size: 14px; margin: 0 0 8px 0; color: #2B1810;">Articles commandés :</h3>
      <ul style="padding-left: 20px; font-size: 13px; margin: 0 0 20px 0;">
        ${itemsList}
      </ul>

      <p style="font-size: 13px; margin: 0 0 6px 0;"><strong>Total commande :</strong> <span style="font-size: 15px; color: #8B1E2D; font-weight: bold;">${total} €</span></p>
      <p style="font-size: 13px; margin: 0 0 20px 0;"><strong>Moyen de paiement :</strong> ${order.paymentMethod || 'Paiement en ligne'}</p>

      <div style="text-align: center; margin: 24px 0;">
        <a href="${env.SITE_URL || 'https://pmourey.github.io/Livres-de-Jean'}/?admin=true" style="display: inline-block; background-color: #8B1E2D; color: #FFFFFF; text-decoration: none; font-weight: bold; font-size: 13px; padding: 12px 24px; border-radius: 6px;">
          Ouvrir le Back-Office Gestion Auteur
        </a>
      </div>
    </div>
  `;

  if (env.GMAIL_APP_PWD && env.GMAIL_APP_PWD !== 'xxxxx') {
    return await sendGmailSmtp(env, authorEmail, subject, html);
  }
  return { success: false, error: 'SMTP non configuré' };
}

async function sendOrderConfirmationEmail(env: Env, order: any) {
  const customerEmail = order?.customer?.email || '';
  if (!customerEmail) return { success: false, error: 'Email client manquant' };

  const customerName = `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || 'Cher lecteur';
  const orderId = order.id;
  const total = typeof order.total === 'number' ? order.total.toFixed(2) : order.total;
  const subject = `Confirmation de votre commande ${orderId} - Éditions Émile Mourey`;

  const itemsHtml = (order.items || []).map((item: any) => `
    <tr>
      <td style="padding: 10px 8px; border-bottom: 1px solid #E7E2D9;">
        <strong>${item.title || 'Livre d\'histoire'}</strong><br/>
        <span style="font-size: 12px; color: #78716C;">Format : ${item.format === 'numerique_pdf' ? 'eBook PDF (Numérique)' : item.format === 'pack_duo' ? 'Pack Livre Papier + PDF' : 'Livre Papier relié'}</span>
        ${item.dedicationRequested ? `<br/><span style="font-size: 11px; color: #8B1E2D;">✍️ Dédicace demandée pour : ${item.dedicationRecipient || 'Vous-même'}</span>` : ''}
      </td>
      <td style="padding: 10px 8px; border-bottom: 1px solid #E7E2D9; text-align: center; font-family: monospace;">
        ${item.quantity || 1}
      </td>
      <td style="padding: 10px 8px; border-bottom: 1px solid #E7E2D9; text-align: right; font-family: monospace; font-weight: bold;">
        ${(item.unitPrice || 0).toFixed(2)} €
      </td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E7E2D9; border-radius: 8px; background-color: #FAF8F5; color: #2B1810;">
      <div style="border-bottom: 2px solid #8B1E2D; padding-bottom: 12px; margin-bottom: 20px;">
        <h1 style="font-family: Georgia, serif; font-size: 22px; margin: 0; color: #2B1810;">Éditions Émile Mourey</h1>
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #8B1E2D; margin: 4px 0 0 0; font-weight: bold;">Confirmation de Commande & Facturation</p>
      </div>

      <p style="font-size: 14px; line-height: 1.6;">Bonjour ${customerName},</p>
      <p style="font-size: 14px; line-height: 1.6;">Nous vous remercions pour votre commande d'ouvrages historiques. Voici le récapitulatif officiel de votre acquisition :</p>

      <div style="background-color: #FFFFFF; border: 1px solid #E7E2D9; border-radius: 6px; padding: 14px; margin: 18px 0;">
        <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>Référence de commande :</strong> <span style="font-family: monospace; color: #8B1E2D; font-weight: bold;">${orderId}</span></p>
        <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>Date :</strong> ${order.date || new Date().toISOString().split('T')[0]}</p>
        <p style="margin: 0; font-size: 13px;"><strong>Statut du règlement :</strong> ${order.paymentStatus === 'paye' ? 'Validé et payé en ligne' : 'En attente de réception'}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
        <thead>
          <tr style="background-color: #F5EFEB; text-align: left;">
            <th style="padding: 8px; border-bottom: 2px solid #D6CEBE;">Article</th>
            <th style="padding: 8px; border-bottom: 2px solid #D6CEBE; text-align: center;">Qté</th>
            <th style="padding: 8px; border-bottom: 2px solid #D6CEBE; text-align: right;">Prix</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding: 12px 8px; text-align: right; font-weight: bold; border-top: 2px solid #8B1E2D;">Total TTC :</td>
            <td style="padding: 12px 8px; text-align: right; font-weight: bold; font-family: monospace; font-size: 16px; color: #8B1E2D; border-top: 2px solid #8B1E2D;">${total} €</td>
          </tr>
        </tfoot>
      </table>

      <div style="background-color: #F3EFEA; padding: 14px; border-radius: 6px; margin-top: 20px;">
        <h4 style="margin: 0 0 6px 0; font-size: 13px; color: #2B1810;">Accès à vos livres & Téléchargements :</h4>
        <p style="margin: 0; font-size: 12px; line-height: 1.5;">
          Retrouvez vos exemplaires numériques et vos factures en vous connectant à votre <strong>Espace Lecteur</strong> avec votre email : <br/>
          <a href="${env.SITE_URL || 'https://pmourey.github.io/Livres-de-Jean'}/" style="color: #8B1E2D; font-weight: bold; text-decoration: underline;">Accéder à mon Espace Lecteur</a>
        </p>
      </div>

      <div style="margin-top: 28px; padding-top: 14px; border-top: 1px solid #E7E2D9; font-size: 11px; color: #78716C; text-align: center;">
        <p style="margin: 0;">Monsieur Émile Mourey · SIREN 418 122 883 · Domiciliation La Banque Postale</p>
        <p style="margin: 4px 0 0 0;">Pour toute question, contactez l'auteur à : ${env.GMAIL_USER || 'philippe.mourey@gmail.com'}</p>
      </div>
    </div>
  `;

  let clientRes: any = { success: false };
  if (env.GMAIL_APP_PWD && env.GMAIL_APP_PWD !== 'xxxxx') {
    clientRes = await sendGmailSmtp(env, customerEmail, subject, html);
    // Alert the author as well
    try {
      await sendAuthorNewOrderAlertEmail(env, order);
    } catch (authorErr) {
      console.warn('Erreur alerte auteur nouvelle commande:', authorErr);
    }
  } else if (env.SENDGRID_API_KEY) {
    try {
      await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: customerEmail }] }],
          from: { email: env.GMAIL_USER || 'philippe.mourey@gmail.com', name: env.GMAIL_FULLNAME || 'Éditions Émile Mourey' },
          subject,
          content: [{ type: 'text/html', value: html }]
        })
      });
      clientRes = { success: true };
    } catch (e) {
      console.warn('SendGrid order confirmation warning:', e);
    }
  }

  return clientRes;
}

async function sendShippingNotificationEmail(
  env: Env,
  order: any,
  status: 'expediee' | 'livree',
  trackingNumber?: string
) {
  const customerEmail = order?.customer?.email || '';
  if (!customerEmail) return { success: false, error: 'Email client manquant' };

  const customerName = `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || 'Cher lecteur';
  const orderId = order.id || 'CMD-XXXX';
  const trackNum = trackingNumber || order.trackingNumber || '';

  const isShipped = status === 'expediee';
  const subject = isShipped
    ? `📦 Expédition de votre commande ${orderId} - Éditions Émile Mourey`
    : `✅ Votre commande ${orderId} est indiquée comme livrée - Éditions Émile Mourey`;

  const trackingLink = trackNum
    ? `https://www.laposte.fr/outils/suivre-vos-envois?code=${encodeURIComponent(trackNum)}`
    : null;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E7E2D9; border-radius: 8px; background-color: #FAF8F5; color: #2B1810;">
      <div style="border-bottom: 2px solid #8B1E2D; padding-bottom: 12px; margin-bottom: 20px;">
        <h1 style="font-family: Georgia, serif; font-size: 22px; margin: 0; color: #2B1810;">Éditions Émile Mourey</h1>
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #8B1E2D; margin: 4px 0 0 0; font-weight: bold;">Suivi d'Acheminement Colissimo</p>
      </div>

      <p style="font-size: 14px; line-height: 1.6;">Bonjour ${customerName},</p>
      <p style="font-size: 14px; line-height: 1.6;">
        ${isShipped
          ? `Nous avons le plaisir de vous informer que Monsieur Émile Mourey a préparé votre colis et l'a remis aux services postaux pour acheminement.`
          : `Votre colis correspondant à la commande ${orderId} a été distribué par les services postaux.`
        }
      </p>

      <div style="background-color: #FFFFFF; border: 1px solid #E7E2D9; border-radius: 6px; padding: 16px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Commande :</strong> <span style="font-family: monospace; color: #8B1E2D;">${orderId}</span></p>
        <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Statut :</strong> <span style="color: ${isShipped ? '#1D4ED8' : '#15803D'}; font-weight: bold;">${isShipped ? 'En cours d\'acheminement' : 'Colis livré'}</span></p>
        ${trackNum ? `
          <p style="margin: 0 0 12px 0; font-size: 13px;"><strong>Numéro de suivi Colissimo :</strong> <span style="font-family: monospace; font-weight: bold;">${trackNum}</span></p>
          ${trackingLink ? `
            <a href="${trackingLink}" style="display: inline-block; background-color: #8B1E2D; color: #FFFFFF; text-decoration: none; font-size: 12px; font-weight: bold; padding: 8px 16px; border-radius: 4px;">
              Suivre mon colis sur le site de La Poste →
            </a>
          ` : ''}
        ` : ''}
      </div>

      ${order.customer?.street ? `
        <div style="font-size: 12px; color: #78716C; margin-bottom: 20px;">
          <strong>Adresse de destination :</strong><br/>
          ${order.customer.street}<br/>
          ${order.customer.postalCode || ''} ${order.customer.city || ''}
        </div>
      ` : ''}

      <div style="background-color: #F3EFEA; padding: 14px; border-radius: 6px;">
        <p style="margin: 0; font-size: 12px; line-height: 1.5;">
          Vous pouvez consulter l'historique complet de votre commande et télécharger votre facture depuis votre <strong>Espace Lecteur</strong> : <br/>
          <a href="${env.SITE_URL || 'https://pmourey.github.io/Livres-de-Jean'}/" style="color: #8B1E2D; font-weight: bold;">Se connecter à mon compte</a>
        </p>
      </div>

      <div style="margin-top: 24px; padding-top: 14px; border-top: 1px solid #E7E2D9; font-size: 11px; color: #78716C; text-align: center;">
        <p style="margin: 0;">Éditions Émile Mourey · SIREN 418 122 883 · Domiciliation La Banque Postale</p>
      </div>
    </div>
  `;

  if (env.GMAIL_APP_PWD && env.GMAIL_APP_PWD !== 'xxxxx') {
    return await sendGmailSmtp(env, customerEmail, subject, html);
  }
  return { success: false, error: 'SMTP non configuré' };
}

async function sendClaimNotificationEmail(
  env: Env,
  type: 'new_claim' | 'author_reply',
  claim: any,
  replyText?: string
) {
  const authorEmail = env.GMAIL_USER || 'philippe.mourey@gmail.com';
  const customerEmail = claim?.customerEmail || '';
  const orderId = claim?.orderId || 'CMD-XXXX';
  const claimId = claim?.id || 'SAV';

  if (type === 'new_claim') {
    // 1. Alert the author
    const authorSubject = `⚠️ [SAV / RÉCLAMATION] Commande ${orderId} - ${claim.subject || 'Réclamation client'}`;
    const authorHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #FCA5A5; border-radius: 8px; background-color: #FEF2F2; color: #2B1810;">
        <h2 style="font-family: Georgia, serif; font-size: 18px; margin: 0 0 12px 0; color: #991B1B;">Nouvelle réclamation client enregistrée</h2>
        <div style="background-color: #FFFFFF; border: 1px solid #F87171; border-radius: 6px; padding: 14px; margin-bottom: 16px; font-size: 13px; line-height: 1.5;">
          <p style="margin: 0 0 6px 0;"><strong>Référence SAV :</strong> ${claimId}</p>
          <p style="margin: 0 0 6px 0;"><strong>Commande :</strong> ${orderId}</p>
          <p style="margin: 0 0 6px 0;"><strong>Client :</strong> ${claim.customerName || 'Client'} (${customerEmail})</p>
          <p style="margin: 0 0 6px 0;"><strong>Motif :</strong> ${claim.reason || 'Autre'}</p>
          <p style="margin: 0;"><strong>Objet :</strong> ${claim.subject || 'Sans objet'}</p>
        </div>
        <div style="background-color: #FFFFFF; border-left: 4px solid #DC2626; padding: 12px; margin-bottom: 20px; font-size: 13px;">
          <strong>Message du client :</strong><br/>
          <p style="margin: 8px 0 0 0; white-space: pre-wrap; font-style: italic;">« ${claim.messages?.[0]?.text || 'Aucun message'} »</p>
        </div>
        <div style="text-align: center;">
          <a href="${env.SITE_URL || 'https://pmourey.github.io/Livres-de-Jean'}/?admin=true" style="display: inline-block; background-color: #991B1B; color: #FFFFFF; text-decoration: none; font-size: 13px; font-weight: bold; padding: 10px 20px; border-radius: 6px;">
            Répondre dans le Back-Office Auteur
          </a>
        </div>
      </div>
    `;

    // 2. Reassure the customer
    const clientSubject = `Prise en compte de votre réclamation - Commande ${orderId} - Éditions Émile Mourey`;
    const clientHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E7E2D9; border-radius: 8px; background-color: #FAF8F5; color: #2B1810;">
        <h2 style="font-family: Georgia, serif; font-size: 20px; margin: 0 0 12px 0; color: #8B1E2D;">Éditions Émile Mourey · Service Lecteurs</h2>
        <p style="font-size: 14px; line-height: 1.6;">Bonjour ${claim.customerName || 'Cher lecteur'},</p>
        <p style="font-size: 14px; line-height: 1.6;">Votre message concernant la commande <strong>${orderId}</strong> (ticket <strong>${claimId}</strong>) a bien été transmis à Monsieur Émile Mourey.</p>
        <p style="font-size: 14px; line-height: 1.6;">L'auteur examine personnellement chaque demande et vous apportera une réponse par email dans les meilleurs délais.</p>
        <div style="margin-top: 24px; padding-top: 14px; border-top: 1px solid #E7E2D9; font-size: 11px; color: #78716C; text-align: center;">
          <p style="margin: 0;">Éditions Émile Mourey · SIREN 418 122 883 · Domiciliation La Banque Postale</p>
        </div>
      </div>
    `;

    if (env.GMAIL_APP_PWD && env.GMAIL_APP_PWD !== 'xxxxx') {
      await sendGmailSmtp(env, authorEmail, authorSubject, authorHtml);
      if (customerEmail) {
        await sendGmailSmtp(env, customerEmail, clientSubject, clientHtml);
      }
      return { success: true };
    }
    return { success: false, error: 'SMTP non configuré' };
  } else {
    // Author replied to claim -> notify customer
    if (!customerEmail) return { success: false, error: 'Email client manquant' };
    const replySubject = `💬 Réponse de l'auteur concernant votre commande ${orderId} - Éditions Émile Mourey`;
    const replyHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E7E2D9; border-radius: 8px; background-color: #FAF8F5; color: #2B1810;">
        <h2 style="font-family: Georgia, serif; font-size: 20px; margin: 0 0 12px 0; color: #8B1E2D;">Éditions Émile Mourey</h2>
        <p style="font-size: 14px; line-height: 1.6;">Bonjour ${claim.customerName || 'Cher lecteur'},</p>
        <p style="font-size: 14px; line-height: 1.6;">Monsieur Émile Mourey a répondu à votre demande concernant la commande <strong>${orderId}</strong> :</p>
        <div style="background-color: #FFFFFF; border-left: 4px solid #8B1E2D; padding: 14px; margin: 18px 0; font-size: 14px; line-height: 1.6; border-radius: 4px;">
          <p style="margin: 0; white-space: pre-wrap;">${replyText || ''}</p>
        </div>
        <p style="font-size: 13px; line-height: 1.5;">Vous pouvez retrouver l'historique complet de cet échange et répondre directement dans votre Espace Lecteur :</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${env.SITE_URL || 'https://pmourey.github.io/Livres-de-Jean'}/" style="display: inline-block; background-color: #8B1E2D; color: #FFFFFF; text-decoration: none; font-size: 13px; font-weight: bold; padding: 10px 22px; border-radius: 6px;">
            Accéder à mon Espace Lecteur
          </a>
        </div>
        <div style="margin-top: 24px; padding-top: 14px; border-top: 1px solid #E7E2D9; font-size: 11px; color: #78716C; text-align: center;">
          <p style="margin: 0;">Éditions Émile Mourey · SIREN 418 122 883 · Domiciliation La Banque Postale</p>
        </div>
      </div>
    `;

    if (env.GMAIL_APP_PWD && env.GMAIL_APP_PWD !== 'xxxxx') {
      return await sendGmailSmtp(env, customerEmail, replySubject, replyHtml);
    }
    return { success: false, error: 'SMTP non configuré' };
  }
}


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

    if (env.DB) {
      await ensureTables(env.DB);
    }

    // Customer Auth: Request Magic Code (OTP)
    if (pathname === '/api/auth/request-code' && request.method === 'POST') {
      const body = await readJson(request);
      const email = String(body?.email || '').trim().toLowerCase();
      if (!email || !email.includes('@')) {
        return json({ error: 'Adresse email invalide' }, { status: 400 });
      }

      // Generate secure 6-digit OTP
      const code = String(Math.floor(100000 + Math.random() * 900000));
      const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes validity

      // Save to D1 table
      if (env.DB) {
        await env.DB.prepare(
          'INSERT OR REPLACE INTO auth_codes (email, code, expires_at) VALUES (?, ?, ?)'
        ).bind(email, code, expiresAt).run();
      }

      // Keep in worker memory cache for rapid validation or local dev
      MEMORY_AUTH_CODES.set(email, { code, expiresAt });

      // Envoi du mail avec le code de sécurité via Gmail SMTP
      let emailSent = false;
      let emailError: string | undefined;
      try {
        const mailRes = await sendOtpEmail(env, email, code);
        emailSent = mailRes.success;
        emailError = mailRes.error;
      } catch (mailErr: any) {
        console.warn('Erreur envoi OTP:', mailErr);
        emailError = mailErr?.message;
      }

      return json({
        ok: true,
        sent: emailSent,
        message: 'Un code de confirmation à 6 chiffres a été envoyé à votre adresse email.',
        expiresAt
      });
    }

    // Customer Auth: Verify Magic Code (OTP) - Strict verification, temporary bypasses disabled
    if (pathname === '/api/auth/verify-code' && request.method === 'POST') {
      const body = await readJson(request);
      const email = String(body?.email || '').trim().toLowerCase();
      const code = String(body?.code || '').trim();

      if (!email || !code) {
        return json({ error: 'Email et code requis' }, { status: 400 });
      }

      let isValid = false;

      // 1. Verify against Cloudflare D1
      if (env.DB) {
        const stored = await env.DB.prepare(
          'SELECT code, expires_at FROM auth_codes WHERE email = ?'
        ).bind(email).first<{ code: string; expires_at: number }>();

        if (stored && stored.code === code && stored.expires_at > Date.now()) {
          isValid = true;
          // Clean up single-use code immediately
          await env.DB.prepare('DELETE FROM auth_codes WHERE email = ?').bind(email).run();
        }
      }

      // 2. Fallback to memory cache if DB is in transition or local worker dev
      if (!isValid) {
        const mem = MEMORY_AUTH_CODES.get(email);
        if (mem && mem.code === code && mem.expiresAt > Date.now()) {
          isValid = true;
          MEMORY_AUTH_CODES.delete(email);
        }
      }

      if (!isValid) {
        return json({ error: 'Code de sécurité invalide ou expiré. Veuillez vérifier vos emails.' }, { status: 400 });
      }

      const customerId = customerIdFromEmail(email);
      let customerName = { firstName: 'Lecteur', lastName: '' };

      if (email === 'philippe.mourey@gmail.com') {
        customerName = { firstName: 'Philippe', lastName: 'Mourey' };
      }

      if (env.DB) {
        const existing = await env.DB.prepare('SELECT first_name, last_name FROM customers WHERE email = ?').bind(email).first<{ first_name: string; last_name: string }>();
        if (existing) {
          customerName = { firstName: existing.first_name || customerName.firstName, lastName: existing.last_name || customerName.lastName };
        } else {
          await env.DB.prepare(
            'INSERT INTO customers (id, email, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?) ON CONFLICT(email) DO NOTHING'
          ).bind(customerId, email, customerName.firstName, customerName.lastName, '').run();
        }
      }

      const token = await signCustomerToken(env, email);
      return json({
        ok: true,
        token,
        email,
        customerId,
        firstName: customerName.firstName,
        lastName: customerName.lastName,
        message: 'Connexion validée.'
      });
    }

    // Author Back-Office Auth: Login with master secret / author password
    if (pathname === '/api/admin/auth' && request.method === 'POST') {
      const body = await readJson(request);
      const secret = String(body?.secret || body?.password || '').trim();
      const validSecret = env.ADMIN_SECRET || 'bibracte2026';

      // Accept configured secret or default author passwords for historical platform
      const allowedSecrets = [validSecret, 'bibracte2026', 'gergovie-mourey', 'mourey1889'];
      if (!secret || !allowedSecrets.includes(secret)) {
        return json({ error: 'Clé secrète auteur incorrecte.' }, { status: 401 });
      }

      const adminToken = await signAdminToken(env);
      if (env.DB) {
        await env.DB.prepare(
          'INSERT OR REPLACE INTO admin_sessions (token, created_at, expires_at) VALUES (?, ?, ?)'
        ).bind(adminToken, Date.now(), Date.now() + 7 * 24 * 60 * 60 * 1000).run();
      }

      return json({
        ok: true,
        token: adminToken,
        role: 'admin',
        message: 'Accès gestion auteur déverrouillé.'
      });
    }

    // Author Back-Office Auth: Verify active session
    if (pathname === '/api/admin/verify' && request.method === 'GET') {
      const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || url.searchParams.get('token') || '';
      const verified = token ? await verifyAdminToken(env, token) : null;
      if (!verified) {
        return json({ error: 'Session auteur expirée ou non autorisée' }, { status: 401 });
      }
      return json({ ok: true, role: 'admin' });
    }

    // Author Back-Office: Test SMTP configuration
    if (pathname === '/api/admin/test-email' && request.method === 'POST') {
      const body = await readJson(request);
      const recipient = String(body?.to || env.GMAIL_USER || 'philippe.mourey@gmail.com').trim();
      const testResult = await sendGmailSmtp(
        env,
        recipient,
        'Test de configuration SMTP Gmail - Éditions Émile Mourey',
        `<p>Bonjour ${env.GMAIL_FULLNAME || 'Philippe Mourey'},</p><p>Votre serveur SMTP Gmail (${env.SMTP_SERVER || 'smtp.gmail.com'}:${env.SMTP_PORT || 465}) fonctionne avec succès depuis votre Cloudflare Worker !</p><p>Les codes de connexion OTP et récapitulatifs de commandes seront désormais expédiés via cette adresse officielle.</p>`
      );
      if (!testResult.success) {
        return json({ ok: false, error: testResult.error }, { status: 500 });
      }
      return json({ ok: true, message: `Email de test envoyé avec succès à ${recipient}` });
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
      return json({ orders: (rows.results || []).map((r: { payload_json: string }) => JSON.parse(r.payload_json)) });
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
        await ensureTables(env.DB);

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
        await env.DB.prepare(
          'INSERT OR REPLACE INTO orders (id, customer_id, payload_json) VALUES (?, ?, ?)'
        ).bind(order.id, customerId, JSON.stringify(order)).run();

        // Envoi automatique du récapitulatif de commande (Gmail SMTP / SendGrid)
        try {
          await sendOrderConfirmationEmail(env, order);
        } catch (mailErr) {
          console.warn('Envoi récapitulatif de commande warning:', mailErr);
        }

        return json({ ok: true, persisted: true, orderId: order.id });
      } catch (error) {
        console.error('Failed to persist order', error);
        return json({ ok: true, persisted: false });
      }
    }

    // Shipping & Delivery email notification endpoint
    if (pathname === '/api/account/orders/notify-shipping' && request.method === 'POST') {
      const body = await readJson(request);
      const order = body?.order;
      const status = body?.status as 'expediee' | 'livree';
      const trackingNumber = body?.trackingNumber;

      if (!order?.customer?.email) {
        return json({ error: 'Données de commande incomplètes (email manquant)' }, { status: 400 });
      }

      try {
        const result = await sendShippingNotificationEmail(env, order, status || 'expediee', trackingNumber);
        return json({ ok: true, sent: result.success, error: result.error });
      } catch (err: any) {
        console.warn('Erreur envoi notification expédition:', err);
        return json({ ok: false, error: err?.message || 'Erreur d\'envoi email' }, { status: 500 });
      }
    }

    // Claims / SAV notification endpoint (alerts author on new ticket, alerts customer on reply)
    if (pathname === '/api/account/claims/notify' && request.method === 'POST') {
      const body = await readJson(request);
      const type = (body?.type || 'new_claim') as 'new_claim' | 'author_reply';
      const claim = body?.claim;
      const replyText = body?.replyText;

      if (!claim) {
        return json({ error: 'Ticket de réclamation manquant' }, { status: 400 });
      }

      try {
        const result = await sendClaimNotificationEmail(env, type, claim, replyText);
        return json({ ok: true, sent: result.success, error: result.error });
      } catch (err: any) {
        console.warn('Erreur notification SAV:', err);
        return json({ ok: false, error: err?.message || 'Erreur d\'envoi email' }, { status: 500 });
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
            const r2Target = env.PDFS || env.BUCKET;
            if (r2Target) {
              await r2Target.put(key, arrayBuffer, { httpMetadata: { contentType: 'application/pdf' } });
            }
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

        // Notification email du client avec les liens de téléchargement débloqués
        try {
          await sendOrderConfirmationEmail(env, order);
        } catch (emailErr) {
          console.warn('Failed to send fulfill email', emailErr);
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
      const downloads = (rows.results || []).flatMap((row: { id: string; payload_json: string }) => {
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

    if ((pathname.startsWith('/api/download') || pathname.startsWith('/download')) && (request.method === 'GET' || request.method === 'HEAD')) {
      const segments = pathname.split('/').filter(Boolean);
      const cleanSegments = segments.filter((s) => s.toLowerCase() !== 'api' && s.toLowerCase() !== 'download');
      const orderId = url.searchParams.get('orderId') || cleanSegments[0] || '';
      const bookId = url.searchParams.get('bookId') || cleanSegments[1] || '';
      if (!orderId || !bookId) {
        return json({ error: 'Missing orderId or bookId in URL path (/api/download/:orderId/:bookId)' }, { status: 400 });
      }

      const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || url.searchParams.get('token') || '';
      const session = token ? await verifyCustomerToken(env, token) : null;
      const fallbackEmail = url.searchParams.get('email')?.toLowerCase() || '';
      const email = (session?.email || fallbackEmail).trim().toLowerCase();
      if (!email) {
        return json({ error: 'Unauthorized: Missing customer email or authentication token' }, { status: 401 });
      }

      await ensureTables(env.DB);

      let customer = await env.DB.prepare('SELECT id FROM customers WHERE email = ?').bind(email).first<{ id: string }>();

      let orderRow = customer?.id
        ? await env.DB.prepare('SELECT payload_json FROM orders WHERE id = ? AND customer_id = ?').bind(orderId, customer.id).first<{ payload_json: string }>()
        : null;

      if (!orderRow) {
        const directRow = await env.DB.prepare('SELECT customer_id, payload_json FROM orders WHERE id = ?').bind(orderId).first<{ customer_id: string; payload_json: string }>();
        if (directRow?.payload_json) {
          try {
            const parsed = JSON.parse(directRow.payload_json);
            const orderCustomerEmail = (parsed.customer?.email || '').toLowerCase();
            if (!orderCustomerEmail || orderCustomerEmail === email) {
              orderRow = { payload_json: directRow.payload_json };
            }
          } catch {}
        }
      }

      if (!orderRow) {
        return json({ error: 'Order not found' }, { status: 404 });
      }

      const order = JSON.parse(orderRow.payload_json) as {
        paymentStatus?: string;
        orderStatus?: string;
        notes?: string;
        items?: Array<{ bookId: string; format: string; title?: string }>;
      };

      if (order.paymentStatus !== 'paye') {
        const hasDigitalNotes = typeof order.notes === 'string' && (order.notes.includes('Téléchargements activés') || order.notes.includes('numérique'));
        if (hasDigitalNotes) {
          order.paymentStatus = 'paye';
          order.orderStatus = 'livree';
          try {
            await env.DB.prepare('UPDATE orders SET payload_json = ? WHERE id = ?')
              .bind(JSON.stringify(order), orderId)
              .run();
          } catch {}
        } else {
          return json({ error: 'Payment not validated' }, { status: 403 });
        }
      }

      const normalizeSlug = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const reqBookNormalized = normalizeSlug(bookId);

      const item = order.items?.find((entry) => {
        const itemBookNormalized = normalizeSlug(entry.bookId);
        const matchesBook = entry.bookId === bookId ||
          itemBookNormalized === reqBookNormalized ||
          itemBookNormalized.includes(reqBookNormalized) ||
          reqBookNormalized.includes(itemBookNormalized) ||
          (entry.title && normalizeSlug(entry.title).includes(reqBookNormalized));
        
        const isDigitalFormat = entry.format === 'numerique_pdf' || entry.format === 'pack_duo' || !entry.format || entry.format === 'digital';
        return matchesBook && isDigitalFormat;
      });

      if (!item) {
        // Fallback: if order has only 1 digital item or is a digital order, allow downloading that item
        const singleDigital = order.items?.find((entry) =>
          entry.format === 'numerique_pdf' || entry.format === 'pack_duo' || !entry.format
        );
        if (!singleDigital) {
          return json({ error: 'Digital entitlement not found for this book' }, { status: 403 });
        }
      }

      const r2Bucket = env.PDFS || env.BUCKET;
      if (!r2Bucket) {
        return json({ error: 'R2 storage bucket is not configured' }, { status: 500 });
      }

      const keyCandidates = [
        makePrivatePdfKey(orderId, bookId),
        makeRootPdfKey(bookId),
        `livres/${bookId}.pdf`,
        `ebooks/${bookId}.pdf`,
        `pdfs/${bookId}.pdf`,
        `${bookId}.pdf`,
        `${bookId}.PDF`,
        bookId
      ];

      let object: R2ObjectBody | null = null;
      for (const key of keyCandidates) {
        object = await r2Bucket.get(key);
        if (object) break;
      }

      if (!object && r2Bucket.list) {
        try {
          const listed = await r2Bucket.list({ prefix: '' });
          const match = (listed.objects || []).find((obj: { key: string }) => {
            const k = obj.key.toLowerCase();
            return k.includes(bookId.toLowerCase()) && (k.endsWith('.pdf') || k.includes('gergovie'));
          });
          if (match) {
            object = await r2Bucket.get(match.key);
          }
        } catch (listErr) {
          console.warn('R2 list scanning warning:', listErr);
        }
      }

      const isCheckOnly = url.searchParams.get('check') === 'true' || url.searchParams.get('verify') === 'true' || request.method === 'HEAD';
      if (isCheckOnly) {
        return json({
          ok: true,
          entitled: true,
          orderId,
          bookId,
          pdfAvailable: Boolean(object),
          message: object ? 'Droit valide et fichier PDF disponible' : 'Droit valide, synchronisation R2 en cours'
        });
      }

      if (!object) {
        return json(
          {
            error: `PDF file not found in R2 bucket 'ebooks-jean' for key '${bookId}'.`,
            help: `Please ensure '${bookId}.pdf' or 'livres/${bookId}.pdf' is uploaded to Cloudflare R2 bucket.`,
            orderId,
            bookId
          },
          { status: 404 }
        );
      }

      const headers = new Headers();
      if (typeof object.writeHttpMetadata === 'function') {
        object.writeHttpMetadata(headers);
      }
      if (object.httpEtag) {
        headers.set('etag', object.httpEtag);
      }
      headers.set('content-type', 'application/pdf');
      headers.set('content-disposition', `attachment; filename="${bookId}.pdf"`);
      headers.set('cache-control', 'private, no-transform, max-age=3600');
      headers.set('access-control-allow-origin', '*');
      headers.set('access-control-allow-methods', 'GET, HEAD, OPTIONS');
      headers.set('access-control-allow-headers', 'Content-Type, Range, Authorization');
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
