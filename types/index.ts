export interface Prompt {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
}

export interface Batch {
  id: string;
  name: string;
  prompts: Prompt[];
  createdAt: number;
  updatedAt: number;
}

export interface InjectionTarget {
  type: 'local' | 'remote' | 'clipboard';
  name: string;
  selector?: string; // CSS selector for local targets
  url?: string; // URL for remote targets
  method?: 'paste' | 'type' | 'api'; // How to inject
  delayMs?: number; // Delay between prompts
}

export interface InjectionSettings {
  target: InjectionTarget;
  autoExecute: boolean;
  delayBetweenPrompts: number;
  confirmBefore: boolean;
}
