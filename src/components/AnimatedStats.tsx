
import { useEffect, useState, useRef } from 'react';

interface StatProps {
  endValue: number;
  label: string;
  prefix?: string;
  suffix?: string;
}

const AnimatedStat = ({ endValue, label, prefix = "", suffix = "" }: StatProps) => {
  const [value, setValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    const duration = 2000;
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setValue(Math.floor(easeOutQuart * endValue));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isVisible, endValue]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
        {prefix}{value.toLocaleString()}{suffix}
      </div>
      <div className="text-gray-300 font-medium">{label}</div>
    </div>
  );
};

const AnimatedStats = () => {
  return (
    <section className="py-16 gradient-bg relative">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 animate-on-scroll">
          <h2 className="text-3xl font-bold text-white mb-4">
            Proven Results Across Industries
          </h2>
          <p className="text-xl text-gray-300">
            See how AutoPromptr transforms AI workflows worldwide
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="animate-on-scroll stagger-animation" style={{ "--animation-delay": "0.1s" } as React.CSSProperties}>
            <AnimatedStat endValue={92} label="Accuracy Improvement" suffix="%" />
          </div>
          <div className="animate-on-scroll stagger-animation" style={{ "--animation-delay": "0.2s" } as React.CSSProperties}>
            <AnimatedStat endValue={75} label="Time Savings" suffix="%" />
          </div>
          <div className="animate-on-scroll stagger-animation" style={{ "--animation-delay": "0.3s" } as React.CSSProperties}>
            <AnimatedStat endValue={10000} label="Prompts Processed" suffix="+" />
          </div>
          <div className="animate-on-scroll stagger-animation" style={{ "--animation-delay": "0.4s" } as React.CSSProperties}>
            <AnimatedStat endValue={500} label="Enterprise Clients" suffix="+" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnimatedStats;
