interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  identifier: string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export class RateLimitingService {
  private static limits = new Map<string, RateLimitEntry>();

  static isAllowed(config: RateLimitConfig): boolean {
    const now = Date.now();
    const key = `${config.identifier}:${config.maxRequests}:${config.windowMs}`;
    
    let entry = this.limits.get(key);
    
    if (!entry || now > entry.resetTime) {
      // Create new window
      entry = {
        count: 1,
        resetTime: now + config.windowMs
      };
      this.limits.set(key, entry);
      return true;
    }
    
    if (entry.count >= config.maxRequests) {
      return false;
    }
    
    entry.count++;
    return true;
  }

  static getRemainingRequests(config: RateLimitConfig): number {
    const key = `${config.identifier}:${config.maxRequests}:${config.windowMs}`;
    const entry = this.limits.get(key);
    
    if (!entry || Date.now() > entry.resetTime) {
      return config.maxRequests;
    }
    
    return Math.max(0, config.maxRequests - entry.count);
  }

  static getResetTime(config: RateLimitConfig): number {
    const key = `${config.identifier}:${config.maxRequests}:${config.windowMs}`;
    const entry = this.limits.get(key);
    
    return entry?.resetTime || Date.now();
  }

  static cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }
}

// Cleanup expired entries every 5 minutes
setInterval(() => {
  RateLimitingService.cleanup();
}, 5 * 60 * 1000);

// Common rate limit configurations
export const RATE_LIMITS = {
  BATCH_CREATION: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
  },
  BATCH_PROCESSING: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
  },
  AUTH_ATTEMPTS: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  API_CALLS: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  }
} as const;