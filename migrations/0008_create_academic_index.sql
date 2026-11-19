-- Migration isolée : indexation plein texte des publications scientifiques officielles
-- (CNRS, HAL-SHS, Gallia / Persée, INRAP, thèses universitaires et rapports de fouilles)
-- Ne modifie ni ne touche à `orders`, `book_chunks` ni `agoravox_chunks`.

CREATE TABLE IF NOT EXISTS academic_chunks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  doc_type TEXT NOT NULL DEFAULT 'article', -- 'article' | 'thesis' | 'book' | 'report'
  title TEXT NOT NULL,
  authors TEXT NOT NULL,
  published_year TEXT DEFAULT '',
  journal_or_institution TEXT DEFAULT '',
  source_url TEXT NOT NULL UNIQUE,
  theme TEXT DEFAULT '',
  content TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_academic_chunks_theme
  ON academic_chunks (theme, published_year DESC);

CREATE VIRTUAL TABLE IF NOT EXISTS academic_chunks_fts USING fts5(
  doc_type UNINDEXED,
  title,
  authors,
  journal_or_institution,
  theme,
  content,
  content='academic_chunks',
  content_rowid='id',
  tokenize='unicode61 remove_diacritics 2'
);

CREATE TRIGGER IF NOT EXISTS academic_chunks_ai AFTER INSERT ON academic_chunks BEGIN
  INSERT INTO academic_chunks_fts(rowid, doc_type, title, authors, journal_or_institution, theme, content)
  VALUES (new.id, new.doc_type, new.title, new.authors, new.journal_or_institution, new.theme, new.content);
END;

CREATE TRIGGER IF NOT EXISTS academic_chunks_ad AFTER DELETE ON academic_chunks BEGIN
  INSERT INTO academic_chunks_fts(academic_chunks_fts, rowid, doc_type, title, authors, journal_or_institution, theme, content)
  VALUES ('delete', old.id, old.doc_type, old.title, old.authors, old.journal_or_institution, old.theme, old.content);
END;

CREATE TRIGGER IF NOT EXISTS academic_chunks_au AFTER UPDATE ON academic_chunks BEGIN
  INSERT INTO academic_chunks_fts(academic_chunks_fts, rowid, doc_type, title, authors, journal_or_institution, theme, content)
  VALUES ('delete', old.id, old.doc_type, old.title, old.authors, old.journal_or_institution, old.theme, old.content);
  INSERT INTO academic_chunks_fts(rowid, doc_type, title, authors, journal_or_institution, theme, content)
  VALUES (new.id, new.doc_type, new.title, new.authors, new.journal_or_institution, new.theme, new.content);
END;
