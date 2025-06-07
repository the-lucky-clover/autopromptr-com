
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
      
      // Debug: Check all localStorage keys for any trace of batch data
      console.log('All localStorage keys:', Object.keys(localStorage));
      
      // Look for any keys that might contain batch data
      const potentialBatchKeys = Object.keys(localStorage).filter(key => 
        key.includes('batch') || key.includes('autopromptr') || key.includes('prompt')
      );
      console.log('Potential batch-related keys found:', potentialBatchKeys);
      
      // Check each potential key
      potentialBatchKeys.forEach(key => {
        const value = localStorage.getItem(key);
        console.log(`Content of ${key}:`, value);
      });
      
      const savedBatches = localStorage.getItem(STORAGE_KEY);
      console.log('Raw saved batches:', savedBatches);
      console.log('Storage key being used:', STORAGE_KEY);
      
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
        // Automatically try to recover from backup on page load
        console.log('No batches found in main storage, automatically checking backup...');
        const backupBatches = localStorage.getItem(BACKUP_STORAGE_KEY);
        console.log('Backup batches found:', backupBatches);
        
        if (backupBatches) {
          console.log('Found backup batches, automatically restoring...');
          const parsedBackup = JSON.parse(backupBatches);
          const batchesWithDates = parsedBackup.map((batch: any) => ({
            ...batch,
            createdAt: new Date(batch.createdAt)
          }));
          setBatches(batchesWithDates);
          // Restore to main storage
          localStorage.setItem(STORAGE_KEY, JSON.stringify(batchesWithDates));
          console.log('Automatically restored from backup successfully');
        } else {
          console.log('No backup found either. Starting fresh.');
          
          // Automatically search for any data that looks like batches under any key
          console.log('Automatically searching all localStorage for batch-like data...');
          Object.keys(localStorage).forEach(key => {
            try {
              const value = localStorage.getItem(key);
              if (value) {
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  const firstItem = parsed[0];
                  // Check if it looks like a batch object
                  if (firstItem && typeof firstItem === 'object' && 
                      ('name' in firstItem || 'targetUrl' in firstItem || 'prompts' in firstItem)) {
                    console.log(`POTENTIAL BATCH DATA FOUND under key "${key}":`, parsed);
                  }
                }
              }
            } catch (e) {
              // Not JSON, skip
            }
          });
        }
      }
    } catch (error) {
      console.error('Failed to load batches from localStorage:', error);
      
      // Automatically try to recover from backup on error
      try {
        const backupBatches = localStorage.getItem(BACKUP_STORAGE_KEY);
        if (backupBatches) {
          console.log('Attempting automatic recovery from backup due to error...');
          const parsedBackup = JSON.parse(backupBatches);
          const batchesWithDates = parsedBackup.map((batch: any) => ({
            ...batch,
            createdAt: new Date(batch.createdAt)
          }));
          setBatches(batchesWithDates);
        }
      } catch (backupError) {
        console.error('Automatic backup recovery also failed:', backupError);
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
        console.log('Saved data:', dataToSave);
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

  // Debug function to manually search for lost data
  const searchForLostBatches = () => {
    console.log('=== MANUAL SEARCH FOR LOST BATCHES ===');
    console.log('All localStorage keys:', Object.keys(localStorage));
    
    Object.keys(localStorage).forEach(key => {
      try {
        const value = localStorage.getItem(key);
        if (value) {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.log(`Key "${key}" contains array with ${parsed.length} items:`, parsed);
          }
        }
      } catch (e) {
        // Not JSON, skip
      }
    });
    console.log('=== END SEARCH ===');
  };

  return {
    batches,
    setBatches: updateBatches,
    clearAllBatches,
    recoverFromBackup,
    searchForLostBatches
  };
};
