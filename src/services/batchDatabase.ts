/**
 * Batch Database Service - Dual Supabase/Cloudflare D1 Support
 * 
 * This service provides backward-compatible functions for batch operations,
 * now powered by the unified database service.
 */

import { 
  saveBatch as unifiedSaveBatch, 
  getBatches, 
  getBatchById,
  updateBatchStatus as unifiedUpdateStatus,
  deleteBatch as unifiedDeleteBatch,
  DATABASE_MODE 
} from './unifiedDatabase';
import { Batch } from '@/types/batch';

console.log(`🗄️ Batch Database using mode: ${DATABASE_MODE}`);

export const saveBatchToDatabase = async (batch: Batch): Promise<boolean> => {
  console.log('Saving batch to database:', batch.id);
  const result = await unifiedSaveBatch(batch);
  
  if (result.error) {
    console.error('Failed to save batch:', result.error);
    return false;
  }
  
  console.log(`✅ Batch saved successfully via ${result.source}`);
  return true;
};

export const verifyBatchInDatabase = async (batchId: string): Promise<boolean> => {
  const result = await getBatchById(batchId);
  return result.data !== null;
};

export const getUserBatches = async (): Promise<Batch[]> => {
  const result = await getBatches();
  return result.data || [];
};

export const updateBatchStatus = async (
  batchId: string, 
  status: 'pending' | 'running' | 'completed' | 'failed' | 'stopped'
): Promise<boolean> => {
  const result = await unifiedUpdateStatus(batchId, status);
  return result.data === true;
};

export const deleteBatchFromDatabase = async (batchId: string): Promise<boolean> => {
  const result = await unifiedDeleteBatch(batchId);
  return result.data === true;
};
