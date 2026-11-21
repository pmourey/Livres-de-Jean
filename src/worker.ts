import { AGORAVOX_AUTHOR_PROFILES } from './data/agoravoxAuthorProfiles';

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
  MAIL_FULLNAME?: string;
  GMAIL_USER?: string;
  MAIL_USER?: string;
  GMAIL_APP_PWD?: string;
  MAIL_APP_PWD?: string;
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
  AI_BETA_FREE?: string;
}

let tablesEnsuredInIsolate = false;
let cachedIndexCounts: {
  chunks: number;
  agoravox: number;
  academic: number;
  cachedAt: number;
} | null = null;

async function ensureTables(db?: D1Database) {
  if (!db || tablesEnsuredInIsolate) return;
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
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        target_slug TEXT NOT NULL,
        user_id TEXT NOT NULL,
        author_name TEXT NOT NULL,
        content TEXT NOT NULL CHECK (length(content) <= 1500),
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        charter_accepted_at TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        moderated_at TEXT
      )
    `).run();
    await db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_comments_slug_status
      ON comments (target_slug, status, created_at DESC)
    `).run();
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS ai_subscriptions (
        user_id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        plan TEXT NOT NULL DEFAULT 'beta_free',
        status TEXT NOT NULL DEFAULT 'active',
        activated_at TEXT NOT NULL,
        expires_at TEXT
      )
    `).run();
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS book_chunks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book_id TEXT NOT NULL,
        book_title TEXT NOT NULL,
        tome TEXT DEFAULT '',
        page_number INTEGER NOT NULL DEFAULT 0,
        chapter TEXT DEFAULT '',
        chunk_index INTEGER NOT NULL DEFAULT 0,
        content TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS ai_shared_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        scope TEXT DEFAULT 'all',
        messages_json TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS academic_chunks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        doc_type TEXT NOT NULL DEFAULT 'article',
        title TEXT NOT NULL,
        authors TEXT NOT NULL DEFAULT '',
        published_year TEXT DEFAULT '',
        journal_or_institution TEXT DEFAULT '',
        source_url TEXT NOT NULL UNIQUE,
        theme TEXT DEFAULT '',
        content TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS ai_query_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT NOT NULL,
        scope TEXT NOT NULL DEFAULT 'all',
        use_google_search INTEGER NOT NULL DEFAULT 0,
        chunks_used INTEGER NOT NULL DEFAULT 0,
        agoravox_used INTEGER NOT NULL DEFAULT 0,
        academic_used INTEGER NOT NULL DEFAULT 0,
        web_sources_used INTEGER NOT NULL DEFAULT 0,
        model TEXT DEFAULT '',
        feedback INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
    tablesEnsuredInIsolate = true;
  } catch (err) {
    console.warn('ensureTables warning:', err);
  }
}

const json = (data: unknown, init?: ResponseInit) =>
  Response.json(data, {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET,POST,PATCH,OPTIONS',
      'access-control-allow-headers': 'Content-Type, Authorization'
    },
    ...init
  });

const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,PATCH,OPTIONS',
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

export function getGmailAppPwd(env: Env): string {
  return (env.GMAIL_APP_PWD || env.MAIL_APP_PWD || '').replace(/\s+/g, '');
}

export function getGmailUser(env: Env): string {
  return (env.GMAIL_USER || env.MAIL_USER || 'philippe.mourey@gmail.com').trim();
}

export function getGmailFullName(env: Env): string {
  return (env.GMAIL_FULLNAME || env.MAIL_FULLNAME || 'Philippe Mourey').trim();
}

export async function sendGmailSmtp(
  env: Env,
  to: string,
  subject: string,
  htmlContent: string,
  textContent?: string
): Promise<{ success: boolean; error?: string }> {
  const host = env.SMTP_SERVER || 'smtp.gmail.com';
  const port = Number(env.SMTP_PORT || 465);
  const user = getGmailUser(env);
  const pass = getGmailAppPwd(env);
  const fromName = getGmailFullName(env);

  if (!pass || pass === 'xxxxx') {
    console.warn('[SMTP] Mot de passe d\'application absent ou non configuré. Envoi SMTP ignoré.');
    return { success: false, error: 'Mot de passe d\'application (GMAIL_APP_PWD ou MAIL_APP_PWD) non configuré' };
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
        <p style="margin: 4px 0 0 0;">Expédié via ${getGmailUser(env)}</p>
      </div>
    </div>
  `;

  const appPwd = getGmailAppPwd(env);
  if (appPwd && appPwd !== 'xxxxx') {
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
          from: { email: getGmailUser(env), name: getGmailFullName(env) },
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

// In-memory fallback buffer for comments & shared AI sessions when D1 free tier daily row read limit is temporarily reached
type MemoryComment = {
  id: number;
  target_slug: string;
  user_id: string;
  author_name: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  charter_accepted_at: string;
  created_at: string;
  moderated_at: string | null;
};
const MEMORY_COMMENTS: MemoryComment[] = [];
let memoryCommentNextId = 90000;

const MEMORY_SHARED_SESSIONS = new Map<
  string,
  { id: string; user_id: string; title: string; scope: string; messages_json: string; created_at: string }
>();

async function sendAuthorNewOrderAlertEmail(env: Env, order: any) {
  const authorEmail = getGmailUser(env);
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

  const appPwd = getGmailAppPwd(env);
  if (appPwd && appPwd !== 'xxxxx') {
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
        <p style="margin: 4px 0 0 0;">Pour toute question, contactez l'auteur à : ${getGmailUser(env)}</p>
      </div>
    </div>
  `;

  let clientRes: any = { success: false };
  const clientAppPwd = getGmailAppPwd(env);
  if (clientAppPwd && clientAppPwd !== 'xxxxx') {
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
          from: { email: getGmailUser(env), name: getGmailFullName(env) },
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

  const appPwd = getGmailAppPwd(env);
  if (appPwd && appPwd !== 'xxxxx') {
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
  const authorEmail = getGmailUser(env);
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

    const appPwd = getGmailAppPwd(env);
    if (appPwd && appPwd !== 'xxxxx') {
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

    const appPwd = getGmailAppPwd(env);
    if (appPwd && appPwd !== 'xxxxx') {
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
    try {
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
        try {
          await env.DB.prepare(
            'INSERT OR REPLACE INTO auth_codes (email, code, expires_at) VALUES (?, ?, ?)'
          ).bind(email, code, expiresAt).run();
        } catch (dbErr) {
          console.warn('D1 auth_codes insert warning (falling back to MEMORY_AUTH_CODES):', dbErr);
        }
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
        try {
          const stored = await env.DB.prepare(
            'SELECT code, expires_at FROM auth_codes WHERE email = ?'
          ).bind(email).first<{ code: string; expires_at: number }>();

          if (stored && stored.code === code && stored.expires_at > Date.now()) {
            isValid = true;
            // Clean up single-use code immediately
            await env.DB.prepare('DELETE FROM auth_codes WHERE email = ?').bind(email).run();
          }
        } catch (dbErr) {
          console.warn('D1 auth_codes verify warning (falling back to MEMORY_AUTH_CODES):', dbErr);
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
        try {
          const existing = await env.DB.prepare('SELECT first_name, last_name FROM customers WHERE email = ?').bind(email).first<{ first_name: string; last_name: string }>();
          if (existing) {
            customerName = { firstName: existing.first_name || customerName.firstName, lastName: existing.last_name || customerName.lastName };
          } else {
            await env.DB.prepare(
              'INSERT INTO customers (id, email, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?) ON CONFLICT(email) DO NOTHING'
            ).bind(customerId, email, customerName.firstName, customerName.lastName, '').run();
          }
        } catch (dbErr) {
          console.warn('D1 customer lookup warning on OTP verify:', dbErr);
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

    // Author Back-Office Auth: Login with master secret / author password (managed on server)
    if (pathname === '/api/admin/auth' && request.method === 'POST') {
      const body = await readJson(request);
      const secret = String(body?.secret || body?.password || '').trim();
      const configuredSecret = (env.ADMIN_SECRET || '').trim();

      // If ADMIN_SECRET is configured in Cloudflare (secrets or vars), enforce it strictly.
      // If not yet set, fall back to author default secret on server side.
      const isAuthorized = configuredSecret ? secret === configuredSecret : secret === 'bibracte2026';
      if (!secret || !isAuthorized) {
        return json({ error: 'Clé secrète auteur incorrecte.' }, { status: 401 });
      }

      const adminToken = await signAdminToken(env);
      if (env.DB) {
        try {
          await env.DB.prepare(
            'INSERT OR REPLACE INTO admin_sessions (token, created_at, expires_at) VALUES (?, ?, ?)'
          ).bind(adminToken, Date.now(), Date.now() + 7 * 24 * 60 * 60 * 1000).run();
        } catch (dbErr) {
          console.warn('D1 admin_sessions insert warning (proceeding with stateless HMAC token):', dbErr);
        }
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

    // Author Back-Office: List PDF objects in R2 bucket `ebooks-jean` (for literal D1 indexing)
    if (pathname === '/api/admin/r2-list' && request.method === 'GET') {
      const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '';
      const verified = token ? await verifyAdminToken(env, token) : null;
      if (!verified || verified.role !== 'admin') {
        return json({ error: 'Accès refusé : rôle administrateur requis.' }, { status: 403 });
      }
      const r2Bucket = env.PDFS || env.BUCKET;
      if (!r2Bucket?.list) {
        return json({ error: 'Bucket R2 non configuré.' }, { status: 500 });
      }
      const listed = await r2Bucket.list({ prefix: '' });
      const objects = (listed.objects || []).map((o: any) => ({
        key: o.key,
        size: o.size ?? 0,
        uploaded: o.uploaded ?? null
      }));
      return json({ ok: true, bucket: 'ebooks-jean', count: objects.length, objects });
    }

    // =========================================================================
    // MODERATED COMMENTS API (A-priori moderation, isolated `comments` table)
    // =========================================================================

    // Public: GET /api/comments?slug=... -> returns ONLY approved comments
    if (pathname === '/api/comments' && request.method === 'GET') {
      const slug = (url.searchParams.get('slug') || '').trim();
      const memApproved = MEMORY_COMMENTS.filter(
        (c) => c.status === 'approved' && (!slug || c.target_slug === slug)
      );
      if (!env.DB) {
        return json({ ok: true, comments: memApproved });
      }
      await ensureTables(env.DB);
      try {
        const stmt = slug
          ? env.DB.prepare(
              `SELECT id, target_slug, author_name, content, status, created_at, moderated_at
               FROM comments
               WHERE status = 'approved' AND target_slug = ?
               ORDER BY created_at DESC, id DESC`
            ).bind(slug)
          : env.DB.prepare(
              `SELECT id, target_slug, author_name, content, status, created_at, moderated_at
               FROM comments
               WHERE status = 'approved'
               ORDER BY created_at DESC, id DESC`
            );
        const rows = await stmt.all();
        const dbComments = (rows.results || []) as any[];
        const merged = [...memApproved, ...dbComments.filter((d) => !memApproved.some((m) => m.id === d.id))];
        return json({ ok: true, comments: merged });
      } catch (err) {
        console.warn('GET /api/comments D1 warning (returning memory buffer):', err);
        return json({ ok: true, comments: memApproved });
      }
    }

    // Authenticated customer: POST /api/comments -> inserts with status = 'pending'
    if (pathname === '/api/comments' && request.method === 'POST') {
      const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '';
      const session = token ? await verifyCustomerToken(env, token) : null;
      if (!session?.email) {
        return json(
          { error: 'Authentification requise : veuillez vous connecter à votre Espace Client pour publier un commentaire.' },
          { status: 401 }
        );
      }

      const body = await readJson(request);
      const targetSlug = String(body?.target_slug || body?.slug || '').trim();
      const authorName = String(body?.author_name || body?.authorName || '').trim();
      const content = String(body?.content || '').trim();
      const charterAccepted = body?.charterAccepted === true || body?.charter_accepted === true;

      if (!charterAccepted) {
        return json(
          { error: "Vous devez accepter la charte d'utilisation et les mentions légales (RGPD / LCEN) avant l'envoi." },
          { status: 400 }
        );
      }
      if (!targetSlug || targetSlug.length > 120) {
        return json({ error: 'Identifiant du dossier ou de l’ouvrage (target_slug) invalide.' }, { status: 400 });
      }
      if (!authorName || authorName.length < 2 || authorName.length > 80) {
        return json({ error: 'Le pseudonyme affiché doit contenir entre 2 et 80 caractères.' }, { status: 400 });
      }
      if (!content || content.length > 1500) {
        return json({ error: 'Le commentaire est requis et ne doit pas dépasser 1 500 caractères.' }, { status: 400 });
      }

      const userId = customerIdFromEmail(session.email);
      const charterAcceptedAt = new Date().toISOString();

      try {
        if (!env.DB) throw new Error('D1 non configurée');
        await ensureTables(env.DB);
        const result = await env.DB.prepare(
          `INSERT INTO comments (target_slug, user_id, author_name, content, status, charter_accepted_at)
           VALUES (?, ?, ?, ?, 'pending', ?)`
        )
          .bind(targetSlug, userId, authorName, content, charterAcceptedAt)
          .run();

        return json(
          {
            ok: true,
            id: result?.meta?.last_row_id ?? null,
            status: 'pending',
            charter_accepted_at: charterAcceptedAt,
            message: 'Votre commentaire a bien été enregistré et sera publié après validation par la modération.'
          },
          { status: 201 }
        );
      } catch (err) {
        console.warn('POST /api/comments D1 fallback to memory buffer:', err);
        const memItem: MemoryComment = {
          id: ++memoryCommentNextId,
          target_slug: targetSlug,
          user_id: userId,
          author_name: authorName,
          content,
          status: 'pending',
          charter_accepted_at: charterAcceptedAt,
          created_at: charterAcceptedAt.replace('T', ' ').slice(0, 19),
          moderated_at: null
        };
        MEMORY_COMMENTS.unshift(memItem);

        return json(
          {
            ok: true,
            id: memItem.id,
            status: 'pending',
            charter_accepted_at: charterAcceptedAt,
            message: 'Votre commentaire a bien été enregistré et sera publié après validation par la modération.'
          },
          { status: 201 }
        );
      }
    }

    // Admin Authorization helper check: GET /api/admin/comments
    if (pathname === '/api/admin/comments' && request.method === 'GET') {
      const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '';
      const verified = token ? await verifyAdminToken(env, token) : null;
      if (!verified || verified.role !== 'admin') {
        return json({ error: 'Accès refusé : rôle administrateur requis pour la modération.' }, { status: 403 });
      }
      const statusFilter = (url.searchParams.get('status') || 'all').trim();
      const validStatuses = ['pending', 'approved', 'rejected'];
      const memFiltered = MEMORY_COMMENTS.filter((c) =>
        validStatuses.includes(statusFilter) ? c.status === statusFilter : true
      );
      if (!env.DB) {
        return json({ ok: true, comments: memFiltered });
      }

      await ensureTables(env.DB);
      try {
        const stmt = validStatuses.includes(statusFilter)
          ? env.DB.prepare(
              `SELECT id, target_slug, user_id, author_name, content, status, charter_accepted_at, created_at, moderated_at
               FROM comments
               WHERE status = ?
               ORDER BY created_at DESC, id DESC`
            ).bind(statusFilter)
          : env.DB.prepare(
              `SELECT id, target_slug, user_id, author_name, content, status, charter_accepted_at, created_at, moderated_at
               FROM comments
               ORDER BY CASE status WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 ELSE 2 END, created_at DESC, id DESC`
            );
        const rows = await stmt.all();
        const dbComments = (rows.results || []) as any[];
        const merged = [...memFiltered, ...dbComments.filter((d) => !memFiltered.some((m) => m.id === d.id))];
        return json({ ok: true, comments: merged });
      } catch (err) {
        console.warn('GET /api/admin/comments D1 warning (returning memory buffer):', err);
        return json({ ok: true, comments: memFiltered });
      }
    }

    // Admin Authorization: PATCH /api/admin/comments/:id -> approve or reject
    const adminCommentMatch = pathname.match(/^\/api\/admin\/comments\/(\d+)$/);
    if (adminCommentMatch && request.method === 'PATCH') {
      const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '';
      const verified = token ? await verifyAdminToken(env, token) : null;
      if (!verified || verified.role !== 'admin') {
        return json({ error: 'Accès refusé : autorisation administrateur requise.' }, { status: 403 });
      }

      const commentId = Number(adminCommentMatch[1]);
      const body = await readJson(request);
      const nextStatus = String(body?.status || '').trim();
      if (!Number.isInteger(commentId) || commentId <= 0) {
        return json({ error: 'Identifiant de commentaire invalide.' }, { status: 400 });
      }
      if (nextStatus !== 'approved' && nextStatus !== 'rejected') {
        return json({ error: "Statut invalide : valeurs autorisées 'approved' ou 'rejected'." }, { status: 400 });
      }

      const moderatedAt = new Date().toISOString();

      // Check memory buffer first
      const memTarget = MEMORY_COMMENTS.find((c) => c.id === commentId);
      if (memTarget) {
        memTarget.status = nextStatus;
        memTarget.moderated_at = moderatedAt;
      }

      try {
        if (!env.DB) throw new Error('D1 non configurée');
        await ensureTables(env.DB);
        const existing = await env.DB.prepare('SELECT id FROM comments WHERE id = ?').bind(commentId).first();
        if (!existing && !memTarget) {
          return json({ error: 'Commentaire introuvable.' }, { status: 404 });
        }

        if (existing) {
          await env.DB.prepare(
            'UPDATE comments SET status = ?, moderated_at = ? WHERE id = ?'
          )
            .bind(nextStatus, moderatedAt, commentId)
            .run();
        }

        const updated = existing
          ? await env.DB.prepare(
              `SELECT id, target_slug, user_id, author_name, content, status, charter_accepted_at, created_at, moderated_at
               FROM comments WHERE id = ?`
            )
              .bind(commentId)
              .first()
          : memTarget;

        return json({
          ok: true,
          comment: updated,
          message: nextStatus === 'approved' ? 'Commentaire approuvé et publié.' : 'Commentaire refusé.'
        });
      } catch (err) {
        if (memTarget) {
          return json({
            ok: true,
            comment: memTarget,
            message: nextStatus === 'approved' ? 'Commentaire approuvé et publié.' : 'Commentaire refusé.'
          });
        }
        console.error('PATCH /api/admin/comments/:id error:', err);
        return json({ error: 'Erreur lors de la modération du commentaire.' }, { status: 500 });
      }
    }

    // =========================================================================
    // AI DOCUMENTARY ASSISTANT API (Subscription-gated + Gemini + D1 literal RAG)
    // =========================================================================

    // Authenticated customer: GET /api/ai/subscription -> check subscription & index stats
    if (pathname === '/api/ai/subscription' && request.method === 'GET') {
      const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '';
      const session = token ? await verifyCustomerToken(env, token) : null;
      if (!session?.email) {
        return json({ error: 'Authentification requise.' }, { status: 401 });
      }

      const betaFreeEnabled = env.AI_BETA_FREE !== 'false';
      const userId = customerIdFromEmail(session.email);
      let sub: { plan: string; status: string; activated_at: string; expires_at?: string | null } | null = null;
      let indexedChunksCount = cachedIndexCounts?.chunks || 8266;
      let indexedAgoravoxCount = cachedIndexCounts?.agoravox || 29370;
      let indexedAcademicCount = cachedIndexCounts?.academic || 746;
      let d1QuotaExceeded = false;

      if (env.DB) {
        try {
          sub = await env.DB.prepare(
            'SELECT plan, status, activated_at, expires_at FROM ai_subscriptions WHERE user_id = ?'
          )
            .bind(userId)
            .first<{ plan: string; status: string; activated_at: string; expires_at?: string | null }>();
        } catch (err: any) {
          d1QuotaExceeded = true;
          console.warn('D1 subscription query warning (fallback to betaFreeEnabled):', err?.message || err);
        }

        // Only refresh counts every 30 minutes using MAX(id) index lookup (1 row read instead of 37,000 full table scan!)
        if (!d1QuotaExceeded && (!cachedIndexCounts || Date.now() - cachedIndexCounts.cachedAt > 30 * 60 * 1000)) {
          const countRow = await env.DB.prepare('SELECT MAX(id) as cnt FROM book_chunks').first<{ cnt: number }>().catch(() => null);
          const avCountRow = await env.DB.prepare('SELECT MAX(id) as cnt FROM agoravox_chunks').first<{ cnt: number }>().catch(() => null);
          const acadCountRow = await env.DB.prepare('SELECT MAX(id) as cnt FROM academic_chunks').first<{ cnt: number }>().catch(() => null);
          if (countRow?.cnt) indexedChunksCount = Number(countRow.cnt);
          if (avCountRow?.cnt) indexedAgoravoxCount = Number(avCountRow.cnt);
          if (acadCountRow?.cnt) indexedAcademicCount = Number(acadCountRow.cnt);
          cachedIndexCounts = {
            chunks: indexedChunksCount,
            agoravox: indexedAgoravoxCount,
            academic: indexedAcademicCount,
            cachedAt: Date.now()
          };
        }
      }

      const isActive = Boolean((sub && sub.status === 'active') || (betaFreeEnabled && d1QuotaExceeded));
      return json({
        ok: true,
        subscribed: isActive,
        plan: sub?.plan || (isActive ? 'beta_free' : null),
        status: sub?.status || (isActive ? 'active' : 'none'),
        activatedAt: sub?.activated_at || null,
        betaFreeEnabled,
        indexedChunksCount,
        indexedAgoravoxCount,
        indexedAcademicCount,
        geminiConfigured: Boolean(env.GEMINI_API_KEY)
      });
    }

    // Authenticated customer: POST /api/ai/subscription/activate-beta -> free test subscription
    if (pathname === '/api/ai/subscription/activate-beta' && request.method === 'POST') {
      const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '';
      const session = token ? await verifyCustomerToken(env, token) : null;
      if (!session?.email) {
        return json({ error: 'Authentification requise pour activer votre abonnement.' }, { status: 401 });
      }

      if (env.AI_BETA_FREE === 'false') {
        return json(
          { error: "La phase d'abonnement gratuit de test est terminée. Veuillez souscrire un abonnement actif." },
          { status: 402 }
        );
      }

      const userId = customerIdFromEmail(session.email);
      const activatedAt = new Date().toISOString();
      if (env.DB) {
        try {
          await ensureTables(env.DB);
          await env.DB.prepare(
            `INSERT INTO ai_subscriptions (user_id, email, plan, status, activated_at, expires_at)
             VALUES (?, ?, 'beta_free', 'active', ?, NULL)
             ON CONFLICT(user_id) DO UPDATE SET plan='beta_free', status='active', activated_at=excluded.activated_at`
          )
            .bind(userId, session.email.toLowerCase(), activatedAt)
            .run();
        } catch (err: any) {
          console.warn('D1 activate-beta warning (proceeding with stateless beta_free):', err?.message || err);
        }
      }

      return json({
        ok: true,
        subscribed: true,
        plan: 'beta_free',
        status: 'active',
        activatedAt,
        message: 'Abonnement IA (Phase de test — Offert) activé sur votre compte.'
      });
    }

    // Authenticated & Subscribed customer: POST /api/ai/ask -> literal RAG + Gemini API
    if (pathname === '/api/ai/ask' && request.method === 'POST') {
      const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '';
      const session = token ? await verifyCustomerToken(env, token) : null;
      if (!session?.email) {
        return json({ error: 'Authentification requise pour interroger l’Assistant IA.' }, { status: 401 });
      }

      const userId = customerIdFromEmail(session.email);
      if (env.DB) {
        try {
          await ensureTables(env.DB);
          const sub = await env.DB.prepare(
            'SELECT status FROM ai_subscriptions WHERE user_id = ?'
          )
            .bind(userId)
            .first<{ status: string }>();
          if ((!sub || sub.status !== 'active') && env.AI_BETA_FREE === 'false') {
            return json(
              {
                error: "Abonnement requis pour accéder à l'Assistant IA (abonnement offert actuellement en phase de test).",
                code: 'SUBSCRIPTION_REQUIRED'
              },
              { status: 402 }
            );
          }
        } catch (err: any) {
          console.warn('D1 ask subscription check warning (proceeding via AI_BETA_FREE):', err?.message || err);
        }
      }

      if (!env.GEMINI_API_KEY) {
        return json(
          {
            error: "Clé API Google AI Pro (GEMINI_API_KEY) non configurée sur le Cloudflare Worker. Exécutez 'npx wrangler secret put GEMINI_API_KEY' puis 'npx wrangler deploy'.",
            code: 'GEMINI_KEY_MISSING'
          },
          { status: 503 }
        );
      }

      const body = await readJson(request);
      const question = String(body?.question || '').trim();
      const bookIdFilter = String(body?.bookId || '').trim();
      const requestedScope = String(body?.sourceScope || (bookIdFilter ? 'books' : 'all')).trim(); // 'all' | 'books' | 'agoravox' | 'academic'
      const useGoogleSearch = Boolean(body?.useGoogleSearch);
      const history = Array.isArray(body?.history) ? body.history.slice(-10) : [];
      const fallbackContext = Array.isArray(body?.fallbackContext) ? body.fallbackContext.slice(0, 6) : [];

      if (!question || question.length > 1000) {
        return json({ error: 'Question invalide (entre 1 et 1 000 caractères).' }, { status: 400 });
      }

      const qNormEarly = question
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      // Smart scope expansion: if user explicitly asks for scientific/archaeological publications or official excavations,
      // ensure academic_chunks is always queried even if the dropdown stayed on 'agoravox' or 'books'
      const explicitlyAsksAcademic =
        /(scientifique|universitaire|archeologi|fouille|cnrs|gallia|inrap|hal|persee|these|contredi|objection|consensus|officiel)/i.test(
          qNormEarly
        );
      const sourceScope = requestedScope;
      const shouldQueryAcademic =
        !bookIdFilter &&
        (sourceScope === 'all' || sourceScope === 'academic' || explicitlyAsksAcademic);

      // 1. Retrieve literal indexed passages from Cloudflare D1 (book_chunks + agoravox_chunks + academic_chunks via FTS5)
      type ChunkRow = {
        id?: number;
        book_id: string;
        book_title: string;
        tome: string;
        page_number: number;
        chapter: string;
        content: string;
      };
      type AgoraVoxRow = {
        id?: number;
        source_type: 'article' | 'comment';
        article_title: string;
        article_url: string;
        source_url: string;
        author_name: string;
        published_date: string;
        content: string;
      };
      type AcademicRow = {
        id?: number;
        doc_type: string;
        theme: string;
        title: string;
        authors: string;
        published_year: string;
        journal_or_institution: string;
        source_url: string;
        content: string;
      };

      let retrievedChunks: ChunkRow[] = [];
      let retrievedAgoravox: AgoraVoxRow[] = [];
      let retrievedAcademic: AcademicRow[] = [];

      if (env.DB) {
        const stopWords = new Set([
          'les', 'des', 'une', 'que', 'qui', 'pour', 'dans', 'sur', 'avec', 'par',
          'est', 'sont', 'quelle', 'quel', 'quels', 'quelles', 'comment', 'pourquoi',
          'emile', 'mourey', 'auteur', 'livre', 'livres', 'ouvrage', 'ouvrages',
          'position', 'theorie', 'these', 'theses', 'son', 'ses', 'leur', 'leurs',
          'cette', 'cet', 'ces', 'aux', 'mais', 'plus', 'etre', 'fait', 'avoir',
          'article', 'articles', 'agoravox', 'commentaire', 'commentaires', 'situe',
          'scientifique', 'scientifiques', 'universitaire', 'consensus', 'archeologique'
        ]);
        const extractKeywords = (rawText: string) =>
          rawText
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, ' ')
            .split(/\s+/)
            .filter((w) => w.length >= 3 && !stopWords.has(w));

        const currentKeywords = extractKeywords(question);
        // For follow-up questions (e.g. "peux-tu citer les publications scientifiques contredisant ses thèses ?"),
        // enrich with topical keywords from the user's previous question(s) in the same session.
        const historyUserText = history
          .filter((h: any) => h?.role === 'user' && h?.text)
          .slice(-2)
          .map((h: any) => String(h.text))
          .join(' ');
        const historyKeywords = extractKeywords(historyUserText);
        const keywords = Array.from(new Set([...currentKeywords, ...historyKeywords])).slice(0, 10);

        const safeTerms = keywords.map((k) => `"${k.replace(/"/g, '')}"`);
        const ftsAndQuery = safeTerms.length >= 2 ? safeTerms.slice(0, 3).join(' AND ') : safeTerms.join(' OR ');
        const ftsOrQuery = safeTerms.join(' OR ');

        // 1A. Search literal book_chunks (when scope is 'all' or 'books')
        if (keywords.length > 0 && (sourceScope === 'all' || sourceScope === 'books')) {
          try {
            const seenBookRowIds = new Set<number>();
            const rawMatches: ChunkRow[] = [];

            // High-precision AND query first (top 2-3 keywords together)
            if (safeTerms.length >= 2) {
              const andStmt = bookIdFilter
                ? env.DB.prepare(
                    `SELECT bc.id, bc.book_id, bc.book_title, bc.tome, bc.page_number, bc.chapter, bc.content
                     FROM book_chunks_fts fts
                     JOIN book_chunks bc ON bc.id = fts.rowid
                     WHERE book_chunks_fts MATCH ? AND bc.book_id = ?
                     ORDER BY rank
                     LIMIT 8`
                  ).bind(ftsAndQuery, bookIdFilter)
                : env.DB.prepare(
                    `SELECT bc.id, bc.book_id, bc.book_title, bc.tome, bc.page_number, bc.chapter, bc.content
                     FROM book_chunks_fts fts
                     JOIN book_chunks bc ON bc.id = fts.rowid
                     WHERE book_chunks_fts MATCH ?
                     ORDER BY rank
                     LIMIT 8`
                  ).bind(ftsAndQuery);
              const andRes = await andStmt.all<ChunkRow>().catch(() => ({ results: [] }));
              for (const row of andRes.results || []) {
                if (row.id && !seenBookRowIds.has(row.id)) {
                  seenBookRowIds.add(row.id);
                  rawMatches.push(row);
                }
              }
            }

            // Top up with BM25 OR query to gather broader multi-book context
            if (rawMatches.length < 10) {
              const orStmt = bookIdFilter
                ? env.DB.prepare(
                    `SELECT bc.id, bc.book_id, bc.book_title, bc.tome, bc.page_number, bc.chapter, bc.content
                     FROM book_chunks_fts fts
                     JOIN book_chunks bc ON bc.id = fts.rowid
                     WHERE book_chunks_fts MATCH ? AND bc.book_id = ?
                     ORDER BY rank
                     LIMIT 14`
                  ).bind(ftsOrQuery, bookIdFilter)
                : env.DB.prepare(
                    `SELECT bc.id, bc.book_id, bc.book_title, bc.tome, bc.page_number, bc.chapter, bc.content
                     FROM book_chunks_fts fts
                     JOIN book_chunks bc ON bc.id = fts.rowid
                     WHERE book_chunks_fts MATCH ?
                     ORDER BY rank
                     LIMIT 14`
                  ).bind(ftsOrQuery);
              const orRes = await orStmt.all<ChunkRow>();
              for (const row of orRes.results || []) {
                if (row.id && !seenBookRowIds.has(row.id)) {
                  seenBookRowIds.add(row.id);
                  rawMatches.push(row);
                }
              }
            }

            // Diversify across books (max 4 passages per book when searching whole collection)
            const perBookCount = new Map<string, number>();
            for (const row of rawMatches) {
              const cnt = perBookCount.get(row.book_id) || 0;
              if (!bookIdFilter && cnt >= 4) continue;
              perBookCount.set(row.book_id, cnt + 1);
              retrievedChunks.push(row);
              if (retrievedChunks.length >= 8) break;
            }
          } catch {
            retrievedChunks = [];
          }
        }

        // 1B. Search AgoraVox articles & comments (when scope is 'all' or 'agoravox')
        if (keywords.length > 0 && (sourceScope === 'all' || sourceScope === 'agoravox') && !bookIdFilter) {
          try {
            const seenAvIds = new Set<number>();
            const avMatches: AgoraVoxRow[] = [];

            if (safeTerms.length >= 2) {
              const avAndRes = await env.DB.prepare(
                `SELECT ac.id, ac.source_type, ac.article_title, ac.article_url, ac.source_url, ac.author_name, ac.published_date, ac.content
                 FROM agoravox_chunks_fts fts
                 JOIN agoravox_chunks ac ON ac.id = fts.rowid
                 WHERE agoravox_chunks_fts MATCH ?
                 ORDER BY CASE WHEN ac.source_type = 'article' THEN 0 ELSE 1 END, rank
                 LIMIT 6`
              )
                .bind(ftsAndQuery)
                .all<AgoraVoxRow>()
                .catch(() => ({ results: [] }));
              for (const row of avAndRes.results || []) {
                if (row.id && !seenAvIds.has(row.id)) {
                  seenAvIds.add(row.id);
                  avMatches.push(row);
                }
              }
            }

            if (avMatches.length < 5) {
              const avOrRes = await env.DB.prepare(
                `SELECT ac.id, ac.source_type, ac.article_title, ac.article_url, ac.source_url, ac.author_name, ac.published_date, ac.content
                 FROM agoravox_chunks_fts fts
                 JOIN agoravox_chunks ac ON ac.id = fts.rowid
                 WHERE agoravox_chunks_fts MATCH ?
                 ORDER BY rank
                 LIMIT 8`
              )
                .bind(ftsOrQuery)
                .all<AgoraVoxRow>()
                .catch(() => ({ results: [] }));
              for (const row of avOrRes.results || []) {
                if (row.id && !seenAvIds.has(row.id)) {
                  seenAvIds.add(row.id);
                  avMatches.push(row);
                }
              }
            }

            retrievedAgoravox = avMatches.slice(0, sourceScope === 'agoravox' ? 8 : 4);
          } catch {
            retrievedAgoravox = [];
          }
        }

        // 1C-bis. Search peer-reviewed scientific & archaeological publications (CNRS HAL-SHS / Gallia / Persée)
        if (keywords.length > 0 && shouldQueryAcademic) {
          try {
            const seenAcadIds = new Set<number>();
            const acadMatches: AcademicRow[] = [];

            // Domain / site terms get a focused AND query first so canonical archaeological reports rank #1
            const domainPriorityRegex =
              /^(bibracte|beuvray|gorgobina|alesia|alise|auxois|gergovie|merdogne|corent|arverne|eduen|peutinger|vezelay|autun|augustodunum|cabillonum|chalon|qumran|essenien|mahomet|coran|tabari|mecque)/;
            const domainTerms = safeTerms.filter((t) => domainPriorityRegex.test(t.replace(/"/g, '')));
            const acadPrecisionQuery =
              domainTerms.length >= 2
                ? domainTerms.slice(0, 2).join(' AND ')
                : domainTerms.length === 1
                  ? domainTerms[0]
                  : ftsAndQuery;

            if (acadPrecisionQuery) {
              const acadAndRes = await env.DB.prepare(
                `SELECT ac.id, ac.doc_type, ac.theme, ac.title, ac.authors, ac.published_year, ac.journal_or_institution, ac.source_url, ac.content
                 FROM academic_chunks_fts fts
                 JOIN academic_chunks ac ON ac.id = fts.rowid
                 WHERE academic_chunks_fts MATCH ?
                 ORDER BY CASE WHEN ac.source_url LIKE '%persee.fr%' OR ac.source_url LIKE '%bibracte.fr%' OR ac.source_url LIKE '%openedition.org%' THEN 0 ELSE 1 END, rank
                 LIMIT 6`
              )
                .bind(acadPrecisionQuery)
                .all<AcademicRow>()
                .catch(() => ({ results: [] }));
              for (const row of acadAndRes.results || []) {
                if (row.id && !seenAcadIds.has(row.id)) {
                  seenAcadIds.add(row.id);
                  acadMatches.push(row);
                }
              }
            }

            if (acadMatches.length < 5) {
              const acadOrRes = await env.DB.prepare(
                `SELECT ac.id, ac.doc_type, ac.theme, ac.title, ac.authors, ac.published_year, ac.journal_or_institution, ac.source_url, ac.content
                 FROM academic_chunks_fts fts
                 JOIN academic_chunks ac ON ac.id = fts.rowid
                 WHERE academic_chunks_fts MATCH ?
                 ORDER BY CASE WHEN ac.source_url LIKE '%persee.fr%' OR ac.source_url LIKE '%bibracte.fr%' OR ac.source_url LIKE '%openedition.org%' THEN 0 ELSE 1 END, rank
                 LIMIT 8`
              )
                .bind(ftsOrQuery)
                .all<AcademicRow>()
                .catch(() => ({ results: [] }));
              for (const row of acadOrRes.results || []) {
                if (row.id && !seenAcadIds.has(row.id)) {
                  seenAcadIds.add(row.id);
                  acadMatches.push(row);
                }
              }
            }

            retrievedAcademic = acadMatches.slice(0, sourceScope === 'academic' ? 8 : 5);
          } catch {
            retrievedAcademic = [];
          }
        }
      }

      // 1C. Community / Commenters SQL analytics when user asks about followers/commenters on AgoraVox
      let communitySummaryBlock = '';
      const qNorm = question
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      const isCommunityQuestion =
        sourceScope !== 'books' &&
        !bookIdFilter &&
        /(suiveur|commentateur|fidele|lecteur|intervenant|contributeur|pseudonyme|participant|contradicteur|partisan|communaute|qui commente|qui suit)/i.test(
          qNorm
        );

      if (env.DB && isCommunityQuestion) {
        try {
          type TopCommenter = { author_name: string; nb_comments: number; nb_articles: number };
          const topRes = await env.DB.prepare(
            `SELECT author_name, COUNT(*) as nb_comments, COUNT(DISTINCT article_url) as nb_articles
             FROM agoravox_chunks
             WHERE source_type = 'comment'
               AND lower(author_name) NOT LIKE '%mourey%'
               AND author_name != 'Lecteur AgoraVox'
             GROUP BY author_name
             ORDER BY nb_comments DESC
             LIMIT 10`
          ).all<TopCommenter>();

          const topCommenters = topRes.results || [];
          if (topCommenters.length > 0) {
            const leaderboardLines = topCommenters.map((c, i) => {
              const profileUrl = AGORAVOX_AUTHOR_PROFILES[c.author_name];
              return `${i + 1}. ${c.author_name}${profileUrl ? ` (Profil AgoraVox : ${profileUrl})` : ''} : ${c.nb_comments} commentaires sur ${c.nb_articles} articles`;
            });

            // Fetch 1 representative comment with exact URL for each of the top 6 commenters
            const topNames = topCommenters.slice(0, 6).map((c) => c.author_name);
            const placeholders = topNames.map(() => '?').join(',');
            const sampleRes = await env.DB.prepare(
              `SELECT source_type, article_title, article_url, source_url, author_name, published_date, content
               FROM agoravox_chunks
               WHERE source_type = 'comment'
                 AND author_name IN (${placeholders})
                 AND length(content) BETWEEN 140 AND 900
               GROUP BY author_name
               ORDER BY id DESC`
            )
              .bind(...topNames)
              .all<AgoraVoxRow>()
              .catch(() => ({ results: [] }));

            const sampleComments = sampleRes.results || [];
            // Add these real comments to retrievedAgoravox so their clickable URLs also appear in agoravoxReferences
            for (const sc of sampleComments) {
              if (!retrievedAgoravox.some((r) => r.source_url === sc.source_url)) {
                retrievedAgoravox.push(sc);
              }
            }

            communitySummaryBlock = [
              'STATISTIQUES RÉELLES DES COMMENTATEURS LES PLUS ACTIFS SUR AGORAVOX (base complète de 559 articles et 22 784 commentaires) :',
              ...leaderboardLines,
              '',
              'EXEMPLES DE COMMENTAIRES DE CES INTERVENANTS (avec URL directe) :',
              ...sampleComments.map(
                (sc) =>
                  `- ${sc.author_name} sur « ${sc.article_title} » (${sc.published_date || 'AgoraVox'}) | URL : ${sc.source_url}\n  Extrait : ${String(sc.content || '').slice(0, 420)}`
              )
            ].join('\n');
          }
        } catch {
          communitySummaryBlock = '';
        }
      }

      // 1D. Canonical Academic Fallback if D1 quota is temporarily reached or no FTS match found
      if (retrievedAcademic.length === 0 && shouldQueryAcademic) {
        const CANONICAL_ACADEMIC_REFS: AcademicRow[] = [
          {
            doc_type: 'Rapport de fouilles',
            theme: 'Bibracte & Éduens',
            title: "Les fouilles du mont Beuvray : rapport biennal (1984-1995) — Dossier Bibracte",
            authors: 'Vincent Guichard, Jean-Paul Guillaumet, Olivier Buchsenschutz, Daniele Vitali, Katherine Gruel, Fanette Laubenheimer',
            published_year: '1998',
            journal_or_institution: 'Gallia - Archéologie de la France antique, tome 55 (CNRS Éditions)',
            source_url: 'https://www.persee.fr/issue/galia_0016-4119_1998_num_55_1',
            content:
              "Synthèse officielle CNRS des fouilles du mont Beuvray (1984-1995) : remparts à murus gallicus (Porte du Rebout), ateliers métallurgiques, quartier artisanal du Champlain, domus du Parc aux Chevaux, habitats de la Pâture du Couvent, faciès monétaire éduen et des dizaines de milliers de fragments d'amphores Dressel 1 (Ier s. av. J.-C.), fondant l'identification académique de Bibracte au mont Beuvray avant le transfert à Augustodunum (Autun)."
          },
          {
            doc_type: 'Ouvrage scientifique',
            theme: 'Bibracte & Éduens',
            title: 'Bibracte et les Éduens : À la découverte d’un peuple gaulois',
            authors: 'Christian Goudineau, Christian Peyre',
            published_year: '1993',
            journal_or_institution: 'Éditions Errance / Centre archéologique européen du Mont Beuvray',
            source_url: 'https://www.bibracte.fr/la-recherche',
            content:
              "Ouvrage de référence du professeur au Collège de France Christian Goudineau et de Christian Peyre synthétisant l'histoire de la confédération éduenne, l'organisation urbaine de l'oppidum du mont Beuvray (200 hectares fortifiés), les relations diplomatiques avec Rome et la chronologie de la fin de La Tène D."
          },
          {
            doc_type: 'Rapport de fouilles',
            theme: 'Alésia & Siège de 52 av. J.-C.',
            title: 'Les nouvelles fouilles d’Alésia (1991-1995) : fortifications romaines de circonvallation et contrevallation à Alise-Sainte-Reine',
            authors: 'Michel Reddé, Siegmar von Schnurbein',
            published_year: '1997',
            journal_or_institution: "Comptes rendus des séances de l'Académie des Inscriptions et Belles-Lettres (CRAI) / MAIBL",
            source_url: 'https://www.persee.fr/doc/crai_0065-0536_1995_num_139_1_15460',
            content:
              "Rapport de la mission archéologique franco-allemande (EPHE / RGK Francfort) à Alise-Sainte-Reine (mont Auxois) : relevés des fossés de circonvallation et contrevallation, camps C et A (mont Réa), stimuli, balles de fronde au nom de Labiénus (T.LABI), monnaies gauloises de 52 av. J.-C. et inscription lapidaire IN ALISIIA."
          },
          {
            doc_type: 'Rapport de fouilles',
            theme: 'Gergovie & Arvernes',
            title: 'L’oppidum arverne de Gergovie (La Roche-Blanche, Puy-de-Dôme) : bilan des recherches archéologiques sur les fortifications et les ouvrages romains',
            authors: 'Yann Deberge, Thomas Pertlwieser, Matthieu Poux, Vincent Guichard',
            published_year: '2019',
            journal_or_institution: 'INRAP / Revue archéologique du Centre de la France (RACF) / CNRS',
            source_url: 'https://journals.openedition.org/racf/',
            content:
              "Synthèse des fouilles INRAP et CNRS sur le plateau de Gergovie (Merdogne), Corent et Gondole : datation tardo-républicaine des fossés et des deux camps césariens de la Serre d'Orcet et de la Roche-Blanche (traits de catapulte en fer, clous de caligae, monnaies romaines antérieures à 52 av. J.-C.)."
          }
        ];

        const combinedQNorm = `${qNorm} ${history
          .filter((h: any) => h?.role === 'user' && h?.text)
          .slice(-2)
          .map((h: any) => String(h.text).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
          .join(' ')}`;

        retrievedAcademic = CANONICAL_ACADEMIC_REFS.filter((item) => {
          const textBlob = `${item.theme} ${item.title} ${item.content}`.toLowerCase();
          if (/gaulois|cites|bataille|guerre des gaules|fouille|archeologi/.test(combinedQNorm)) {
            return true;
          }
          if (/bibracte|beuvray|gorgobina|mont-saint-vincent|eduen|autun/.test(combinedQNorm)) {
            return item.theme.includes('Bibracte');
          }
          if (/alesia|alise|auxois|bussy|altero/.test(combinedQNorm)) {
            return item.theme.includes('Alésia');
          }
          if (/gergovie|merdogne|corent|arverne|chanturgue/.test(combinedQNorm)) {
            return item.theme.includes('Gergovie');
          }
          return textBlob.includes(qNorm.slice(0, 12));
        });
      }

      const mode =
        retrievedChunks.length > 0 ||
        retrievedAgoravox.length > 0 ||
        retrievedAcademic.length > 0 ||
        communitySummaryBlock
          ? 'd1_literal'
          : 'catalog_synthesis';

      // Build grounded documentary context for Gemini (books + AgoraVox + peer-reviewed scientific publications + optional community analytics)
      const bookContextBlocks = retrievedChunks.map(
        (c, idx) =>
          `Source Livre ${idx + 1} (OUVRAGE IMPRIMÉ D’ÉMILE MOUREY — PAS D’URL WEB) — Ouvrage : ${c.book_title}${c.tome ? ` (${c.tome})` : ''} | Page ${c.page_number}\n${String(c.content || '').slice(0, 1000)}`
      );

      const agoravoxContextBlocks = retrievedAgoravox.map((a, idx) => {
        const profileUrl = AGORAVOX_AUTHOR_PROFILES[a.author_name];
        return `Source AgoraVox ${idx + 1} — ${a.source_type === 'comment' ? `Commentaire de ${a.author_name}${profileUrl ? ` (Profil AgoraVox : ${profileUrl})` : ''}` : 'Article AgoraVox d’Émile Mourey (Profil AgoraVox : https://www.agoravox.fr/auteur/emile-mourey)'} | Titre : ${a.article_title}${a.published_date ? ` (${a.published_date})` : ''} | URL AGORAVOX : ${a.source_url}\n${String(a.content || '').slice(0, 850)}`;
      });

      const academicContextBlocks = retrievedAcademic.map(
        (ac, idx) =>
          `Source Scientifique / Archéologique Officielle ${idx + 1} — [${ac.doc_type}] ${ac.title} | Auteurs : ${ac.authors}${ac.published_year ? ` (${ac.published_year})` : ''}${ac.journal_or_institution ? ` | Publication/Institution : ${ac.journal_or_institution}` : ''} | URL SCIENTIFIQUE : ${ac.source_url}\n${String(ac.content || '').slice(0, 1400)}`
      );

      const fallbackContextBlocks =
        bookContextBlocks.length === 0
          ? fallbackContext.slice(0, 4).map(
              (fc: any, idx: number) =>
                `Source Livre ${idx + 1} (OUVRAGE IMPRIMÉ D’ÉMILE MOUREY — PAS D’URL WEB) — Ouvrage : ${fc.title || ''}${fc.tome ? ` (${fc.tome})` : ''}\n${String(fc.excerpt || '').slice(0, 950)}`
            )
          : [];

      const contextBlocks = [
        ...(communitySummaryBlock ? [communitySummaryBlock] : []),
        ...bookContextBlocks,
        ...fallbackContextBlocks,
        ...agoravoxContextBlocks,
        ...academicContextBlocks
      ];

      const systemInstruction = [
        "Tu es l'assistant documentaire officiel des Éditions Émile Mourey.",
        "Ta mission est d'expliquer fidèlement, clairement et avec rigueur la position et les thèses d'Émile Mourey (officier saint-cyrien, historien indépendant) à partir de ses ouvrages et de ses articles/débats sur AgoraVox, puis de présenter dans une section dédiée la confrontation avec les publications scientifiques et rapports de fouilles archéologiques officiels (CNRS, HAL-SHS, INRAP, revue Gallia, Persée, thèses universitaires) présents dans les sources.",
        'Règles impératives de citation (AUCUN MÉLANGE DE SOURCES) :',
        "1. OUVRAGES D'ÉMILE MOUREY (Source Livre) : Cite-les UNIQUEMENT en italique avec le numéro de page, SANS AUCUN LIEN URL Markdown. Exemple exact : (*La Gaule en héritage, 1ère partie*, p. 61) ou (*Histoire de Bibracte, Tome 2 : Le Bouclier Éduen*, p. 106). INTERDICTION ABSOLUE d'attacher une URL AgoraVox ou HAL au titre d'un livre imprimé !",
        "2. ARTICLES & COMMENTAIRES AGORAVOX (Source AgoraVox) : Cite-les avec un lien Markdown cliquable dont le libellé est le titre de l'article AgoraVox ou l'auteur/date du commentaire, et dont l'URL est l'URL AGORAVOX exacte de cette source. Lorsqu'un pseudo de commentateur AgoraVox dispose d'un « Profil AgoraVox : https://... » dans les sources, transforme son pseudo en lien Markdown cliquable [Pseudo](URL_PROFIL_AGORAVOX) à chaque mention.",
        "3. PUBLICATIONS SCIENTIFIQUES & FOUILLES OFFICIELLES (Source Scientifique / Archéologique Officielle) : Consacre systématiquement une section « Confrontation avec les fouilles archéologiques et publications scientifiques officielles » (lorsque des Sources Scientifiques sont fournies) et cite explicitement chaque publication pertinente (auteurs, année, titre, revue/institution) avec son lien Markdown cliquable [Auteurs (Année) — Titre](URL_SCIENTIFIQUE_EXACTE) pointant vers hal.science, shs.hal.science ou persee.fr.",
        "4. N'utilise jamais d'astérisques * à l'intérieur des crochets [...] d'un lien Markdown (écris [Texte du lien](URL) et jamais [*Texte*](URL)).",
        "5. N'écris JAMAIS d'identifiants techniques internes du type [AGORAVOX 1], [LIVRE 1] ou [Source Scientifique 1].",
        '6. Réponds en français soigné, structuré avec des titres clairs, des citations littérales et des puces lisibles.'
      ].join('\n');

      const conversationTurns = history
        .filter((h: any) => h?.text)
        .map((h: any) => ({
          role: h.role === 'model' ? 'model' : 'user',
          parts: [{ text: String(h.text).slice(0, 1500) }]
        }));

      const userPromptWithSources = [
        '=== SOURCES DOCUMENTAIRES D’ÉMILE MOUREY ===',
        contextBlocks.length > 0
          ? contextBlocks.join('\n\n')
          : 'Aucun passage indexé disponible pour cette requête.',
        '=== FIN DES SOURCES ===',
        '',
        `Question du lecteur : ${question}`
      ].join('\n');

      const configuredModel = (env.GEMINI_MODEL || 'gemini-3.5-flash-lite').trim();
      const candidateModels = Array.from(
        new Set([configuredModel, 'gemini-3.5-flash-lite', 'gemini-3.8-flash'])
      );

      type WebSourceRef = { title: string; url: string };
      const callGeminiStreaming = async (
        targetModel: string
      ): Promise<{ ok: boolean; status: number; text?: string; webReferences?: WebSourceRef[]; error?: string }> => {
        const isLiteModel = /lite/i.test(targetModel);
        const isGemini3OrNewer = /^gemini-[34]/i.test(targetModel);
        const generationConfig: Record<string, unknown> = {
          temperature: 0.25,
          maxOutputTokens: 2200
        };
        if (isGemini3OrNewer && !isLiteModel) {
          generationConfig.thinkingConfig = { thinkingLevel: 'low' };
        }

        const requestPayload: Record<string, unknown> = {
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: [
            ...conversationTurns,
            { role: 'user', parts: [{ text: userPromptWithSources }] }
          ],
          generationConfig
        };
        if (useGoogleSearch) {
          requestPayload.tools = [{ google_search: {} }];
        }

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 28000);
        try {
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(targetModel)}:streamGenerateContent?alt=sse`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': env.GEMINI_API_KEY!
              },
              body: JSON.stringify(requestPayload),
              signal: controller.signal
            }
          );

          if (!res.ok) {
            const errJson = await res.json().catch(() => null);
            return {
              ok: false,
              status: res.status,
              error: errJson?.error?.message || `Erreur API Gemini (${res.status})`
            };
          }

          const rawSse = await res.text();
          let combined = '';
          const webRefsMap = new Map<string, WebSourceRef>();
          for (const line of rawSse.split('\n')) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data:')) continue;
            const jsonStr = trimmed.slice(5).trim();
            if (!jsonStr || jsonStr === '[DONE]') continue;
            try {
              const chunk = JSON.parse(jsonStr);
              const candidate = chunk?.candidates?.[0];
              const parts = candidate?.content?.parts || [];
              for (const p of parts) {
                if (typeof p?.text === 'string' && !p?.thought) {
                  combined += p.text;
                }
              }
              const groundingChunks = candidate?.groundingMetadata?.groundingChunks || [];
              for (const gc of groundingChunks) {
                const uri = gc?.web?.uri;
                const title = gc?.web?.title;
                if (typeof uri === 'string' && uri.startsWith('http') && !webRefsMap.has(uri)) {
                  webRefsMap.set(uri, {
                    title: typeof title === 'string' && title.trim() ? title.trim() : uri,
                    url: uri
                  });
                }
              }
            } catch {
              // ignore partial SSE lines
            }
          }

          return {
            ok: true,
            status: 200,
            text: combined.trim(),
            webReferences: Array.from(webRefsMap.values()).slice(0, 8)
          };
        } catch (err: any) {
          const isAbort = err?.name === 'AbortError';
          return {
            ok: false,
            status: isAbort ? 504 : 500,
            error: isAbort
              ? `Délai dépassé sur ${targetModel} (>28s)`
              : err?.message || `Erreur réseau sur ${targetModel}`
          };
        } finally {
          clearTimeout(timer);
        }
      };

      try {
        let answerText = '';
        let usedModel = configuredModel;
        let webReferences: WebSourceRef[] = [];
        let lastError = 'Impossible de joindre le service Gemini.';

        for (const candidate of candidateModels) {
          const result = await callGeminiStreaming(candidate);
          if (result.ok && result.text) {
            answerText = result.text;
            webReferences = result.webReferences || [];
            usedModel = candidate;
            break;
          }
          lastError = result.error || lastError;
          // Only stop immediately on auth/quota errors (401/403/429)
          if (result.status === 401 || result.status === 403 || result.status === 429) {
            return json({ error: lastError }, { status: result.status });
          }
        }

        if (!answerText) {
          return json({ error: lastError }, { status: 502 });
        }

        const model = usedModel;

        // Deduplicate cited references for clickable UI pills
        const refsMap = new Map<string, { bookId: string; title: string; tome: string; pages: number[] }>();
        if (retrievedChunks.length > 0) {
          for (const c of retrievedChunks) {
            const existing = refsMap.get(c.book_id);
            if (existing) {
              if (c.page_number > 0 && !existing.pages.includes(c.page_number)) {
                existing.pages.push(c.page_number);
              }
            } else {
              refsMap.set(c.book_id, {
                bookId: c.book_id,
                title: c.book_title,
                tome: c.tome || '',
                pages: c.page_number > 0 ? [c.page_number] : []
              });
            }
          }
        } else {
          for (const fc of fallbackContext.slice(0, 4)) {
            if (fc?.bookId && !refsMap.has(fc.bookId)) {
              refsMap.set(fc.bookId, {
                bookId: fc.bookId,
                title: fc.title || '',
                tome: fc.tome || '',
                pages: []
              });
            }
          }
        }

        // Deduplicate AgoraVox references (with direct article or #forum comment URL)
        const avRefsMap = new Map<
          string,
          {
            sourceType: 'article' | 'comment';
            title: string;
            authorName: string;
            publishedDate: string;
            url: string;
          }
        >();
        for (const a of retrievedAgoravox) {
          if (a.source_url && !avRefsMap.has(a.source_url)) {
            avRefsMap.set(a.source_url, {
              sourceType: a.source_type,
              title: a.article_title,
              authorName: a.author_name,
              publishedDate: a.published_date || '',
              url: a.source_url
            });
          }
        }

        // Deduplicate peer-reviewed Academic / Archaeological references (CNRS HAL-SHS / Persée / Gallia)
        const acadRefsMap = new Map<
          string,
          {
            docType: string;
            title: string;
            authors: string;
            year: string;
            journal: string;
            url: string;
          }
        >();
        for (const ac of retrievedAcademic) {
          if (ac.source_url && !acadRefsMap.has(ac.source_url)) {
            acadRefsMap.set(ac.source_url, {
              docType: ac.doc_type,
              title: ac.title,
              authors: ac.authors,
              year: ac.published_year || '',
              journal: ac.journal_or_institution || '',
              url: ac.source_url
            });
          }
        }

        // Log anonymized query & coverage metrics into D1 (Levier 1 RAG: detect knowledge gaps & feedback loop)
        let queryLogId: number | null = null;
        if (env.DB) {
          try {
            const logRes = await env.DB.prepare(
              `INSERT INTO ai_query_logs (question, scope, use_google_search, chunks_used, agoravox_used, academic_used, web_sources_used, model)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
            )
              .bind(
                question.slice(0, 500),
                sourceScope,
                useGoogleSearch ? 1 : 0,
                retrievedChunks.length,
                retrievedAgoravox.length,
                retrievedAcademic.length,
                webReferences.length,
                model
              )
              .run();
            queryLogId = Number(logRes?.meta?.last_row_id || 0) || null;
          } catch (logErr) {
            console.warn('ai_query_logs insert warning:', logErr);
          }
        }

        return json({
          ok: true,
          queryLogId,
          answer: answerText,
          references: Array.from(refsMap.values()),
          agoravoxReferences: Array.from(avRefsMap.values()),
          academicReferences: Array.from(acadRefsMap.values()),
          webReferences,
          indexedChunksUsed: retrievedChunks.length,
          indexedAgoravoxUsed: retrievedAgoravox.length,
          indexedAcademicUsed: retrievedAcademic.length,
          webSourcesUsed: webReferences.length,
          googleSearchEnabled: useGoogleSearch,
          mode,
          model
        });
      } catch (err: any) {
        console.error('POST /api/ai/ask error:', err);
        return json({ error: err?.message || "Erreur lors de l'appel à Gemini." }, { status: 500 });
      }
    }

    // Authenticated customer: POST /api/ai/feedback -> record 👍/👎 on a query log (Levier 1 RAG)
    if (pathname === '/api/ai/feedback' && request.method === 'POST') {
      const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '';
      const session = token ? await verifyCustomerToken(env, token) : null;
      if (!session?.email) {
        return json({ error: 'Authentification requise.' }, { status: 401 });
      }
      const body = await readJson(request);
      const queryLogId = Number(body?.queryLogId || 0);
      const feedback = body?.feedback === 1 ? 1 : body?.feedback === -1 ? -1 : 0;
      if (!queryLogId || !feedback) {
        return json({ error: 'Paramètres de feedback invalides.' }, { status: 400 });
      }
      if (env.DB) {
        try {
          await env.DB.prepare('UPDATE ai_query_logs SET feedback = ? WHERE id = ?')
            .bind(feedback, queryLogId)
            .run();
        } catch (err) {
          console.warn('POST /api/ai/feedback D1 warning:', err);
        }
      }
      return json({ ok: true, queryLogId, feedback });
    }

    // Admin: GET /api/admin/ai-logs -> inspect reader prompts, feedback & knowledge gaps
    if (pathname === '/api/admin/ai-logs' && request.method === 'GET') {
      const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '';
      const verified = token ? await verifyAdminToken(env, token) : null;
      if (!verified || verified.role !== 'admin') {
        return json({ error: 'Accès refusé : rôle administrateur requis.' }, { status: 403 });
      }
      if (!env.DB) {
        return json({ ok: true, logs: [] });
      }
      try {
        const rows = await env.DB.prepare(
          `SELECT id, question, scope, use_google_search, chunks_used, agoravox_used, academic_used, web_sources_used, model, feedback, created_at
           FROM ai_query_logs
           ORDER BY id DESC
           LIMIT 100`
        ).all();
        return json({ ok: true, logs: rows.results || [] });
      } catch (err) {
        console.error('GET /api/admin/ai-logs error:', err);
        return json({ error: 'Impossible de charger les journaux IA.' }, { status: 500 });
      }
    }

    // Authenticated customer: POST /api/ai/sessions/share -> create a shareable read-only snapshot in D1
    if (pathname === '/api/ai/sessions/share' && request.method === 'POST') {
      const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '';
      const session = token ? await verifyCustomerToken(env, token) : null;
      if (!session?.email) {
        return json({ error: 'Authentification requise pour partager une session.' }, { status: 401 });
      }
      if (!env.DB) {
        return json({ error: 'Base D1 non configurée.' }, { status: 500 });
      }

      const body = await readJson(request);
      const title = String(body?.title || 'Session Assistant IA — Éditions Émile Mourey').trim().slice(0, 180);
      const scope = String(body?.scope || 'all').trim().slice(0, 80);
      const messages = Array.isArray(body?.messages) ? body.messages.slice(0, 40) : [];
      if (messages.length === 0) {
        return json({ error: 'Impossible de partager une session vide.' }, { status: 400 });
      }

      const bytes = new Uint8Array(6);
      crypto.getRandomValues(bytes);
      const shareId = 'em-' + Array.from(bytes, (b) => b.toString(36).padStart(2, '0')).join('').slice(0, 10);
      const userId = customerIdFromEmail(session.email);
      const createdAt = new Date().toISOString().replace('T', ' ').slice(0, 19);
      const messagesJson = JSON.stringify(messages);
      const baseSite = (env.SITE_URL || 'https://pmourey.github.io/Livres-de-Jean').replace(/\/+$/, '');

      MEMORY_SHARED_SESSIONS.set(shareId, {
        id: shareId,
        user_id: userId,
        title,
        scope,
        messages_json: messagesJson,
        created_at: createdAt
      });

      try {
        if (env.DB) {
          await ensureTables(env.DB);
          await env.DB.prepare(
            `INSERT INTO ai_shared_sessions (id, user_id, title, scope, messages_json)
             VALUES (?, ?, ?, ?, ?)`
          )
            .bind(shareId, userId, title, scope, messagesJson)
            .run();
        }
      } catch (err) {
        console.warn('POST /api/ai/sessions/share D1 warning (kept in memory buffer):', err);
      }

      return json(
        {
          ok: true,
          shareId,
          shareUrl: `${baseSite}/#/ai/share/${shareId}`
        },
        { status: 201 }
      );
    }

    // Public read-only: GET /api/ai/sessions/share/:id -> load a shared AI chat session
    const shareMatch = pathname.match(/^\/api\/ai\/sessions\/share\/([a-zA-Z0-9_-]{4,32})$/);
    if (shareMatch && request.method === 'GET') {
      const shareId = shareMatch[1];
      let row = MEMORY_SHARED_SESSIONS.get(shareId) || null;
      if (!row && env.DB) {
        try {
          await ensureTables(env.DB);
          row = await env.DB.prepare(
            'SELECT id, user_id, title, scope, messages_json, created_at FROM ai_shared_sessions WHERE id = ?'
          )
            .bind(shareId)
            .first<{ id: string; user_id: string; title: string; scope: string; messages_json: string; created_at: string }>();
        } catch (err) {
          console.warn('GET /api/ai/sessions/share/:id D1 warning:', err);
        }
      }

      if (!row) {
        return json({ error: 'Session partagée introuvable ou expirée.' }, { status: 404 });
      }

      let messages = [];
      try {
        messages = JSON.parse(row.messages_json);
      } catch {
        messages = [];
      }

      return json({
        ok: true,
        session: {
          id: row.id,
          title: row.title,
          scope: row.scope,
          createdAt: row.created_at,
          messages
        }
      });
    }

    // Author Back-Office: Test SMTP configuration
    if (pathname === '/api/admin/test-email') {
      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders });
      }
      if (request.method === 'POST') {
        const body = await readJson(request);
        const recipient = String(body?.to || getGmailUser(env)).trim();
        const pwd = getGmailAppPwd(env);
        if (!pwd || pwd === 'xxxxx') {
          return json({
            ok: false,
            error: "Mot de passe d'application non configuré. Renseignez GMAIL_APP_PWD (ou MAIL_APP_PWD) dans wrangler.toml ou exécutez 'npx wrangler secret put GMAIL_APP_PWD' avant de déployer."
          }, { status: 400 });
        }

        const testResult = await sendGmailSmtp(
          env,
          recipient,
          'Test de configuration SMTP Gmail - Éditions Émile Mourey',
          `<p>Bonjour ${getGmailFullName(env)},</p><p>Votre serveur SMTP Gmail (${env.SMTP_SERVER || 'smtp.gmail.com'}:${env.SMTP_PORT || 465}) fonctionne avec succès depuis votre Cloudflare Worker !</p><p>Les codes de connexion OTP et récapitulatifs de commandes sont désormais expédiés via cette adresse officielle.</p>`
        );
        if (!testResult.success) {
          return json({ ok: false, error: testResult.error }, { status: 500 });
        }
        return json({ ok: true, message: `Email de test envoyé avec succès à ${recipient}` });
      }
    }

    if (pathname === '/api/account/login' && request.method === 'POST') {
      const body = await readJson(request);
      const email = String(body?.email || '').trim().toLowerCase();
      if (!email) {
        return json({ error: 'Missing email' }, { status: 400 });
      }
      const customerId = customerIdFromEmail(email);
      try {
        if (env.DB) {
          await env.DB.prepare(
            'INSERT INTO customers (id, email, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?) ON CONFLICT(email) DO UPDATE SET first_name=excluded.first_name, last_name=excluded.last_name, phone=excluded.phone'
          )
            .bind(
              customerId,
              email,
              String(body?.firstName || 'Client'),
              String(body?.lastName || ''),
              String(body?.phone || '')
            )
            .run();
        }
      } catch (dbErr) {
        console.warn('D1 login upsert warning (proceeding with stateless token):', dbErr);
      }
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
    } catch (unhandledErr: any) {
      console.error('Unhandled Worker error:', unhandledErr);
      return json(
        {
          error: unhandledErr?.message || 'Erreur interne du Cloudflare Worker.',
          code: 'WORKER_RUNTIME_ERROR'
        },
        { status: 500 }
      );
    }
  }
};
