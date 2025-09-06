import { useEffect, useState } from "react";

interface SpeedometerProps {
  value: number;
  maxValue: number;
  label: string;
  unit?: string;
  color?: string;
  size?: number;
}

const AnimatedSpeedometer = ({ 
  value, 
  maxValue, 
  label, 
  unit = "%", 
  color = "hsl(var(--primary))",
  size = 120 
}: SpeedometerProps) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    const element = document.getElementById(`speedometer-${label}`);
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [label]);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        let current = 0;
        const increment = value / 50;
        const interval = setInterval(() => {
          current += increment;
          if (current >= value) {
            current = value;
            clearInterval(interval);
          }
          setAnimatedValue(Math.round(current));
        }, 40);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [isVisible, value]);

  const percentage = (animatedValue / maxValue) * 100;
  const strokeDasharray = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = strokeDasharray - (strokeDasharray * percentage) / 100;

  return (
    <div 
      id={`speedometer-${label}`}
      className="flex flex-col items-center space-y-3 animate-fade-in"
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
          viewBox="0 0 100 100"
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="8"
            opacity="0.2"
          />
          
          {/* Animated progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            style={{
              strokeDasharray,
              strokeDashoffset,
              transition: "stroke-dashoffset 2s cubic-bezier(0.16, 1, 0.3, 1)",
              filter: "drop-shadow(0 0 8px hsl(var(--primary) / 0.3))"
            }}
          />
        </svg>
        
        {/* Center value display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground tabular-nums">
            {animatedValue}{unit}
          </span>
        </div>
      </div>
      
      {/* Label */}
      <div className="text-center">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      </div>
    </div>
  );
};

export default AnimatedSpeedometer;