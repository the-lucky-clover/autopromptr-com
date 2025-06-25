
export class SecurityHeaders {
  // Add security headers to prevent common attacks
  static addSecurityHeaders(): void {
    // Content Security Policy
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://raahpoyciwuyhwlcenpy.supabase.co https://api.openai.com https://autopromptr-backend.onrender.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');

    // Create meta tag for CSP
    const cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';
    cspMeta.content = csp;
    document.head.appendChild(cspMeta);

    // X-Frame-Options
    const frameMeta = document.createElement('meta');
    frameMeta.httpEquiv = 'X-Frame-Options';
    frameMeta.content = 'DENY';
    document.head.appendChild(frameMeta);

    // X-Content-Type-Options
    const contentTypeMeta = document.createElement('meta');
    contentTypeMeta.httpEquiv = 'X-Content-Type-Options';
    contentTypeMeta.content = 'nosniff';
    document.head.appendChild(contentTypeMeta);

    // Referrer Policy
    const referrerMeta = document.createElement('meta');
    referrerMeta.name = 'referrer';
    referrerMeta.content = 'strict-origin-when-cross-origin';
    document.head.appendChild(referrerMeta);

    console.log('Security headers applied');
  }

  // Initialize security headers on app start
  static init(): void {
    if (typeof document !== 'undefined') {
      this.addSecurityHeaders();
    }
  }
}
