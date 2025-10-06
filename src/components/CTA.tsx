
import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-20 sm:py-32 relative overflow-hidden glint-surface" style={{ background: 'linear-gradient(135deg, #0a0f1c 0%, #1a1b3a 100%)', '--glint-delay': 9 } as React.CSSProperties}>
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 blur-3xl power-aura"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="glass-effect rounded-3xl p-8 md:p-16 lg:p-20 text-center max-w-5xl mx-auto glint-surface street-art-texture" style={{'--glint-delay': 10} as React.CSSProperties}>
          <div className="flex justify-center mb-8">
            <div className="flex space-x-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-7 h-7 sm:w-8 sm:h-8 fill-yellow-400 text-yellow-400 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          </div>
          
          <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-8 text-gray-100 tracking-tight leading-tight">
            Ready to Transform Your AI&nbsp;Workflow?
          </h2>
          
          <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            Join thousands of developers and businesses who are already automating their AI processes with&nbsp;AutoPromptr.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-psychedelic text-primary-foreground text-xl sm:text-2xl px-12 py-8 future-button dopamine-trigger magnetic-hover rounded-3xl border-0"
            >
              <span className="text-2xl">⭐︎</span>
              Get&nbsp;Started
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white/40 text-white hover:bg-white/10 text-xl sm:text-2xl px-12 py-8 dopamine-trigger magnetic-hover rounded-3xl backdrop-blur-md"
            >
              Sign&nbsp;In
              <ArrowRight className="w-6 h-6 ml-2" />
            </Button>
          </div>
          
          <p className="text-base sm:text-lg text-gray-400 mt-8 font-light">
            No credit card required • 14-day free trial • Cancel&nbsp;anytime
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;
