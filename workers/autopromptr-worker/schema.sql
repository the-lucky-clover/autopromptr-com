-- D1 Database Schema for AutoPromptr
-- Run with: wrangler d1 execute autopromptr --file=./schema.sql

-- Batches table
CREATE TABLE IF NOT EXISTS batches (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  platform TEXT NOT NULL,
  target_url TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending', 'processing', 'completed', 'failed', 'stopped')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  started_at TEXT,
  completed_at TEXT,
  error_message TEXT,
  settings_json TEXT -- JSON string of batch settings
);

CREATE INDEX IF NOT EXISTS idx_batches_user_id ON batches(user_id);
CREATE INDEX IF NOT EXISTS idx_batches_status ON batches(status);
CREATE INDEX IF NOT EXISTS idx_batches_created_at ON batches(created_at DESC);

-- Prompts table
CREATE TABLE IF NOT EXISTS prompts (
  id TEXT PRIMARY KEY,
  batch_id TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending', 'processing', 'completed', 'failed', 'skipped')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  started_at TEXT,
  completed_at TEXT,
  result_json TEXT, -- JSON string of execution result
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_prompts_batch_id ON prompts(batch_id);
CREATE INDEX IF NOT EXISTS idx_prompts_order ON prompts(batch_id, order_index);
CREATE INDEX IF NOT EXISTS idx_prompts_status ON prompts(status);

-- Prompt Library table (for reusable prompts)
CREATE TABLE IF NOT EXISTS prompt_library (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags_json TEXT, -- JSON array of tags
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  use_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_library_user_id ON prompt_library(user_id);
CREATE INDEX IF NOT EXISTS idx_library_created_at ON prompt_library(created_at DESC);

-- Execution logs table (for debugging and analytics)
CREATE TABLE IF NOT EXISTS execution_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  batch_id TEXT NOT NULL,
  prompt_id TEXT,
  log_level TEXT NOT NULL CHECK(log_level IN ('info', 'warning', 'error', 'debug')),
  message TEXT NOT NULL,
  metadata_json TEXT, -- JSON string of additional data
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
  FOREIGN KEY (prompt_id) REFERENCES prompts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_logs_batch_id ON execution_logs(batch_id);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON execution_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_level ON execution_logs(log_level);

-- User settings table (preferences, API keys, etc.)
CREATE TABLE IF NOT EXISTS user_settings (
  user_id TEXT PRIMARY KEY,
  settings_json TEXT NOT NULL, -- JSON object with all settings
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Platform configurations table
CREATE TABLE IF NOT EXISTS platform_configs (
  id TEXT PRIMARY KEY,
  platform_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  config_name TEXT NOT NULL,
  selectors_json TEXT NOT NULL, -- JSON object with CSS selectors and wait conditions
  is_default BOOLEAN DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(platform_id, user_id, config_name)
);

CREATE INDEX IF NOT EXISTS idx_platform_configs_user ON platform_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_configs_platform ON platform_configs(platform_id);

-- Trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_batches_timestamp 
AFTER UPDATE ON batches
BEGIN
  UPDATE batches SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_library_timestamp 
AFTER UPDATE ON prompt_library
BEGIN
  UPDATE prompt_library SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_settings_timestamp 
AFTER UPDATE ON user_settings
BEGIN
  UPDATE user_settings SET updated_at = datetime('now') WHERE user_id = NEW.user_id;
END;

CREATE TRIGGER IF NOT EXISTS update_platform_configs_timestamp 
AFTER UPDATE ON platform_configs
BEGIN
  UPDATE platform_configs SET updated_at = datetime('now') WHERE id = NEW.id;
END;
