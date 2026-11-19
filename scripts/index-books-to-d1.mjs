#!/usr/bin/env node
/**
 * Script d'indexation littérale des ouvrages PDF d'Émile Mourey vers Cloudflare D1 (table `book_chunks`).
 *
 * Deux modes supportés :
 *   1. Directement depuis le bucket Cloudflare R2 `ebooks-jean` (à la racine) :
 *      node scripts/index-books-to-d1.mjs --r2 ebooks-jean --admin-secret VOTRE_SECRET_ADMIN
 *      (ou en passant explicitement les noms de fichiers R2 :
 *       node scripts/index-books-to-d1.mjs --r2 ebooks-jean livre1.pdf livre2.pdf ...)
 *
 *   2. Depuis un dossier local contenant les PDF :
 *      node scripts/index-books-to-d1.mjs ./pdfs
 *
 * Puis importer dans Cloudflare D1 (le fichier SQL est ignoré par .gitignore pour protéger les droits d'auteur) :
 *   npx wrangler d1 migrations apply livres_de_jean --remote
 *   npx wrangler d1 execute livres_de_jean --remote --file=migrations/0003_seed_book_chunks.sql
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const OUTPUT_SQL = path.resolve('migrations/0003_seed_book_chunks.sql');
const WORKER_BASE = (
  process.env.VITE_PAYMENTS_API_BASE ||
  'https://livres-de-jean-payments.super-violet-dc40.workers.dev'
).replace(/\/+$/, '');
const CHUNK_SIZE = 1200;
const CHUNK_OVERLAP = 200;

const BOOK_MATCHERS = [
  { match: /gergovie/i, bookId: 'mourey-gergovie-tome-1', title: 'Histoire de Gergovie', tome: 'Tome 1' },
  { match: /bouclier|tome.?2/i, bookId: 'mourey-bibracte-tome-2-bouclier-eduen', title: 'Histoire de Bibracte', tome: 'Tome 2 : Le Bouclier Éduen' },
  { match: /epee|épée|flamboyante|tome.?3/i, bookId: 'mourey-bibracte-tome-3-epee-flamboyante', title: 'Histoire de Bibracte', tome: "Tome 3 : L'Épée Flamboyante" },
  { match: /rayonnant|tome.?4/i, bookId: 'mourey-bibracte-tome-4-dieu-rayonnant', title: 'Histoire de Bibracte', tome: 'Tome 4 : Dieu Rayonnant' },
  { match: /cache|caché|tome.?5/i, bookId: 'mourey-bibracte-tome-5-dieu-cache', title: 'Histoire de Bibracte', tome: 'Tome 5 : Dieu Caché' },
  { match: /christ.*(2|ii\b|tome.?2)/i, bookId: 'mourey-christ-tome-2', title: 'Histoire du Christ', tome: 'Tome 2' },
  { match: /christ/i, bookId: 'mourey-christ-tome-1', title: 'Histoire du Christ', tome: 'Tome 1' },
  { match: /mahomet.*(2|ii\b|tome.?2)/i, bookId: 'mourey-mahomet-tome-2', title: 'Histoire de Mahomet', tome: 'Tome 2' },
  { match: /mahomet/i, bookId: 'mourey-mahomet-tome-1', title: 'Histoire de Mahomet', tome: 'Tome 1' },
  { match: /gaule.*(2|2eme|2ème)/i, bookId: 'mourey-gaule-en-heritage', title: 'La Gaule en héritage', tome: '2ème partie' },
  { match: /gaule|heritage|héritage|1ere|1ère/i, bookId: 'mourey-gaule-en-heritage', title: 'La Gaule en héritage', tome: '1ère partie' }
];

const sqlEscape = (str) => `'${String(str ?? '').replace(/'/g, "''")}'`;

function splitIntoChunks(text, maxLen = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
  const cleaned = text.replace(/\r/g, '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  if (!cleaned) return [];
  if (cleaned.length <= maxLen) return [cleaned];

  const chunks = [];
  let start = 0;
  while (start < cleaned.length) {
    let end = Math.min(start + maxLen, cleaned.length);
    if (end < cleaned.length) {
      const lastBreak = Math.max(cleaned.lastIndexOf('\n\n', end), cleaned.lastIndexOf('. ', end));
      if (lastBreak > start + maxLen * 0.5) {
        end = lastBreak + 1;
      }
    }
    const slice = cleaned.slice(start, end).trim();
    if (slice.length > 40) chunks.push(slice);
    if (end >= cleaned.length) break;
    start = Math.max(0, end - overlap);
  }
  return chunks;
}

function resolveBookMeta(filename) {
  for (const rule of BOOK_MATCHERS) {
    if (rule.match.test(filename)) return rule;
  }
  const base = path.basename(filename, path.extname(filename));
  return {
    bookId: base.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    title: base.replace(/[_-]+/g, ' '),
    tome: ''
  };
}

async function listR2KeysViaWorker(adminSecret) {
  const authRes = await fetch(`${WORKER_BASE}/api/admin/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret: adminSecret })
  });
  const authData = await authRes.json().catch(() => null);
  if (!authRes.ok || !authData?.token) {
    throw new Error(authData?.error || `Échec d'authentification admin sur ${WORKER_BASE} (${authRes.status})`);
  }

  const listRes = await fetch(`${WORKER_BASE}/api/admin/r2-list`, {
    headers: { Authorization: `Bearer ${authData.token}` }
  });
  const listData = await listRes.json().catch(() => null);
  if (!listRes.ok) {
    throw new Error(listData?.error || `Impossible de lister le bucket R2 (${listRes.status}). Vérifiez que le Worker est déployé.`);
  }
  return (listData.objects || [])
    .map((o) => o.key)
    .filter((k) => k.toLowerCase().endsWith('.pdf'));
}

async function main() {
  const args = process.argv.slice(2);
  const isR2Mode = args[0] === '--r2';

  let tempDir = null;
  let pdfEntries = []; // Array<{ label: string, localPath: string }>

  try {
    if (isR2Mode) {
      const bucket = args[1] || 'ebooks-jean';
      const secretIdx = args.indexOf('--admin-secret');
      const adminSecret =
        secretIdx > -1 ? args[secretIdx + 1] : process.env.ADMIN_SECRET || '';

      let keys = args
        .slice(2)
        .filter((a, idx) => {
          const absIdx = idx + 2;
          return a !== '--admin-secret' && absIdx !== secretIdx + 1;
        });

      if (keys.length === 0) {
        if (!adminSecret) {
          console.error(
            'En mode --r2 sans liste de clés explicites, passez --admin-secret <VOTRE_CLE_ADMIN> (ou la variable ADMIN_SECRET) pour lister automatiquement les PDF du bucket R2.'
          );
          process.exit(1);
        }
        console.log(`Récupération de la liste des PDF dans R2 (${bucket}) via ${WORKER_BASE}...`);
        keys = await listR2KeysViaWorker(adminSecret);
      }

      if (keys.length === 0) {
        console.error(`Aucun fichier .pdf trouvé dans le bucket R2 '${bucket}'.`);
        process.exit(1);
      }

      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'emile-mourey-r2-'));
      console.log(`Téléchargement de ${keys.length} PDF depuis R2 '${bucket}'...`);

      for (const key of keys) {
        const safeName = key.replace(/[\\/]+/g, '__');
        const dest = path.join(tempDir, safeName);
        console.log(`  ↓ ${bucket}/${key}`);
        execFileSync(
          'npx',
          ['wrangler', 'r2', 'object', 'get', `${bucket}/${key}`, '--remote', '--file', dest],
          { stdio: 'pipe' }
        );
        pdfEntries.push({ label: key, localPath: dest });
      }
    } else {
      const inputDir = args[0] || './pdfs';
      if (!fs.existsSync(inputDir)) {
        console.error(`Dossier introuvable : ${inputDir}`);
        console.error('Exemples :');
        console.error('  node scripts/index-books-to-d1.mjs --r2 ebooks-jean --admin-secret VOTRE_SECRET');
        console.error('  node scripts/index-books-to-d1.mjs ./pdfs');
        process.exit(1);
      }
      pdfEntries = fs
        .readdirSync(inputDir)
        .filter((f) => f.toLowerCase().endsWith('.pdf'))
        .sort()
        .map((f) => ({ label: f, localPath: path.join(inputDir, f) }));
    }

    if (pdfEntries.length === 0) {
      console.error('Aucun fichier PDF à indexer.');
      process.exit(1);
    }

    const lines = [
      '-- Généré automatiquement par scripts/index-books-to-d1.mjs',
      '-- NE PAS COMMITER SUR GIT (fichier ignoré par .gitignore pour protéger les droits d’auteur)',
      'DELETE FROM book_chunks;'
    ];

    let totalChunks = 0;

    for (const entry of pdfEntries) {
      const meta = resolveBookMeta(entry.label);
      console.log(`Indexation : ${entry.label} -> [${meta.bookId}] ${meta.title} (${meta.tome})`);

      const rawText = execFileSync('pdftotext', ['-enc', 'UTF-8', entry.localPath, '-'], {
        encoding: 'utf8',
        maxBuffer: 100 * 1024 * 1024
      });

      const pages = rawText.split('\f');
      pages.forEach((pageText, pageIdx) => {
        const pageNumber = pageIdx + 1;
        const chunks = splitIntoChunks(pageText);
        chunks.forEach((chunk, chunkIdx) => {
          lines.push(
            `INSERT INTO book_chunks (book_id, book_title, tome, page_number, chapter, chunk_index, content) VALUES (${sqlEscape(
              meta.bookId
            )}, ${sqlEscape(meta.title)}, ${sqlEscape(meta.tome)}, ${pageNumber}, '', ${chunkIdx}, ${sqlEscape(chunk)});`
          );
          totalChunks += 1;
        });
      });
    }

    fs.mkdirSync(path.dirname(OUTPUT_SQL), { recursive: true });
    fs.writeFileSync(OUTPUT_SQL, lines.join('\n') + '\n', 'utf8');

    console.log(`\n✓ Terminé ! ${totalChunks} passages littéraux générés dans ${OUTPUT_SQL}`);
    console.log('Pour importer dans Cloudflare D1 :');
    console.log('  npx wrangler d1 migrations apply livres_de_jean --remote');
    console.log('  npx wrangler d1 execute livres_de_jean --remote --file=migrations/0003_seed_book_chunks.sql');
  } finally {
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }
}

main().catch((err) => {
  console.error('Erreur:', err?.message || err);
  process.exit(1);
});
