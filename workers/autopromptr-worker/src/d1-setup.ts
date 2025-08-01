// D1 Database Setup and Migration Utilities
import type { D1Database } from '@cloudflare/workers-types';

export async function initializeD1Database(db: D1Database): Promise<void> {
  const schemas = `
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
      settings TEXT DEFAULT '{}',
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

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_batches_created_by ON batches(created_by);
    CREATE INDEX IF NOT EXISTS idx_prompts_batch_id ON prompts(batch_id);
  `;

  try {
    await db.exec(schemas);
    console.log('D1 database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize D1 database:', error);
    throw error;
  }
}

export async function migrateDataFromSupabase(
  db: D1Database,
  supabaseUrl: string,
  supabaseKey: string
): Promise<void> {
  // This function would handle the data migration from Supabase to D1
  // For now, it's a placeholder for the migration logic
  console.log('Data migration from Supabase to D1 not yet implemented');
  console.log('Supabase URL:', supabaseUrl);
  console.log('Database ready for migration');
}

export async function healthCheckD1(db: D1Database): Promise<boolean> {
  try {
    const result = await db.prepare('SELECT 1 as health').first();
    return result?.health === 1;
  } catch (error) {
    console.error('D1 health check failed:', error);
    return false;
  }
}