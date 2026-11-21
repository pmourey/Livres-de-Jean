-- Migration 0010 : Table de journalisation anonymisée des requêtes IA (Levier 1 RAG)
-- Permet de détecter les "trous documentaires" (questions avec 0 source livre/scientifique),
-- d'enregistrer les retours lecteurs (pouce haut / bas) et d'enrichir progressivement les corpus D1.
-- Ne modifie ni ne touche aux tables existantes (`orders`, `book_chunks`, `agoravox_chunks`, `academic_chunks`).

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
  feedback INTEGER DEFAULT 0, -- 1 = utile, -1 = imprécis, 0 = non évalué
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_query_logs_created
  ON ai_query_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_query_logs_gaps
  ON ai_query_logs (chunks_used, academic_used, created_at DESC);
