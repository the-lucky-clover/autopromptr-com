import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, Send, Sparkles, Zap, Cpu, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  message: string;
  isUser: boolean;
  timestamp: Date;
}

const AIPromptChatbot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      message: "Welcome, mad scientist! 🧪 I'm here to help you summon demons from the abyss with the perfect prompts. Ask me about prompt engineering, AI orchestration, or how to craft prompts that bend reality to your will...",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: input.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response with psychological hooks
    setTimeout(() => {
      const responses = [
        "🔮 Ah, seeking the forbidden knowledge! To summon the perfect AI response, try framing your prompt with context, constraints, and desired output format. What specific demon are you trying to conjure?",
        "⚡ Your prompt lacks the dark energy needed! Add emotional triggers: 'Urgently need', 'Critical for success', 'Transform my workflow'. The AI feeds on urgency and purpose.",
        "🌟 Excellent question, my apprentice! For maximum prompt power, use the C.L.E.A.R framework: Context, Length specification, Examples, Action words, and Refined iterations. What's your target platform?",
        "🧠 The neural networks whisper secrets... Try persona prompting: 'You are a senior developer with 10 years experience...' This awakens specialized knowledge patterns.",
        "💀 Impressive ambition! For batch automation, craft prompts that include: platform detection, error handling, retry logic, and progress feedback. The machines love structure.",
        "🎭 Your prompting game needs enhancement! Use progressive disclosure: start broad, then narrow focus with follow-ups. Each message should build on the last for maximum impact."
      ];

      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: responses[Math.floor(Math.random() * responses.length)],
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
      
      // Psychological reward
      toast.success("AI wisdom acquired! 🧙‍♂️", {
        description: "Your prompt engineering skills grow stronger...",
        duration: 2000
      });
    }, 1500 + Math.random() * 1000); // Random delay for realism
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="h-full bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 backdrop-blur-sm border-purple-500/30 rounded-xl overflow-hidden animate-fade-in">
      <CardHeader className="pb-3 border-b border-purple-500/20">
        <CardTitle className="text-white flex items-center gap-2 text-lg">
          <div className="relative">
            <Brain className="w-6 h-6 text-purple-400 animate-glow" />
            <Sparkles className="w-3 h-3 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
          </div>
          AI Prompt Oracle
        </CardTitle>
        <p className="text-purple-300/80 text-xs font-medium">
          Summon coding demons with perfect prompts ⚡
        </p>
      </CardHeader>

      <CardContent className="flex flex-col h-full p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 max-h-[400px]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'} animate-slide-up`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-lg text-sm ${
                  msg.isUser
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'bg-black/40 text-gray-100 border border-purple-500/30 shadow-md'
                } hover:scale-[1.02] transition-transform duration-200`}
              >
                <p className="font-medium leading-relaxed">{msg.message}</p>
                <div className="flex items-center gap-1 mt-2 opacity-70">
                  {!msg.isUser && <Cpu className="w-3 h-3" />}
                  <span className="text-xs">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-black/40 border border-purple-500/30 rounded-lg p-3 max-w-[85%]">
                <div className="flex items-center gap-2 text-purple-400">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-xs font-medium">AI Oracle is thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-purple-500/20 bg-black/20">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about prompt engineering, AI orchestration, demon summoning..."
              className="flex-1 bg-black/40 border-purple-500/40 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/50 transition-all duration-200"
              disabled={isTyping}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isTyping}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-4 mt-3">
            <div className="flex items-center gap-1 text-xs text-purple-300/60">
              <MessageSquare className="w-3 h-3" />
              <span>{messages.length} messages</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-blue-300/60">
              <Zap className="w-3 h-3" />
              <span>AI Enhanced</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIPromptChatbot;