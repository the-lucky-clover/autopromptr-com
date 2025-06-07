
import { useState, useEffect } from 'react';
import { Batch } from '@/types/batch';

const STORAGE_KEY = 'autopromptr_batches';
const BACKUP_STORAGE_KEY = 'autopromptr_batches_backup';

export const usePersistentBatches = () => {
  const [batches, setBatches] = useState<Batch[]>([]);

  // Load batches from localStorage on mount
  useEffect(() => {
    try {
      console.log('Loading batches from localStorage...');
      const savedBatches = localStorage.getItem(STORAGE_KEY);
      console.log('Raw saved batches:', savedBatches);
      
      if (savedBatches) {
        const parsedBatches = JSON.parse(savedBatches);
        console.log('Parsed batches:', parsedBatches);
        
        // Convert date strings back to Date objects
        const batchesWithDates = parsedBatches.map((batch: any) => ({
          ...batch,
          createdAt: new Date(batch.createdAt)
        }));
        
        console.log(`Successfully loaded ${batchesWithDates.length} batches from localStorage`);
        setBatches(batchesWithDates);
        
        // Create a backup
        localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(batchesWithDates));
      } else {
        // Try to recover from backup
        console.log('No batches found in main storage, checking backup...');
        const backupBatches = localStorage.getItem(BACKUP_STORAGE_KEY);
        if (backupBatches) {
          console.log('Found backup batches, restoring...');
          const parsedBackup = JSON.parse(backupBatches);
          const batchesWithDates = parsedBackup.map((batch: any) => ({
            ...batch,
            createdAt: new Date(batch.createdAt)
          }));
          setBatches(batchesWithDates);
          // Restore to main storage
          localStorage.setItem(STORAGE_KEY, JSON.stringify(batchesWithDates));
        } else {
          console.log('No backup found either. Starting fresh.');
        }
      }
    } catch (error) {
      console.error('Failed to load batches from localStorage:', error);
      
      // Try to recover from backup on error
      try {
        const backupBatches = localStorage.getItem(BACKUP_STORAGE_KEY);
        if (backupBatches) {
          console.log('Attempting recovery from backup due to error...');
          const parsedBackup = JSON.parse(backupBatches);
          const batchesWithDates = parsedBackup.map((batch: any) => ({
            ...batch,
            createdAt: new Date(batch.createdAt)
          }));
          setBatches(batchesWithDates);
        }
      } catch (backupError) {
        console.error('Backup recovery also failed:', backupError);
      }
    }
  }, []);

  // Save batches to localStorage whenever batches change
  useEffect(() => {
    if (batches.length > 0) {
      try {
        console.log(`Saving ${batches.length} batches to localStorage...`);
        const dataToSave = JSON.stringify(batches);
        localStorage.setItem(STORAGE_KEY, dataToSave);
        localStorage.setItem(BACKUP_STORAGE_KEY, dataToSave);
        console.log('Batches saved successfully');
      } catch (error) {
        console.error('Failed to save batches to localStorage:', error);
      }
    }
  }, [batches]);

  const updateBatches = (newBatches: Batch[] | ((prev: Batch[]) => Batch[])) => {
    setBatches(newBatches);
  };

  const clearAllBatches = () => {
    setBatches([]);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(BACKUP_STORAGE_KEY);
  };

  const recoverFromBackup = () => {
    try {
      const backupBatches = localStorage.getItem(BACKUP_STORAGE_KEY);
      if (backupBatches) {
        const parsedBackup = JSON.parse(backupBatches);
        const batchesWithDates = parsedBackup.map((batch: any) => ({
          ...batch,
          createdAt: new Date(batch.createdAt)
        }));
        setBatches(batchesWithDates);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(batchesWithDates));
        return true;
      }
    } catch (error) {
      console.error('Failed to recover from backup:', error);
    }
    return false;
  };

  return {
    batches,
    setBatches: updateBatches,
    clearAllBatches,
    recoverFromBackup
  };
};
