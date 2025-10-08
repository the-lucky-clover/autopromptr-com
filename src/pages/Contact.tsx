
import React, { useState } from 'react';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, MessageSquare, Send } from "lucide-react";
import UnifiedDashboardWelcomeModule from "@/components/dashboard/UnifiedDashboardWelcomeModule";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          ...formData,
          captcha: parseInt(captchaAnswer)
        }
      });

      if (error) throw error;

      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you as soon as possible.",
      });

      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      setCaptchaAnswer('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Failed to send message",
        description: "Please try again later or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="min-h-screen relative animate-shimmer"
      style={{ 
        background: 'linear-gradient(135deg, #1f2937 0%, #111827 50%, #0f172a 100%)' 
      }}
    >
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset className="flex-1 relative">
            <UnifiedDashboardWelcomeModule
              title="Contact"
              subtitle="Get in touch with our team for support, feedback, or inquiries."
              clockColor="#3B82F6"
              showPersonalizedGreeting={false}
            />
            
            <div className="px-6 pb-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Send us a message
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name" className="text-gray-300">Name</Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="bg-gray-900 border-gray-600 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email" className="text-gray-300">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="bg-gray-900 border-gray-600 text-white"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="subject" className="text-gray-300">Subject</Label>
                        <Input
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className="bg-gray-900 border-gray-600 text-white"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="message" className="text-gray-300">Message</Label>
                        <Textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={6}
                          className="bg-gray-900 border-gray-600 text-white"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="captcha" className="text-gray-300">
                          Anti-spam check: What is 7 + 3?
                        </Label>
                        <Input
                          id="captcha"
                          type="number"
                          value={captchaAnswer}
                          onChange={(e) => setCaptchaAnswer(e.target.value)}
                          required
                          className="bg-gray-900 border-gray-600 text-white"
                          placeholder="Enter the answer"
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Contact Information
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Other ways to reach us
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Support</h3>
                      <p className="text-gray-400">
                        For technical support and bug reports
                      </p>
                      <p className="text-blue-400">autopromptr@proton.me</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Sales</h3>
                      <p className="text-gray-400">
                        For pricing and business inquiries
                      </p>
                      <p className="text-blue-400">autopromptr@proton.me</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">General</h3>
                      <p className="text-gray-400">
                        For general questions and feedback
                      </p>
                      <p className="text-blue-400">autopromptr@proton.me</p>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-700">
                      <p className="text-sm text-gray-400">
                        We typically respond within 24 hours during business days.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Contact;
