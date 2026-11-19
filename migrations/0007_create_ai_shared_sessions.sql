-- Migration isolée : partage public en lecture seule de sessions de chat de l'Assistant IA
-- Ne modifie ni ne touche à `orders` ni aux autres tables existantes.

CREATE TABLE IF NOT EXISTS ai_shared_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  scope TEXT DEFAULT 'all',
  messages_json TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
