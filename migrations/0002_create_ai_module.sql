-- Migration isolée : module Assistant IA (abonnements + index littéral des 12 ouvrages)
-- Ne modifie ni ne touche à la table `orders` ni aux autres tables existantes.
-- Application via : npx wrangler d1 migrations apply livres_de_jean --remote

CREATE TABLE IF NOT EXISTS ai_subscriptions (
  user_id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'beta_free' CHECK (plan IN ('beta_free', 'monthly', 'annual')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  activated_at TEXT NOT NULL,
  expires_at TEXT
);

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
);

CREATE INDEX IF NOT EXISTS idx_book_chunks_book_page
  ON book_chunks (book_id, page_number, chunk_index);

-- Index plein texte FTS5 pour la recherche littérale en temps réel sur les 12 ouvrages
CREATE VIRTUAL TABLE IF NOT EXISTS book_chunks_fts USING fts5(
  book_id UNINDEXED,
  book_title,
  tome,
  chapter,
  content,
  content='book_chunks',
  content_rowid='id',
  tokenize='unicode61 remove_diacritics 2'
);

CREATE TRIGGER IF NOT EXISTS book_chunks_ai AFTER INSERT ON book_chunks BEGIN
  INSERT INTO book_chunks_fts(rowid, book_id, book_title, tome, chapter, content)
  VALUES (new.id, new.book_id, new.book_title, new.tome, new.chapter, new.content);
END;

CREATE TRIGGER IF NOT EXISTS book_chunks_ad AFTER DELETE ON book_chunks BEGIN
  INSERT INTO book_chunks_fts(book_chunks_fts, rowid, book_id, book_title, tome, chapter, content)
  VALUES ('delete', old.id, old.book_id, old.book_title, old.tome, old.chapter, old.content);
END;

CREATE TRIGGER IF NOT EXISTS book_chunks_au AFTER UPDATE ON book_chunks BEGIN
  INSERT INTO book_chunks_fts(book_chunks_fts, rowid, book_id, book_title, tome, chapter, content)
  VALUES ('delete', old.id, old.book_id, old.book_title, old.tome, old.chapter, old.content);
  INSERT INTO book_chunks_fts(rowid, book_id, book_title, tome, chapter, content)
  VALUES (new.id, new.book_id, new.book_title, new.tome, new.chapter, new.content);
END;
