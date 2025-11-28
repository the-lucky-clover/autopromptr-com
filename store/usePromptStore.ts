import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Prompt, Batch, InjectionSettings } from '@/types';

interface PromptStore {
  prompts: Prompt[];
  batches: Batch[];
  currentBatch: Batch | null;
  injectionSettings: InjectionSettings | null;
  
  // Prompt actions
  addPrompt: (prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePrompt: (id: string, updates: Partial<Prompt>) => void;
  deletePrompt: (id: string) => void;
  duplicatePrompt: (id: string) => void;
  
  // Batch actions
  createBatch: (name: string) => void;
  deleteBatch: (id: string) => void;
  setCurrentBatch: (batch: Batch | null) => void;
  addPromptToBatch: (batchId: string, prompt: Prompt) => void;
  removePromptFromBatch: (batchId: string, promptId: string) => void;
  reorderPromptsInBatch: (batchId: string, startIndex: number, endIndex: number) => void;
  
  // Injection actions
  setInjectionSettings: (settings: InjectionSettings) => void;
}

export const usePromptStore = create<PromptStore>()(
  persist(
    (set, get) => ({
      prompts: [],
      batches: [],
      currentBatch: null,
      injectionSettings: null,

      addPrompt: (promptData) => {
        const newPrompt: Prompt = {
          ...promptData,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state) => ({ prompts: [...state.prompts, newPrompt] }));
      },

      updatePrompt: (id, updates) => {
        set((state) => ({
          prompts: state.prompts.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
          ),
        }));
      },

      deletePrompt: (id) => {
        set((state) => ({
          prompts: state.prompts.filter((p) => p.id !== id),
        }));
      },

      duplicatePrompt: (id) => {
        const prompt = get().prompts.find((p) => p.id === id);
        if (prompt) {
          get().addPrompt({
            title: `${prompt.title} (Copy)`,
            content: prompt.content,
            tags: prompt.tags,
          });
        }
      },

      createBatch: (name) => {
        const newBatch: Batch = {
          id: crypto.randomUUID(),
          name,
          prompts: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state) => ({ batches: [...state.batches, newBatch] }));
      },

      deleteBatch: (id) => {
        set((state) => ({
          batches: state.batches.filter((b) => b.id !== id),
          currentBatch: state.currentBatch?.id === id ? null : state.currentBatch,
        }));
      },

      setCurrentBatch: (batch) => {
        set({ currentBatch: batch });
      },

      addPromptToBatch: (batchId, prompt) => {
        set((state) => ({
          batches: state.batches.map((b) =>
            b.id === batchId
              ? { ...b, prompts: [...b.prompts, prompt], updatedAt: Date.now() }
              : b
          ),
        }));
      },

      removePromptFromBatch: (batchId, promptId) => {
        set((state) => ({
          batches: state.batches.map((b) =>
            b.id === batchId
              ? {
                  ...b,
                  prompts: b.prompts.filter((p) => p.id !== promptId),
                  updatedAt: Date.now(),
                }
              : b
          ),
        }));
      },

      reorderPromptsInBatch: (batchId, startIndex, endIndex) => {
        set((state) => ({
          batches: state.batches.map((b) => {
            if (b.id === batchId) {
              const newPrompts = [...b.prompts];
              const [removed] = newPrompts.splice(startIndex, 1);
              newPrompts.splice(endIndex, 0, removed);
              return { ...b, prompts: newPrompts, updatedAt: Date.now() };
            }
            return b;
          }),
        }));
      },

      setInjectionSettings: (settings) => {
        set({ injectionSettings: settings });
      },
    }),
    {
      name: 'autopromptr-storage',
    }
  )
);
