import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, Send, Sparkles, Zap, Cpu, MessageSquare, Code, Search, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { cloudflare } from "@/integrations/cloudflare/client";

interface ChatMessage {
  id: string;
  message: string;
  isUser: boolean;
  timestamp: Date;
  taskType?: string;
}

const AIPromptChatbot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      message: "🚀 Autonomous AI Agent Online! I can research, write code, review & refactor, and orchestrate complex tasks. Choose a task type or just ask me anything - I'm powered by Google Gemini Flash 2.5 for lightning-fast intelligence!",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string>('general');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const taskTypes = [
    { id: 'general', label: 'General', icon: Brain },
    { id: 'research', label: 'Research', icon: Search },
    { id: 'write_code', label: 'Write Code', icon: Code },
    { id: 'code_review', label: 'Review Code', icon: Zap },
    { id: 'refactor', label: 'Refactor', icon: RefreshCw }
  ];

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
      timestamp: new Date(),
      taskType: selectedTask
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput('');
    setIsTyping(true);

    try {
      const { data, error } = await cloudflare.functions.invoke('ai-agent-orchestrator', {
        body: {
          message: currentInput,
          task_type: selectedTask,
          context: messages.slice(-3).map(m => `${m.isUser ? 'User' : 'AI'}: ${m.message}`).join('\n')
        }
      });

      if (error) throw error;

      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: data.response || 'No response received',
        isUser: false,
        timestamp: new Date(),
        taskType: selectedTask
      };

      setMessages(prev => [...prev, aiResponse]);
      
      toast.success("AI Response Generated! 🤖", {
        description: `Task: ${selectedTask} completed successfully`,
        duration: 2000
      });
    } catch (error) {
      console.error('AI Agent error:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: `⚠️ Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}. Please check your Gemini API key configuration.`,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast.error("AI Agent Error", {
        description: "Failed to process request. Check API configuration.",
        duration: 3000
      });
    } finally {
      setIsTyping(false);
    }
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
          Autonomous AI Agent
        </CardTitle>
        <p className="text-purple-300/80 text-xs font-medium">
          Powered by Gemini Flash 2.5 ⚡ Research | Code | Review | Refactor
        </p>
        
        {/* Task Type Selector */}
        <div className="flex flex-wrap gap-1 mt-2">
          {taskTypes.map((task) => {
            const IconComponent = task.icon;
            return (
              <Button
                key={task.id}
                size="sm"
                variant={selectedTask === task.id ? "default" : "ghost"}
                onClick={() => setSelectedTask(task.id)}
                className={`h-6 px-2 text-xs transition-all duration-200 ${
                  selectedTask === task.id
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'text-purple-300 hover:text-white hover:bg-purple-600/50'
                }`}
              >
                <IconComponent className="w-3 h-3 mr-1" />
                {task.label}
              </Button>
            );
          })}
        </div>
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
                <p className="font-medium leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                <div className="flex items-center justify-between mt-2 opacity-70">
                  <div className="flex items-center gap-1">
                    {!msg.isUser && <Cpu className="w-3 h-3" />}
                    <span className="text-xs">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {msg.taskType && msg.taskType !== 'general' && (
                    <span className="text-xs bg-purple-600/30 px-2 py-1 rounded text-purple-200">
                      {msg.taskType}
                    </span>
                  )}
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
                  <span className="text-xs font-medium">Gemini AI processing...</span>
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
              placeholder={`${selectedTask === 'general' ? 'Ask me anything...' : 
                selectedTask === 'research' ? 'What should I research?' :
                selectedTask === 'write_code' ? 'What code should I write?' :
                selectedTask === 'code_review' ? 'Paste code to review...' :
                'Paste code to refactor...'}`}
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
          
          <div className="flex items-center justify-between gap-4 mt-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs text-purple-300/60">
                <MessageSquare className="w-3 h-3" />
                <span>{messages.length} messages</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-green-300/60">
                <Zap className="w-3 h-3" />
                <span>Gemini 2.5</span>
              </div>
            </div>
            <div className="text-xs text-blue-300/60">
              Mode: {taskTypes.find(t => t.id === selectedTask)?.label}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIPromptChatbot;