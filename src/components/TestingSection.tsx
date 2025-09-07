import React from 'react';
import { Button } from '@/components/ui/button';
import { Server, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFlaskBackend } from '@/hooks/useFlaskBackend';
import { useToast } from '@/hooks/use-toast';

export function TestingSection() {
  const navigate = useNavigate();
  const { testConnection, testGemini, loading } = useFlaskBackend();
  const { toast } = useToast();

  const handleCombinedTest = async () => {
    try {
      // Test backend connection first
      await testConnection();
      
      // If backend is healthy, test AI automation
      await testGemini("Test prompt for AI automation validation");
      
      toast({
        title: "All Systems Operational",
        description: "Backend and AI automation are working correctly"
      });
      
      // Navigate to backend test page for full results
      navigate('/backend-test');
    } catch (error) {
      console.error('Combined test failed:', error);
      // Error handling is done by the hooks
    }
  };

  return (
    <section className="py-20 bg-gradient-to-r from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-6 text-foreground">
            Test the System
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Verify that both backend services and AI automation are running smoothly
          </p>
          
          <Button
            onClick={handleCombinedTest}
            disabled={loading}
            size="lg"
            className="text-lg px-8 py-4 font-semibold transition-all duration-200 flex items-center justify-center gap-3 mx-auto skeuomorphic-button hover-elevate"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div>
                Testing Systems...
              </>
            ) : (
              <>
                <Server className="h-5 w-5" />
                <Zap className="h-5 w-5" />
                Test Backend & AI Automation
              </>
            )}
          </Button>
          
          <p className="text-sm text-muted-foreground mt-4">
            Click to run comprehensive system validation tests
          </p>
        </div>
      </div>
    </section>
  );
}