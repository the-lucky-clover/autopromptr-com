
import { Robot } from 'lucide-react';

interface EnhancedBrandLogoProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'horizontal' | 'icon-only';
  className?: string;
  id?: string;
  showHoverAnimation?: boolean;
}

const EnhancedBrandLogo = ({ 
  size = 'medium', 
  variant = 'horizontal', 
  className = '', 
  id,
  showHoverAnimation = true 
}: EnhancedBrandLogoProps) => {
  const sizeClasses = {
    small: { 
      text: 'text-2xl', 
      icon: 'w-6 h-6',
      spacing: 'space-x-2'
    },
    medium: { 
      text: 'text-4xl', 
      icon: 'w-8 h-8',
      spacing: 'space-x-3'
    },
    large: { 
      text: 'text-6xl', 
      icon: 'w-12 h-12',
      spacing: 'space-x-4'
    }
  };

  const currentSize = sizeClasses[size];
  const uniqueId = id ? `robot-${id}` : `robot-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`flex items-center ${showHoverAnimation ? 'group' : ''} ${className}`}>
      <div className={`flex items-center ${currentSize.spacing} relative`}>
        <Robot 
          className={`${currentSize.icon} transition-all duration-300 ${showHoverAnimation ? 'group-hover:scale-105' : ''}`}
          style={{
            stroke: `url(#${uniqueId})`,
            filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.4))'
          }}
          strokeWidth={1.5}
        />
        
        {variant === 'horizontal' && (
          <span 
            className={`${currentSize.text} font-bold transition-all duration-300 ${showHoverAnimation ? 'group-hover:scale-105' : ''} text-white brand-logo-text`}
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
      
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id={uniqueId} x1="0%" y1="0%" x2="100%" y2="100%">
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
      
      <style>
        {`
          @supports not (-webkit-background-clip: text) {
            .brand-logo-text {
              background: none !important;
              -webkit-text-fill-color: white !important;
              color: white !important;
            }
          }

          @keyframes heroGradientFlow {
            0%, 100% { 
              background-position: 0% 50%; 
            }
            25% { 
              background-position: 50% 0%; 
            }
            50% { 
              background-position: 100% 50%; 
            }
            75% { 
              background-position: 50% 100%; 
            }
          }
        `}
      </style>
    </div>
  );
};

export default EnhancedBrandLogo;
