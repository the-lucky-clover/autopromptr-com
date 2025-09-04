// Magic Link Authentication Service
export class MagicLinkService {
  private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787';

  async sendMagicLink(email: string, redirectUrl?: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/magic-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, redirectUrl })
      });
      
      return await response.json();
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to send magic link'
      };
    }
  }

  async verifyMagicLink(token: string): Promise<{ success: boolean; user?: any; sessionToken?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/verify-magic-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      
      return await response.json();
    } catch (error) {
      return { 
        success: false
      };
    }
  }
}

export const magicLinkService = new MagicLinkService();