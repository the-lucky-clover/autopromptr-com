
import { useState, useEffect, useRef } from 'react';
import { Batch } from '@/types/batch';
import { useBatchSync } from './useBatchSync';

const STORAGE_KEY = 'autopromptr_batches';
const BACKUP_STORAGE_KEY = 'autopromptr_batches_backup';

export const usePersistentBatches = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const { subscribeToBatchSync } = useBatchSync();
  const isSavingRef = useRef(false);
  const isLoadingRef = useRef(false);
  const lastSavedDataRef = useRef<string>('');

  // Debounced save function
  const debouncedSave = useRef<NodeJS.Timeout | null>(null);

  // Force reload batches from storage
  const reloadBatches = () => {
    if (isSavingRef.current) return; // Don't reload while saving
    
    try {
      isLoadingRef.current = true;
      console.log('Reloading batches from localStorage...');
      const savedBatches = localStorage.getItem(STORAGE_KEY);
      
      if (savedBatches) {
        const parsedBatches = JSON.parse(savedBatches);
        const batchesWithDates = parsedBatches.map((batch: any) => ({
          ...batch,
          createdAt: new Date(batch.createdAt)
        }));
        
        console.log(`Reloaded ${batchesWithDates.length} batches`);
        setBatches(batchesWithDates);
      }
    } catch (error) {
      console.error('Failed to reload batches:', error);
    } finally {
      isLoadingRef.current = false;
    }
  };

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
        lastSavedDataRef.current = savedBatches;
        
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
          localStorage.setItem(STORAGE_KEY, JSON.stringify(batchesWithDates));
          lastSavedDataRef.current = backupBatches;
          console.log('Restored from backup successfully');
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
          lastSavedDataRef.current = backupBatches;
        }
      } catch (backupError) {
        console.error('Backup recovery also failed:', backupError);
      }
    }
  }, []);

  // Subscribe to sync events from other components
  useEffect(() => {
    const unsubscribe = subscribeToBatchSync(() => {
      console.log('Received sync event, reloading batches...');
      reloadBatches();
    });

    return unsubscribe;
  }, [subscribeToBatchSync]);

  // Save batches to localStorage with debouncing - REMOVED AUTO-SYNC
  useEffect(() => {
    if (batches.length > 0 && !isLoadingRef.current) {
      // Clear previous debounced save
      if (debouncedSave.current) {
        clearTimeout(debouncedSave.current);
      }

      // Debounce the save operation
      debouncedSave.current = setTimeout(() => {
        try {
          isSavingRef.current = true;
          const dataToSave = JSON.stringify(batches);
          
          // Only save if data has actually changed
          if (dataToSave !== lastSavedDataRef.current) {
            console.log(`Saving ${batches.length} batches to localStorage...`);
            localStorage.setItem(STORAGE_KEY, dataToSave);
            localStorage.setItem(BACKUP_STORAGE_KEY, dataToSave);
            lastSavedDataRef.current = dataToSave;
            console.log('Batches saved successfully');
          }
        } catch (error) {
          console.error('Failed to save batches to localStorage:', error);
        } finally {
          isSavingRef.current = false;
        }
      }, 300); // 300ms debounce
    }

    return () => {
      if (debouncedSave.current) {
        clearTimeout(debouncedSave.current);
      }
    };
  }, [batches]);

  const updateBatches = (newBatches: Batch[] | ((prev: Batch[]) => Batch[])) => {
    setBatches(newBatches);
  };

  const clearAllBatches = () => {
    setBatches([]);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(BACKUP_STORAGE_KEY);
    lastSavedDataRef.current = '';
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
        lastSavedDataRef.current = backupBatches;
        return true;
      }
    } catch (error) {
      console.error('Failed to recover from backup:', error);
    }
    return false;
  };

  // Manual sync trigger - only call this for explicit user actions
  const triggerManualSync = () => {
    const { triggerBatchSync } = useBatchSync();
    setTimeout(() => {
      triggerBatchSync();
    }, 100);
  };

  return {
    batches,
    setBatches: updateBatches,
    clearAllBatches,
    recoverFromBackup,
    reloadBatches,
    triggerManualSync
  };
};
