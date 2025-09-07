import React from 'react';
import { Button } from '@/components/ui/button';
import { Server } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function BackendTestButton() {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate('/backend-test')}
      variant="outline"
      size="sm"
      className="fixed bottom-20 right-4 z-50 bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary/10 transition-all duration-200"
    >
      <Server className="h-4 w-4 mr-2" />
      Test Backend
    </Button>
  );
}