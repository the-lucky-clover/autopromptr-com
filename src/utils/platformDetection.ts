
export interface PlatformMapping {
  id: string;
  name: string;
  domains: string[];
  urlPatterns: RegExp[];
}

// Platform mappings based on common URLs
export const PLATFORM_MAPPINGS: PlatformMapping[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    domains: ['chat.openai.com', 'chatgpt.com'],
    urlPatterns: [/^https?:\/\/(chat\.)?openai\.com/i, /^https?:\/\/chatgpt\.com/i]
  },
  {
    id: 'claude',
    name: 'Claude',
    domains: ['claude.ai'],
    urlPatterns: [/^https?:\/\/claude\.ai/i]
  },
  {
    id: 'gemini',
    name: 'Gemini',
    domains: ['gemini.google.com', 'bard.google.com'],
    urlPatterns: [/^https?:\/\/gemini\.google\.com/i, /^https?:\/\/bard\.google\.com/i]
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    domains: ['perplexity.ai'],
    urlPatterns: [/^https?:\/\/perplexity\.ai/i]
  },
  {
    id: 'lovable',
    name: 'Lovable',
    domains: ['lovable.dev', 'lovable.app'],
    urlPatterns: [/^https?:\/\/.*\.lovable\.(dev|app)/i, /^https?:\/\/lovable\.(dev|app)/i]
  },
  {
    id: 'generic-web',
    name: 'Generic Web Platform',
    domains: [],
    urlPatterns: [/^https?:\/\//i] // Fallback for any HTTP/HTTPS URL
  }
];

export function detectPlatformFromUrl(url: string): string {
  if (!url) return '';

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    // First, try exact domain matching
    for (const platform of PLATFORM_MAPPINGS) {
      if (platform.domains.some(domain => hostname === domain || hostname.endsWith('.' + domain))) {
        return platform.id;
      }
    }

    // Then try pattern matching
    for (const platform of PLATFORM_MAPPINGS) {
      if (platform.urlPatterns.some(pattern => pattern.test(url))) {
        return platform.id;
      }
    }

    // Default to generic web platform
    return 'generic-web';
  } catch (error) {
    console.warn('Failed to parse URL for platform detection:', url, error);
    return 'generic-web';
  }
}

export function getPlatformName(platformId: string): string {
  const platform = PLATFORM_MAPPINGS.find(p => p.id === platformId);
  return platform ? platform.name : 'Unknown Platform';
}