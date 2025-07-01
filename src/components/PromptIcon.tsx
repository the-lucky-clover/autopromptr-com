
import React from 'react';

interface PromptIconProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const PromptIcon = ({ size = 'medium', className = '' }: PromptIconProps) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-10 h-10',
    large: 'w-16 h-16'
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`${currentSize} ${className} relative group`}>
      <div 
        className="w-full h-full rounded-lg transition-all duration-500 group-hover:scale-110 prompt-icon"
        style={{
          background: 'linear-gradient(135deg, #3B82F6, #8B5CF6, #EC4899, #8B5CF6, #3B82F6)',
          backgroundSize: '300% 300%',
          animation: 'promptGradientFlow 6s ease-in-out infinite',
          mask: 'url(#promptMask)',
          WebkitMask: 'url(#promptMask)',
          filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6)) drop-shadow(0 0 16px rgba(139, 92, 246, 0.4))'
        }}
      />
      
      {/* Multiple glow layers for luminescence */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div 
          className="w-full h-full rounded-lg animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
            transform: 'scale(1.5)',
            pointerEvents: 'none'
          }}
        />
      </div>

      {/* SVG mask definition */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <mask id="promptMask">
            <rect width="100%" height="100%" fill="white" />
            <g fill="black" fontSize="0.6em" fontFamily="monospace" fontWeight="bold">
              <text x="50%" y="35%" textAnchor="middle" dominantBaseline="middle">&gt;</text>
              <text x="50%" y="75%" textAnchor="middle" dominantBaseline="middle">_</text>
            </g>
          </mask>
        </defs>
      </svg>

      {/* CSS animations */}
      <style>
        {`
          @keyframes promptGradientFlow {
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

          .prompt-icon:hover {
            animation-duration: 2s;
            filter: drop-shadow(0 0 16px rgba(59, 130, 246, 0.8)) drop-shadow(0 0 32px rgba(139, 92, 246, 0.6)) drop-shadow(0 0 48px rgba(236, 72, 153, 0.4));
          }
        `}
      </style>
    </div>
  );
};

export default PromptIcon;
