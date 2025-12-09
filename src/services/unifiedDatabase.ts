/**
 * Unified Database Service - Dual Supabase/Cloudflare D1 Support
 * 
 * This service provides a unified interface for database operations,
 * supporting both Supabase and Cloudflare D1 backends in parallel.
 * 
 * Configuration is controlled by environment variables:
 * - VITE_DATABASE_MODE: 'supabase' | 'cloudflare' | 'dual' (default: 'cloudflare')
 * - In 'dual' mode, writes go to both, reads prefer Cloudflare (primary)
 */

import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { cloudflare, isCloudflareConfigured } from '@/integrations/cloudflare/client';
import { Batch, TextPrompt, PromptResult } from '@/types/batch';

// Database mode configuration
export type DatabaseMode = 'supabase' | 'cloudflare' | 'dual';

const getDatabaseMode = (): DatabaseMode => {
  const mode = import.meta.env.VITE_DATABASE_MODE as DatabaseMode;
  if (mode === 'supabase' || mode === 'cloudflare' || mode === 'dual') {
    return mode;
  }
  // Default to cloudflare for free tier
  return 'cloudflare';
};

export const DATABASE_MODE = getDatabaseMode();

// Log configuration on load
console.log(`📊 Database Mode: ${DATABASE_MODE}`);
console.log(`   Supabase configured: ${isSupabaseConfigured}`);
console.log(`   Cloudflare configured: ${isCloudflareConfigured}`);

// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED DATABASE INTERFACE
// ═══════════════════════════════════════════════════════════════════════════════

export interface UnifiedDatabaseResult<T> {
  data: T | null;
  error: Error | null;
  source: 'supabase' | 'cloudflare' | 'both';
}

export interface BatchRecord {
  id: string;
  name: string;
  description?: string;
  platform: string;
  target_url?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'stopped';
  settings_json?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  user_id: string;
}

export interface PromptRecord {
  id: string;
  batch_id: string;
  prompt_text: string;
  order_index: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result_text?: string;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// USER AUTHENTICATION HELPER
// ═══════════════════════════════════════════════════════════════════════════════

async function getCurrentUserId(): Promise<string | null> {
  if (DATABASE_MODE === 'supabase' || DATABASE_MODE === 'dual') {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) return session.user.id;
    } catch (e) {
      console.warn('Supabase auth check failed:', e);
    }
  }
  
  if (DATABASE_MODE === 'cloudflare' || DATABASE_MODE === 'dual') {
    try {
      const { data: { session } } = await cloudflare.auth.getSession();
      if (session?.user?.id) return session.user.id;
    } catch (e) {
      console.warn('Cloudflare auth check failed:', e);
    }
  }
  
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// BATCH OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Save a batch to the database(s)
 */
export async function saveBatch(batch: Batch): Promise<UnifiedDatabaseResult<boolean>> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { data: null, error: new Error('User not authenticated'), source: 'cloudflare' };
  }

  const batchRecord: BatchRecord = {
    id: batch.id,
    name: batch.name,
    description: batch.description || '',
    platform: batch.platform || 'unknown',
    target_url: batch.targetUrl || '',
    status: batch.status || 'pending',
    settings_json: JSON.stringify(batch.settings || {}),
    created_at: batch.createdAt instanceof Date 
      ? batch.createdAt.toISOString() 
      : new Date(batch.createdAt).toISOString(),
    user_id: userId,
  };

  const errors: Error[] = [];
  let source: 'supabase' | 'cloudflare' | 'both' = 'cloudflare';

  // Write to Cloudflare D1 (primary for free tier)
  if ((DATABASE_MODE === 'cloudflare' || DATABASE_MODE === 'dual') && isCloudflareConfigured) {
    try {
      const { error } = await cloudflare.db.from('batches').insert([batchRecord]);
      if (error) errors.push(new Error(`Cloudflare: ${error.message}`));
      source = 'cloudflare';
    } catch (e) {
      errors.push(e instanceof Error ? e : new Error(String(e)));
    }
  }

  // Write to Supabase (if in dual or supabase mode)
  if ((DATABASE_MODE === 'supabase' || DATABASE_MODE === 'dual') && isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('batches').insert([batchRecord]);
      if (error) errors.push(new Error(`Supabase: ${error.message}`));
      source = DATABASE_MODE === 'dual' ? 'both' : 'supabase';
    } catch (e) {
      errors.push(e instanceof Error ? e : new Error(String(e)));
    }
  }

  // Save prompts
  if (batch.prompts && batch.prompts.length > 0) {
    for (const prompt of batch.prompts) {
      await savePrompt(batch.id, prompt);
    }
  }

  return {
    data: errors.length === 0,
    error: errors.length > 0 ? new Error(errors.map(e => e.message).join('; ')) : null,
    source,
  };
}

/**
 * Save a prompt to the database(s)
 */
export async function savePrompt(batchId: string, prompt: TextPrompt): Promise<UnifiedDatabaseResult<boolean>> {
  const promptRecord: PromptRecord = {
    id: prompt.id,
    batch_id: batchId,
    prompt_text: prompt.text,
    order_index: prompt.order,
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  const errors: Error[] = [];
  let source: 'supabase' | 'cloudflare' | 'both' = 'cloudflare';

  // Write to Cloudflare D1
  if ((DATABASE_MODE === 'cloudflare' || DATABASE_MODE === 'dual') && isCloudflareConfigured) {
    try {
      const { error } = await cloudflare.db.from('prompts').insert([promptRecord]);
      if (error) errors.push(new Error(`Cloudflare: ${error.message}`));
    } catch (e) {
      errors.push(e instanceof Error ? e : new Error(String(e)));
    }
  }

  // Write to Supabase
  if ((DATABASE_MODE === 'supabase' || DATABASE_MODE === 'dual') && isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('prompts').insert([promptRecord]);
      if (error) errors.push(new Error(`Supabase: ${error.message}`));
      source = DATABASE_MODE === 'dual' ? 'both' : 'supabase';
    } catch (e) {
      errors.push(e instanceof Error ? e : new Error(String(e)));
    }
  }

  return {
    data: errors.length === 0,
    error: errors.length > 0 ? new Error(errors.map(e => e.message).join('; ')) : null,
    source,
  };
}

/**
 * Get all batches for the current user
 */
export async function getBatches(): Promise<UnifiedDatabaseResult<Batch[]>> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { data: [], error: new Error('User not authenticated'), source: 'cloudflare' };
  }

  // Primary: Cloudflare D1
  if ((DATABASE_MODE === 'cloudflare' || DATABASE_MODE === 'dual') && isCloudflareConfigured) {
    try {
      const { data, error } = await cloudflare.db
        .from('batches')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const batches = await Promise.all(data.map(async (record: BatchRecord) => {
          const prompts = await getPromptsForBatch(record.id);
          return recordToBatch(record, prompts.data || []);
        }));
        return { data: batches, error: null, source: 'cloudflare' };
      }
    } catch (e) {
      console.warn('Cloudflare read failed, trying Supabase:', e);
    }
  }

  // Fallback: Supabase
  if ((DATABASE_MODE === 'supabase' || DATABASE_MODE === 'dual') && isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('batches')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const batches = await Promise.all(data.map(async (record: BatchRecord) => {
          const prompts = await getPromptsForBatch(record.id);
          return recordToBatch(record, prompts.data || []);
        }));
        return { data: batches, error: null, source: 'supabase' };
      }

      return { data: null, error: new Error(error?.message || 'Unknown error'), source: 'supabase' };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e : new Error(String(e)), source: 'supabase' };
    }
  }

  return { data: [], error: new Error('No database configured'), source: 'cloudflare' };
}

/**
 * Get a single batch by ID
 */
export async function getBatchById(batchId: string): Promise<UnifiedDatabaseResult<Batch | null>> {
  // Primary: Cloudflare D1
  if ((DATABASE_MODE === 'cloudflare' || DATABASE_MODE === 'dual') && isCloudflareConfigured) {
    try {
      const { data, error } = await cloudflare.db
        .from('batches')
        .select('*')
        .eq('id', batchId)
        .single();

      if (!error && data) {
        const prompts = await getPromptsForBatch(batchId);
        return { data: recordToBatch(data, prompts.data || []), error: null, source: 'cloudflare' };
      }
    } catch (e) {
      console.warn('Cloudflare read failed, trying Supabase:', e);
    }
  }

  // Fallback: Supabase
  if ((DATABASE_MODE === 'supabase' || DATABASE_MODE === 'dual') && isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('batches')
        .select('*')
        .eq('id', batchId)
        .single();

      if (!error && data) {
        const prompts = await getPromptsForBatch(batchId);
        return { data: recordToBatch(data, prompts.data || []), error: null, source: 'supabase' };
      }

      return { data: null, error: error ? new Error(error.message) : null, source: 'supabase' };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e : new Error(String(e)), source: 'supabase' };
    }
  }

  return { data: null, error: new Error('No database configured'), source: 'cloudflare' };
}

/**
 * Get prompts for a batch
 */
export async function getPromptsForBatch(batchId: string): Promise<UnifiedDatabaseResult<TextPrompt[]>> {
  // Primary: Cloudflare D1
  if ((DATABASE_MODE === 'cloudflare' || DATABASE_MODE === 'dual') && isCloudflareConfigured) {
    try {
      const { data, error } = await cloudflare.db
        .from('prompts')
        .select('*')
        .eq('batch_id', batchId)
        .order('order_index', { ascending: true });

      if (!error && data) {
        return { 
          data: data.map((r: PromptRecord) => ({ id: r.id, text: r.prompt_text, order: r.order_index })), 
          error: null, 
          source: 'cloudflare' 
        };
      }
    } catch (e) {
      console.warn('Cloudflare prompts read failed:', e);
    }
  }

  // Fallback: Supabase
  if ((DATABASE_MODE === 'supabase' || DATABASE_MODE === 'dual') && isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('batch_id', batchId)
        .order('order_index', { ascending: true });

      if (!error && data) {
        return { 
          data: data.map((r: PromptRecord) => ({ id: r.id, text: r.prompt_text, order: r.order_index })), 
          error: null, 
          source: 'supabase' 
        };
      }
    } catch (e) {
      return { data: [], error: e instanceof Error ? e : new Error(String(e)), source: 'supabase' };
    }
  }

  return { data: [], error: null, source: 'cloudflare' };
}

/**
 * Update batch status
 */
export async function updateBatchStatus(
  batchId: string, 
  status: BatchRecord['status'],
  additionalFields?: Partial<BatchRecord>
): Promise<UnifiedDatabaseResult<boolean>> {
  const updates: Partial<BatchRecord> = { status, ...additionalFields };
  
  if (status === 'running' && !additionalFields?.started_at) {
    updates.started_at = new Date().toISOString();
  }
  if ((status === 'completed' || status === 'failed' || status === 'stopped') && !additionalFields?.completed_at) {
    updates.completed_at = new Date().toISOString();
  }

  const errors: Error[] = [];
  let source: 'supabase' | 'cloudflare' | 'both' = 'cloudflare';

  // Update Cloudflare D1
  if ((DATABASE_MODE === 'cloudflare' || DATABASE_MODE === 'dual') && isCloudflareConfigured) {
    try {
      const { error } = await cloudflare.db
        .from('batches')
        .update(updates)
        .eq('id', batchId);
      if (error) errors.push(new Error(`Cloudflare: ${error.message}`));
    } catch (e) {
      errors.push(e instanceof Error ? e : new Error(String(e)));
    }
  }

  // Update Supabase
  if ((DATABASE_MODE === 'supabase' || DATABASE_MODE === 'dual') && isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('batches')
        .update(updates)
        .eq('id', batchId);
      if (error) errors.push(new Error(`Supabase: ${error.message}`));
      source = DATABASE_MODE === 'dual' ? 'both' : 'supabase';
    } catch (e) {
      errors.push(e instanceof Error ? e : new Error(String(e)));
    }
  }

  return {
    data: errors.length === 0,
    error: errors.length > 0 ? new Error(errors.map(e => e.message).join('; ')) : null,
    source,
  };
}

/**
 * Delete a batch and its prompts
 */
export async function deleteBatch(batchId: string): Promise<UnifiedDatabaseResult<boolean>> {
  const errors: Error[] = [];
  let source: 'supabase' | 'cloudflare' | 'both' = 'cloudflare';

  // Delete from Cloudflare D1
  if ((DATABASE_MODE === 'cloudflare' || DATABASE_MODE === 'dual') && isCloudflareConfigured) {
    try {
      // Delete prompts first
      await cloudflare.db.from('prompts').delete().eq('batch_id', batchId);
      // Delete batch
      const { error } = await cloudflare.db.from('batches').delete().eq('id', batchId);
      if (error) errors.push(new Error(`Cloudflare: ${error.message}`));
    } catch (e) {
      errors.push(e instanceof Error ? e : new Error(String(e)));
    }
  }

  // Delete from Supabase
  if ((DATABASE_MODE === 'supabase' || DATABASE_MODE === 'dual') && isSupabaseConfigured) {
    try {
      // Delete prompts first
      await supabase.from('prompts').delete().eq('batch_id', batchId);
      // Delete batch
      const { error } = await supabase.from('batches').delete().eq('id', batchId);
      if (error) errors.push(new Error(`Supabase: ${error.message}`));
      source = DATABASE_MODE === 'dual' ? 'both' : 'supabase';
    } catch (e) {
      errors.push(e instanceof Error ? e : new Error(String(e)));
    }
  }

  return {
    data: errors.length === 0,
    error: errors.length > 0 ? new Error(errors.map(e => e.message).join('; ')) : null,
    source,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function recordToBatch(record: BatchRecord, prompts: TextPrompt[]): Batch {
  return {
    id: record.id,
    name: record.name,
    description: record.description,
    platform: record.platform as Batch['platform'],
    targetUrl: record.target_url || '',
    status: record.status,
    prompts: prompts,
    settings: record.settings_json ? JSON.parse(record.settings_json) : {},
    createdAt: new Date(record.created_at),
    startedAt: record.started_at ? new Date(record.started_at) : undefined,
    completedAt: record.completed_at ? new Date(record.completed_at) : undefined,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATISTICS
// ═══════════════════════════════════════════════════════════════════════════════

export interface BatchStats {
  totalBatches: number;
  completedBatches: number;
  runningBatches: number;
  failedBatches: number;
  pendingBatches: number;
  successRate: number;
}

export async function getBatchStats(): Promise<UnifiedDatabaseResult<BatchStats>> {
  const batchesResult = await getBatches();
  
  if (batchesResult.error || !batchesResult.data) {
    return { 
      data: { totalBatches: 0, completedBatches: 0, runningBatches: 0, failedBatches: 0, pendingBatches: 0, successRate: 0 }, 
      error: batchesResult.error, 
      source: batchesResult.source 
    };
  }

  const batches = batchesResult.data;
  const total = batches.length;
  const completed = batches.filter(b => b.status === 'completed').length;
  const running = batches.filter(b => b.status === 'running').length;
  const failed = batches.filter(b => b.status === 'failed').length;
  const pending = batches.filter(b => b.status === 'pending').length;

  return {
    data: {
      totalBatches: total,
      completedBatches: completed,
      runningBatches: running,
      failedBatches: failed,
      pendingBatches: pending,
      successRate: total > 0 ? Math.round((completed / (completed + failed || 1)) * 100) : 0,
    },
    error: null,
    source: batchesResult.source,
  };
}

// Export for convenience
export { isSupabaseConfigured, isCloudflareConfigured };
