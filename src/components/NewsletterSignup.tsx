
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Mail } from "lucide-react";

const NewsletterSignup = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Subscribed!",
        description: "Thank you for subscribing to our newsletter.",
      });
      setEmail("");
      setIsLoading(false);
    }, 1000);
  };

  return (
    <section className="py-16 relative" style={{ background: 'linear-gradient(135deg, #0a0f1c 0%, #1a1b3a 100%)' }}>
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-on-scroll">
            <h2 className="text-3xl font-bold text-white mb-4">
              Stay Ahead of the AI Revolution
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Get exclusive insights, tips, and early access to new features delivered to your inbox.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="animate-on-scroll stagger-animation">
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-300 rounded-lg"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
              >
                {isLoading ? (
                  "Subscribing..."
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Subscribe
                  </>
                )}
              </Button>
            </div>
          </form>

          <p className="text-sm text-gray-400 mt-4 animate-on-scroll stagger-animation">
            No spam, unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSignup;
