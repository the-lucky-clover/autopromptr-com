import React from 'react';
import MistralAIProcessor from '@/components/MistralAIProcessor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Shield, Zap, Globe } from 'lucide-react';

const MistralAI = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Mistral AI Integration
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Harness the power of Mistral AI for advanced text processing, web research, content analysis, and intelligent automation
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="text-center">
              <Brain className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <CardTitle className="text-white">Text Inference</CardTitle>
              <CardDescription className="text-gray-300">
                Advanced text analysis and understanding
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="text-center">
              <Globe className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <CardTitle className="text-white">Web Search</CardTitle>
              <CardDescription className="text-gray-300">
                Intelligent web research and analysis
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="text-center">
              <Zap className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <CardTitle className="text-white">Web Scraping</CardTitle>
              <CardDescription className="text-gray-300">
                Extract and analyze web content
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="text-center">
              <Shield className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <CardTitle className="text-white">Secure Processing</CardTitle>
              <CardDescription className="text-gray-300">
                Enterprise-grade security and privacy
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Main Processor */}
        <MistralAIProcessor />

        {/* Information Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Available Models</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300">
              <ul className="space-y-2">
                <li><strong>Mistral Large:</strong> Most capable model for complex tasks</li>
                <li><strong>Mistral Medium:</strong> Balanced performance and efficiency</li>
                <li><strong>Mistral Small:</strong> Fast processing for simpler tasks</li>
                <li><strong>Mistral Tiny:</strong> Ultra-fast for basic operations</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Security Features</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300">
              <ul className="space-y-2">
                <li>• API keys stored securely in Supabase</li>
                <li>• Edge function processing for isolation</li>
                <li>• CORS protection and rate limiting</li>
                <li>• No client-side API key exposure</li>
                <li>• Audit logging for all requests</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MistralAI;