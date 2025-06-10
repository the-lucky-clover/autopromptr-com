
import { Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AuthBrandingHeader = () => {
  return (
    <Link to="/" className="flex items-center justify-center space-x-2 mb-4 group">
      <Zap 
        className="w-8 h-8" 
        strokeWidth={1.5}
        style={{
          stroke: 'url(#authGradient)',
          filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.3))'
        }}
      />
      <span 
        className="text-2xl font-bold"
        style={{
          background: 'linear-gradient(90deg, #3B82F6, #8B5CF6, #EC4899, #8B5CF6, #3B82F6)',
          backgroundSize: '300% 300%',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          animation: 'heroGradientFlow 6s ease-in-out infinite',
          filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.3))'
        }}
      >
        AutoPromptr
      </span>
      
      {/* SVG gradient definition */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="authGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6">
              <animate attributeName="stop-color" 
                values="#3B82F6;#8B5CF6;#EC4899;#8B5CF6;#3B82F6" 
                dur="6s" 
                repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor="#8B5CF6">
              <animate attributeName="stop-color" 
                values="#8B5CF6;#EC4899;#8B5CF6;#3B82F6;#8B5CF6" 
                dur="6s" 
                repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#EC4899">
              <animate attributeName="stop-color" 
                values="#EC4899;#8B5CF6;#3B82F6;#8B5CF6;#EC4899" 
                dur="6s" 
                repeatCount="indefinite" />
            </stop>
          </linearGradient>
        </defs>
      </svg>
    </Link>
  );
};
