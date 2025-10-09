import { RedundantBackendStatus } from '@/components/health/RedundantBackendStatus';
import { RedundantSystemTester } from '@/components/health/RedundantSystemTester';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BackendHealthDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-4xl font-bold mb-2">Backend Health Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor the health and performance of redundant backend services
          </p>
        </div>

        <div className="grid gap-6">
          <RedundantBackendStatus />
          
          <RedundantSystemTester />
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-card/50 backdrop-blur-sm rounded-lg border border-border/50">
              <h3 className="text-lg font-semibold mb-4">Failover Strategy</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Intelligent routing based on platform type</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Automatic failover to healthy backend</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Health checks every 30 seconds</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Circuit breaker pattern for resilience</span>
                </li>
              </ul>
            </div>

            <div className="p-6 bg-card/50 backdrop-blur-sm rounded-lg border border-border/50">
              <h3 className="text-lg font-semibold mb-4">Backend Specialization</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="font-medium text-primary mb-1">Python Backend</div>
                  <div className="text-muted-foreground">
                    Optimized for Lovable, v0, Claude, ChatGPT with smart waiting and Playwright automation
                  </div>
                </div>
                <div>
                  <div className="font-medium text-primary mb-1">Node.js Backend</div>
                  <div className="text-muted-foreground">
                    Universal platform detection with computer vision and WebSocket support
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackendHealthDashboard;
