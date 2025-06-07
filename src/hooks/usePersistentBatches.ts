
import { useState, useEffect } from 'react';
import { Batch } from '@/types/batch';

const STORAGE_KEY = 'autopromptr_batches';

export const usePersistentBatches = () => {
  const [batches, setBatches] = useState<Batch[]>([]);

  // Load batches from localStorage on mount
  useEffect(() => {
    try {
      const savedBatches = localStorage.getItem(STORAGE_KEY);
      if (savedBatches) {
        const parsedBatches = JSON.parse(savedBatches);
        // Convert date strings back to Date objects
        const batchesWithDates = parsedBatches.map((batch: any) => ({
          ...batch,
          createdAt: new Date(batch.createdAt)
        }));
        setBatches(batchesWithDates);
      }
    } catch (error) {
      console.error('Failed to load batches from localStorage:', error);
    }
  }, []);

  // Save batches to localStorage whenever batches change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(batches));
    } catch (error) {
      console.error('Failed to save batches to localStorage:', error);
    }
  }, [batches]);

  const updateBatches = (newBatches: Batch[] | ((prev: Batch[]) => Batch[])) => {
    setBatches(newBatches);
  };

  const clearAllBatches = () => {
    setBatches([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    batches,
    setBatches: updateBatches,
    clearAllBatches
  };
};
