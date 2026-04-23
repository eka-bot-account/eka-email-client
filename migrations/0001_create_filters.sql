-- Email filters table
CREATE TABLE IF NOT EXISTS email_filters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  field TEXT NOT NULL,        -- 'from_address', 'subject', 'to_address'
  operator TEXT NOT NULL,     -- 'contains', 'equals', 'starts_with'
  value TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
