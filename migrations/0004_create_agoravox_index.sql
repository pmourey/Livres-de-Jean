-- Migration isolée : indexation plein texte des articles et commentaires AgoraVox d'Émile Mourey
-- Ne modifie ni ne touche à `orders`, `comments` ni `book_chunks`.

CREATE TABLE IF NOT EXISTS agoravox_chunks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_type TEXT NOT NULL CHECK (source_type IN ('article', 'comment')),
  article_title TEXT NOT NULL,
  article_url TEXT NOT NULL,
  source_url TEXT NOT NULL,
  author_name TEXT NOT NULL DEFAULT 'Émile Mourey',
  published_date TEXT DEFAULT '',
  chunk_index INTEGER NOT NULL DEFAULT 0,
  content TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agoravox_chunks_type_url
  ON agoravox_chunks (source_type, article_url);

CREATE VIRTUAL TABLE IF NOT EXISTS agoravox_chunks_fts USING fts5(
  source_type UNINDEXED,
  article_title,
  author_name,
  content,
  content='agoravox_chunks',
  content_rowid='id',
  tokenize='unicode61 remove_diacritics 2'
);

CREATE TRIGGER IF NOT EXISTS agoravox_chunks_ai AFTER INSERT ON agoravox_chunks BEGIN
  INSERT INTO agoravox_chunks_fts(rowid, source_type, article_title, author_name, content)
  VALUES (new.id, new.source_type, new.article_title, new.author_name, new.content);
END;

CREATE TRIGGER IF NOT EXISTS agoravox_chunks_ad AFTER DELETE ON agoravox_chunks BEGIN
  INSERT INTO agoravox_chunks_fts(agoravox_chunks_fts, rowid, source_type, article_title, author_name, content)
  VALUES ('delete', old.id, old.source_type, old.article_title, old.author_name, old.content);
END;

CREATE TRIGGER IF NOT EXISTS agoravox_chunks_au AFTER UPDATE ON agoravox_chunks BEGIN
  INSERT INTO agoravox_chunks_fts(agoravox_chunks_fts, rowid, source_type, article_title, author_name, content)
  VALUES ('delete', old.id, old.source_type, old.article_title, old.author_name, old.content);
  INSERT INTO agoravox_chunks_fts(rowid, source_type, article_title, author_name, content)
  VALUES (new.id, new.source_type, new.article_title, new.author_name, new.content);
END;
