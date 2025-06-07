
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Here you would typically send the email using a Supabase Edge Function
      // For now, we'll simulate the email sending
      console.log("Sending email to thepremiumbrand@gmail.com with data:", formData);
      
      // Simulate API call
      setTimeout(() => {
        toast({
          title: "Message Sent!",
          description: "Thank you for your message. We'll get back to you soon.",
        });
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: ""
        });
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #7c3aed 100%)' }}>
      <Navbar />
      
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Have questions about AutoPromptr? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-1">
              <Card className="glass-effect border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Contact Information</CardTitle>
                  <CardDescription className="text-gray-300">
                    Reach out to us through any of these channels
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-purple-400" />
                    <span className="text-gray-300">thepremiumbrand@gmail.com</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-purple-400" />
                    <span className="text-gray-300">+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-purple-400 mt-1" />
                    <span className="text-gray-300">
                      123 Innovation Drive<br />
                      San Francisco, CA 94105
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="glass-effect border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Send us a Message</CardTitle>
                  <CardDescription className="text-gray-300">
                    Fill out the form below and we'll get back to you within 24 hours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-gray-300">Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                          placeholder="Your full name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-gray-300">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="subject" className="text-gray-300">Subject</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        placeholder="What's this about?"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="message" className="text-gray-300">Message</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={6}
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        placeholder="Tell us more about your inquiry..."
                        required
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 rounded-lg transition-all duration-200 disabled:opacity-50"
                    >
                      {isLoading ? (
                        "Sending..."
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Contact;
