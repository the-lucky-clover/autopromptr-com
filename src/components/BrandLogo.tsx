
import { Zap } from 'lucide-react';

interface BrandLogoProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'horizontal' | 'icon-only';
  className?: string;
}

const BrandLogo = ({ size = 'medium', variant = 'horizontal', className = '' }: BrandLogoProps) => {
  const sizeClasses = {
    small: { icon: 'w-5 h-5', text: 'text-lg' },
    medium: { icon: 'w-8 h-8', text: 'text-2xl' },
    large: { icon: 'w-12 h-12', text: 'text-4xl' }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex items-center group ${className}`}>
      {/* Container with unified gradient background */}
      <div 
        className="flex items-center space-x-2 relative"
        style={{
          background: 'linear-gradient(90deg, #3B82F6, #8B5CF6, #EC4899, #8B5CF6, #3B82F6)',
          backgroundSize: '300% 300%',
          animation: 'heroGradientFlow 6s ease-in-out infinite',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.3))'
        }}
      >
        {/* Zap icon with increased stroke and gradient */}
        <Zap 
          className={`${currentSize.icon}`}
          strokeWidth={2.5}
          style={{
            stroke: 'url(#iconGradient)',
            filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.3))'
          }}
        />
        
        {/* Brand text */}
        {variant === 'horizontal' && (
          <span className={`${currentSize.text} font-bold`}>
            AutoPromptr
          </span>
        )}
      </div>
      
      {/* SVG gradient definition for the icon */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6">
              <animate 
                attributeName="stop-color" 
                values="#3B82F6;#8B5CF6;#EC4899;#8B5CF6;#3B82F6" 
                dur="6s" 
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="50%" stopColor="#8B5CF6">
              <animate 
                attributeName="stop-color" 
                values="#8B5CF6;#EC4899;#8B5CF6;#3B82F6;#8B5CF6" 
                dur="6s" 
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="#EC4899">
              <animate 
                attributeName="stop-color" 
                values="#EC4899;#8B5CF6;#3B82F6;#8B5CF6;#EC4899" 
                dur="6s" 
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default BrandLogo;
