
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
      <div className="flex items-center space-x-2 relative">
        {/* Zap icon with enhanced glow and gradient stroke */}
        <div className="relative">
          <Zap 
            className={`${currentSize.icon} transition-all duration-300 group-hover:scale-110`}
            strokeWidth={2.5}
            style={{
              stroke: 'url(#iconGradient)',
              filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6)) drop-shadow(0 0 16px rgba(139, 92, 246, 0.4))'
            }}
          />
          {/* Additional glow effect on hover */}
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
              borderRadius: '50%',
              transform: 'scale(1.5)',
              pointerEvents: 'none'
            }}
          />
        </div>
        
        {/* Brand text with fallback styling and enhanced effects */}
        {variant === 'horizontal' && (
          <span 
            className={`${currentSize.text} font-bold transition-all duration-300 group-hover:scale-105 text-white`}
            style={{
              background: 'linear-gradient(90deg, #3B82F6, #8B5CF6, #EC4899, #8B5CF6, #3B82F6)',
              backgroundSize: '300% 300%',
              animation: 'heroGradientFlow 6s ease-in-out infinite',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.4))'
            }}
          >
            AutoPromptr
          </span>
        )}
      </div>
      
      {/* SVG gradient definition for the icon with animated colors */}
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
      
      {/* CSS fallback for browsers that don't support background-clip: text */}
      <style jsx>{`
        @supports not (-webkit-background-clip: text) {
          span[style*="background-clip"] {
            background: none !important;
            -webkit-text-fill-color: white !important;
            color: white !important;
          }
        }
      `}</style>
    </div>
  );
};

export default BrandLogo;
