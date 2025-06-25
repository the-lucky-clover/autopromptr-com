
import { SecurityMonitor } from './securityMonitor';

export class SecurityHeaders {
  private static isInitialized = false;

  // Add comprehensive security headers to prevent common attacks
  static addSecurityHeaders(): void {
    if (this.isInitialized) {
      console.warn('Security headers already initialized');
      return;
    }

    try {
      // Enhanced Content Security Policy
      const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://lovable.dev https://cdn.gpteng.co",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com data:",
        "img-src 'self' data: https: blob:",
        "media-src 'self' data: blob:",
        "connect-src 'self' https://raahpoyciwuyhwlcenpy.supabase.co https://api.openai.com https://autopromptr-backend.onrender.com wss: https:",
        "frame-src 'self' https://dashboard.render.com",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "object-src 'none'",
        "upgrade-insecure-requests"
      ].join('; ');

      // Create and append security meta tags
      this.createMetaTag('Content-Security-Policy', csp);
      this.createMetaTag('X-Frame-Options', 'DENY');
      this.createMetaTag('X-Content-Type-Options', 'nosniff');
      this.createMetaTag('X-XSS-Protection', '1; mode=block');
      this.createMetaTag('Referrer-Policy', 'strict-origin-when-cross-origin');
      this.createMetaTag('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');
      
      // Additional security headers for modern browsers
      this.createMetaTag('Cross-Origin-Embedder-Policy', 'require-corp');
      this.createMetaTag('Cross-Origin-Opener-Policy', 'same-origin');
      this.createMetaTag('Cross-Origin-Resource-Policy', 'same-origin');

      this.isInitialized = true;
      
      SecurityMonitor.logSecurityEvent(
        'api_key_access',
        'low',
        'Security headers initialized successfully',
        { headerCount: 8 }
      );
      
      console.log('✅ Enhanced security headers applied successfully');
    } catch (error) {
      SecurityMonitor.logSecurityEvent(
        'api_key_access',
        'high',
        'Failed to initialize security headers',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
      console.error('Failed to apply security headers:', error);
    }
  }

  private static createMetaTag(httpEquiv: string, content: string): void {
    // Check if meta tag already exists
    const existing = document.querySelector(`meta[http-equiv="${httpEquiv}"]`);
    if (existing) {
      existing.setAttribute('content', content);
      return;
    }

    const meta = document.createElement('meta');
    meta.httpEquiv = httpEquiv;
    meta.content = content;
    document.head.appendChild(meta);
  }

  // Validate current security headers
  static validateSecurityHeaders(): { valid: boolean; missing: string[]; issues: string[] } {
    const requiredHeaders = [
      'Content-Security-Policy',
      'X-Frame-Options',
      'X-Content-Type-Options',
      'Referrer-Policy'
    ];

    const missing: string[] = [];
    const issues: string[] = [];

    requiredHeaders.forEach(header => {
      const meta = document.querySelector(`meta[http-equiv="${header}"]`);
      if (!meta) {
        missing.push(header);
      } else {
        const content = meta.getAttribute('content');
        if (!content || content.trim().length === 0) {
          issues.push(`${header} is empty`);
        }
      }
    });

    // Check for HTTPS
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      issues.push('Application not served over HTTPS');
    }

    const valid = missing.length === 0 && issues.length === 0;

    if (!valid) {
      SecurityMonitor.logSecurityEvent(
        'api_key_access',
        'medium',
        'Security header validation failed',
        { missing, issues }
      );
    }

    return { valid, missing, issues };
  }

  // Monitor for CSP violations
  static initCSPReporting(): void {
    document.addEventListener('securitypolicyviolation', (event) => {
      SecurityMonitor.logSecurityEvent(
        'suspicious_activity',
        'high',
        'Content Security Policy violation detected',
        {
          violatedDirective: event.violatedDirective,
          blockedURI: event.blockedURI,
          documentURI: event.documentURI,
          originalPolicy: event.originalPolicy,
          sample: event.sample
        }
      );
    });
  }

  // Initialize all security features
  static init(): void {
    if (typeof document !== 'undefined') {
      this.addSecurityHeaders();
      this.initCSPReporting();
      
      // Validate after a short delay to ensure all headers are applied
      setTimeout(() => {
        const validation = this.validateSecurityHeaders();
        if (!validation.valid) {
          console.warn('Security header validation issues:', validation);
        }
      }, 1000);
    }
  }

  // Get security status report
  static getSecurityStatus(): {
    headersInitialized: boolean;
    validation: ReturnType<typeof SecurityHeaders.validateSecurityHeaders>;
    isHttps: boolean;
    hasServiceWorker: boolean;
  } {
    return {
      headersInitialized: this.isInitialized,
      validation: this.validateSecurityHeaders(),
      isHttps: location.protocol === 'https:',
      hasServiceWorker: 'serviceWorker' in navigator
    };
  }
}
