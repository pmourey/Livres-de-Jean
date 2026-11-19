-- Migration isolée : création de la table des commentaires modérés a priori
-- Ne modifie ni ne touche à la table `orders` ni aux autres tables existantes.
-- Application via : npx wrangler d1 migrations apply livres_de_jean --remote

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
);

CREATE INDEX IF NOT EXISTS idx_comments_slug_status
  ON comments (target_slug, status, created_at DESC);
