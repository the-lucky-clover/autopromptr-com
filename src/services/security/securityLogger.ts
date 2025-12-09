
import { cloudflare } from '@/integrations/cloudflare/client';

export interface SecurityEvent {
  eventType: string;
  eventData?: any;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export class SecurityLogger {
  private static instance: SecurityLogger;
  
  public static getInstance(): SecurityLogger {
    if (!SecurityLogger.instance) {
      SecurityLogger.instance = new SecurityLogger();
    }
    return SecurityLogger.instance;
  }

  async logEvent(event: SecurityEvent): Promise<void> {
    try {
      const { error } = await cloudflare.from('security_events').insert({
        user_id: event.userId || null,
        event_type: event.eventType,
        event_data: event.eventData || null,
        ip_address: event.ipAddress || null,
        user_agent: event.userAgent || navigator.userAgent
      });

      if (error) {
        console.error('Failed to log security event:', error);
      }
    } catch (error) {
      console.error('Security logging error:', error);
    }
  }

  async logAuthAttempt(email: string, success: boolean, errorMessage?: string): Promise<void> {
    await this.logEvent({
      eventType: success ? 'auth_success' : 'auth_failure',
      eventData: {
        email,
        error: errorMessage,
        timestamp: new Date().toISOString()
      }
    });
  }

  async logUnauthorizedAccess(userId?: string, resource?: string): Promise<void> {
    await this.logEvent({
      eventType: 'unauthorized_access',
      eventData: {
        resource,
        timestamp: new Date().toISOString()
      },
      userId
    });
  }

  async logSuspiciousActivity(userId: string, activity: string, metadata?: any): Promise<void> {
    await this.logEvent({
      eventType: 'suspicious_activity',
      eventData: {
        activity,
        metadata,
        timestamp: new Date().toISOString()
      },
      userId
    });
  }

  async logRateLimitExceeded(identifier: string, endpoint: string): Promise<void> {
    await this.logEvent({
      eventType: 'rate_limit_exceeded',
      eventData: {
        identifier,
        endpoint,
        timestamp: new Date().toISOString()
      }
    });
  }
}

export const securityLogger = SecurityLogger.getInstance();
