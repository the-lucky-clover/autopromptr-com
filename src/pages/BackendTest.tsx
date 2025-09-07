import React from 'react';
import { FlaskBackendDashboard } from '@/components/FlaskBackendDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Server, TestTube } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BackendTest() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <div className="h-6 border-l border-border" />
            <div className="flex items-center space-x-2">
              <Server className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">Backend Testing</h1>
            </div>
          </div>
          <TestTube className="h-8 w-8 text-muted-foreground" />
        </div>

        {/* Instructions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TestTube className="h-5 w-5" />
              <span>Mobile Backend Testing</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <p className="text-muted-foreground">
                Since you're on mobile, use this web interface to test your Flask backend instead of terminal commands:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">What this tests:</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Backend health check</li>
                    <li>Gemini AI integration</li>
                    <li>Batch job creation</li>
                    <li>Job execution & monitoring</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Requirements:</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Flask backend running on localhost:5000</li>
                    <li>GEMINI_API_KEY environment variable set</li>
                    <li>Python dependencies installed</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flask Backend Dashboard */}
        <FlaskBackendDashboard />
      </div>
    </div>
  );
}