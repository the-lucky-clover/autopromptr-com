-- Cloudflare D1 Database Schema Migration
-- This script creates all tables to match the current Supabase schema

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- User profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  is_super_user BOOLEAN DEFAULT FALSE,
  subscription TEXT DEFAULT 'free',
  preferred_language TEXT DEFAULT 'en',
  video_background_enabled BOOLEAN DEFAULT TRUE,
  video_background_url TEXT DEFAULT 'https://videos.pexels.com/video-files/852435/852435-hd_1920_1080_30fps.mp4',
  video_background_opacity INTEGER DEFAULT 85,
  video_background_blend_mode TEXT DEFAULT 'multiply',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Batches table
CREATE TABLE IF NOT EXISTS batches (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  platform TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  settings TEXT DEFAULT '{}', -- JSON as TEXT
  created_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  started_at DATETIME,
  completed_at DATETIME,
  stopped_at DATETIME
);

-- Prompts table
CREATE TABLE IF NOT EXISTS prompts (
  id TEXT PRIMARY KEY,
  batch_id TEXT,
  prompt_text TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  result TEXT,
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  processing_started_at DATETIME,
  processed_at DATETIME,
  processing_time_ms INTEGER,
  FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE
);

-- Automation logs table
CREATE TABLE IF NOT EXISTS automation_logs (
  id TEXT PRIMARY KEY,
  batch_id TEXT,
  user_id TEXT,
  level TEXT NOT NULL,
  message TEXT NOT NULL,
  ai_assistant_type TEXT,
  success_status TEXT DEFAULT 'pending',
  prompt_text TEXT,
  response_text TEXT,
  target_url TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  metadata TEXT DEFAULT '{}', -- JSON as TEXT
  prompt_sent_at DATETIME,
  response_received_at DATETIME,
  time_saved_seconds INTEGER
);

-- Platform sessions table
CREATE TABLE IF NOT EXISTS platform_sessions (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL,
  created_by TEXT,
  session_data TEXT DEFAULT '{}', -- JSON as TEXT
  is_active BOOLEAN DEFAULT TRUE,
  expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Productivity metrics table
CREATE TABLE IF NOT EXISTS productivity_metrics (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  total_prompts_processed INTEGER DEFAULT 0,
  total_time_saved_seconds INTEGER DEFAULT 0,
  successful_prompts INTEGER DEFAULT 0,
  failed_prompts INTEGER DEFAULT 0,
  platforms_used TEXT DEFAULT '[]', -- JSON as TEXT
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date)
);

-- Screenshots table
CREATE TABLE IF NOT EXISTS screenshots (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  session_id TEXT NOT NULL,
  url TEXT NOT NULL,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  prompt TEXT,
  metadata TEXT DEFAULT '{}', -- JSON as TEXT
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Security events table
CREATE TABLE IF NOT EXISTS security_events (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  event_type TEXT NOT NULL,
  event_data TEXT DEFAULT '{}', -- JSON as TEXT
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Newsletter subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image_url TEXT,
  published BOOLEAN DEFAULT FALSE,
  published_at DATETIME,
  author_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT
);

-- User verification status table
CREATE TABLE IF NOT EXISTS user_verification_status (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  verified_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Render syslog table
CREATE TABLE IF NOT EXISTS render_syslog (
  id TEXT PRIMARY KEY,
  batch_id TEXT,
  timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  severity INTEGER NOT NULL DEFAULT 6,
  facility INTEGER NOT NULL DEFAULT 16,
  hostname TEXT,
  app_name TEXT,
  proc_id TEXT,
  msg_id TEXT,
  message TEXT NOT NULL,
  raw_message TEXT,
  structured_data TEXT DEFAULT '{}', -- JSON as TEXT
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_batches_created_by ON batches(created_by);
CREATE INDEX IF NOT EXISTS idx_prompts_batch_id ON prompts(batch_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_batch_id ON automation_logs(batch_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_user_id ON automation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_sessions_created_by ON platform_sessions(created_by);
CREATE INDEX IF NOT EXISTS idx_productivity_metrics_user_date ON productivity_metrics(user_id, date);
CREATE INDEX IF NOT EXISTS idx_screenshots_user_id ON screenshots(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);