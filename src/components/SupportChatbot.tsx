import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Bot, User, LogOut, FileText, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLegalModals } from './LegalModals';
import { useNavigate } from 'react-router-dom';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const SupportChatbot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hi! I\'m your AutoPromptr Support Assistant. I can help you with:\n\n• FAQs about AutoPromptr features\n• Troubleshooting issues\n• Creating support tickets\n• Showing Terms of Service or Privacy Policy\n• Logging you out\n\nHow can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { openPrivacyPolicy, openTermsOfService, LegalModals } = useLegalModals();
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('support-chatbot', {
        body: { 
          messages: [...messages, userMessage].map(m => ({ 
            role: m.role, 
            content: m.content 
          }))
        },
        headers: session?.access_token ? {
          Authorization: `Bearer ${session.access_token}`
        } : undefined
      });

      if (response.error) {
        throw response.error;
      }

      const data = response.data;

      // Handle special actions
      if (data.action) {
        switch (data.action) {
          case 'logout':
            await handleLogout();
            break;
          case 'show_terms':
            openTermsOfService();
            break;
          case 'show_privacy':
            openPrivacyPolicy();
            break;
          case 'ticket_created':
            toast.success('Support ticket created! We\'ll contact you soon.');
            break;
        }
      }

      // Add assistant response
      if (data.content || data.message) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.content || data.message,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      }

    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to send message. Please try again.');
      
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again or contact support@autopromptr.com directly.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { label: 'FAQ', icon: Bot, action: () => setInputMessage('Show me frequently asked questions') },
    { label: 'Create Ticket', icon: FileText, action: () => setInputMessage('I need to create a support ticket') },
    { label: 'Privacy Policy', icon: Shield, action: () => setInputMessage('Show me the privacy policy') },
    { label: 'Log Out', icon: LogOut, action: () => setInputMessage('I want to log out') },
  ];

  return (
    <>
      <Card className="h-full flex flex-col bg-gradient-to-br from-slate-900/95 via-purple-900/95 to-blue-900/95 border-purple-500/30 backdrop-blur-sm">
        <CardHeader className="border-b border-purple-500/30 pb-4">
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Bot className="w-6 h-6 text-purple-400" />
            Support Assistant
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-4 space-y-4 overflow-hidden">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={action.action}
                className="text-xs bg-white/5 border-purple-500/30 hover:bg-purple-500/20 text-white"
              >
                <action.icon className="w-3 h-3 mr-1" />
                {action.label}
              </Button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-transparent">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-purple-400" />
                  </div>
                )}
                
                <div
                  className={`max-w-[75%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-purple-600/30 text-white'
                      : 'bg-white/10 text-gray-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  <span className="text-xs opacity-60 mt-1 block">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>

                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-400" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-purple-400 animate-pulse" />
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2 pt-2 border-t border-purple-500/30">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about AutoPromptr..."
              disabled={isLoading}
              className="flex-1 bg-white/5 border-purple-500/30 text-white placeholder:text-gray-400 focus:border-purple-500/50"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <LegalModals />
    </>
  );
};
