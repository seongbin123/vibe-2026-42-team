CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  subject TEXT,
  department TEXT,
  price INTEGER NOT NULL,
  condition TEXT NOT NULL CHECK(condition IN ('상', '중', '하')),
  description TEXT,
  contact TEXT NOT NULL,
  is_sold INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
