
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const ReadyToAutomateButton = () => {
  return (
    <Card className="bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-sm border-white/20 rounded-xl overflow-hidden hover-shimmer-card">
      <CardContent className="p-8">
        <Button
          asChild
          size="lg"
          className="w-full h-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white border-none shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 hover:shadow-purple-500/40 rounded-xl group hover-shimmer-button hover-glow"
        >
          <Link to="/dashboard/batch-processor">
            <div className="flex items-center justify-center space-x-6 w-full">
              <div className="relative">
                <Zap className="w-10 h-10 group-hover:animate-pulse" />
                <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-yellow-300 group-hover:animate-spin" />
              </div>
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold tracking-wide">Ready to Automate</div>
                <div className="text-base opacity-90 font-semibold">Start Batch Processing</div>
              </div>
              <ArrowRight className="w-7 h-7 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </Button>
        
        <div className="mt-6 text-center">
          <p className="text-white/70 text-base leading-relaxed">
            Launch your automation workflow and process prompts efficiently
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReadyToAutomateButton;
