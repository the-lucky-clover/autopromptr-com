interface SecurityEvent {
  type: 'api_key_access' | 'failed_auth' | 'suspicious_activity' | 'rate_limit' | 'input_validation_failed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export class SecurityMonitor {
  private static events: SecurityEvent[] = [];
  private static readonly MAX_EVENTS = 1000;
  private static rateLimitMap = new Map<string, { count: number; resetTime: number }>();

  // Log security events
  static logSecurityEvent(
    type: SecurityEvent['type'],
    severity: SecurityEvent['severity'],
    message: string,
    metadata?: Record<string, any>
  ): void {
    const event: SecurityEvent = {
      type,
      severity,
      message,
      timestamp: Date.now(),
      metadata: {
        userAgent: navigator.userAgent.substring(0, 100),
        url: window.location.href,
        ...metadata
      }
    };

    this.events.push(event);
    
    // Keep only recent events
    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(-this.MAX_EVENTS);
    }

    // Log to console based on severity
    switch (severity) {
      case 'critical':
        console.error('🚨 CRITICAL SECURITY EVENT:', message, metadata);
        break;
      case 'high':
        console.warn('⚠️ HIGH SECURITY EVENT:', message, metadata);
        break;
      case 'medium':
        console.warn('📊 MEDIUM SECURITY EVENT:', message, metadata);
        break;
      case 'low':
        console.info('ℹ️ LOW SECURITY EVENT:', message, metadata);
        break;
    }

    // In production, you would send critical events to your security service
    if (severity === 'critical') {
      this.handleCriticalEvent(event);
    }
  }

  // Rate limiting implementation
  static checkRateLimit(identifier: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
    const now = Date.now();
    const key = `${identifier}_${Math.floor(now / windowMs)}`;
    
    const current = this.rateLimitMap.get(key) || { count: 0, resetTime: now + windowMs };
    
    if (now > current.resetTime) {
      // Reset window
      current.count = 0;
      current.resetTime = now + windowMs;
    }
    
    current.count++;
    this.rateLimitMap.set(key, current);
    
    const isLimited = current.count > maxRequests;
    
    if (isLimited) {
      this.logSecurityEvent(
        'rate_limit',
        'medium',
        `Rate limit exceeded for ${identifier}`,
        { identifier, count: current.count, maxRequests }
      );
    }
    
    return !isLimited;
  }

  // Validate input against common attack patterns
  static validateInput(input: string, context: string = 'unknown'): { isValid: boolean; threats: string[] } {
    const threats: string[] = [];
    
    // XSS detection patterns
    const xssPatterns = [
      /<script\b/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe\b/i,
      /eval\s*\(/i
    ];
    
    // SQL injection patterns
    const sqlPatterns = [
      /(\bunion\b|\bselect\b|\binsert\b|\bdelete\b|\bdrop\b).*(\bfrom\b|\binto\b|\btable\b)/i,
      /(\bor\b|\band\b)\s+\w+\s*=\s*\w+/i,
      /;\s*(drop|delete|insert|update)\b/i
    ];
    
    // Command injection patterns
    const cmdPatterns = [
      /[;&|`$(){}]/,
      /\b(cat|ls|pwd|whoami|curl|wget)\b/i
    ];

    // Check XSS
    xssPatterns.forEach(pattern => {
      if (pattern.test(input)) {
        threats.push('XSS');
      }
    });

    // Check SQL injection
    sqlPatterns.forEach(pattern => {
      if (pattern.test(input)) {
        threats.push('SQL_INJECTION');
      }
    });

    // Check command injection
    cmdPatterns.forEach(pattern => {
      if (pattern.test(input)) {
        threats.push('COMMAND_INJECTION');
      }
    });

    // Check for excessive length
    if (input.length > 10000) {
      threats.push('EXCESSIVE_LENGTH');
    }

    const isValid = threats.length === 0;
    
    if (!isValid) {
      this.logSecurityEvent(
        'input_validation_failed',
        threats.includes('SQL_INJECTION') || threats.includes('COMMAND_INJECTION') ? 'high' : 'medium',
        `Input validation failed for context: ${context}`,
        { threats, inputLength: input.length, context }
      );
    }

    return { isValid, threats };
  }

  // Handle critical security events
  private static handleCriticalEvent(event: SecurityEvent): void {
    // In a real application, you would:
    // 1. Send to security monitoring service
    // 2. Trigger alerts
    // 3. Potentially lock down the account
    // 4. Log to audit trail
    
    console.error('🚨 CRITICAL SECURITY EVENT DETECTED 🚨', event);
    
    // Store in more persistent storage for investigation
    try {
      const criticalEvents = JSON.parse(sessionStorage.getItem('critical_security_events') || '[]');
      criticalEvents.push(event);
      sessionStorage.setItem('critical_security_events', JSON.stringify(criticalEvents.slice(-50)));
    } catch (error) {
      console.error('Failed to store critical security event:', error);
    }
  }

  // Get security statistics
  static getSecurityStats(): {
    totalEvents: number;
    eventsBySeverity: Record<string, number>;
    recentThreats: string[];
    rateLimitStatus: { activeWindows: number };
  } {
    const eventsBySeverity = this.events.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentThreats = this.events
      .filter(e => e.type === 'input_validation_failed' && Date.now() - e.timestamp < 300000) // Last 5 minutes
      .map(e => e.metadata?.threats || [])
      .flat()
      .filter((threat, index, self) => self.indexOf(threat) === index);

    return {
      totalEvents: this.events.length,
      eventsBySeverity,
      recentThreats,
      rateLimitStatus: {
        activeWindows: this.rateLimitMap.size
      }
    };
  }

  // Clean up old rate limit entries
  static cleanupRateLimits(): void {
    const now = Date.now();
    for (const [key, data] of this.rateLimitMap.entries()) {
      if (now > data.resetTime) {
        this.rateLimitMap.delete(key);
      }
    }
  }
}

// Automatic cleanup every 5 minutes
setInterval(() => {
  SecurityMonitor.cleanupRateLimits();
}, 5 * 60 * 1000);
