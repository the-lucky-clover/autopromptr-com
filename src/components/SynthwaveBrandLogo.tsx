
import { Zap } from 'lucide-react';

interface SynthwaveBrandLogoProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'horizontal' | 'icon-only';
  className?: string;
}

const SynthwaveBrandLogo = ({ size = 'medium', variant = 'horizontal', className = '' }: SynthwaveBrandLogoProps) => {
  const sizeClasses = {
    small: { icon: 'w-6 h-6', text: 'text-xl' },
    medium: { icon: 'w-10 h-10', text: 'text-3xl' },
    large: { icon: 'w-16 h-16', text: 'text-5xl' }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex items-center group relative z-10 ${className}`}>
      <div className="flex items-center space-x-3 relative synthwave-logo">
        {/* Enhanced Zap icon with synthwave effects */}
        <div className="relative synthwave-icon">
          <Zap 
            className={`${currentSize.icon} transition-all duration-500 group-hover:scale-110 synthwave-bolt`}
            strokeWidth={3}
          />
          
          {/* Multiple glow layers for intense neon effect */}
          <div className="absolute inset-0 synthwave-glow-1" />
          <div className="absolute inset-0 synthwave-glow-2" />
          <div className="absolute inset-0 synthwave-glow-3" />
        </div>
        
        {/* Synthwave brand text */}
        {variant === 'horizontal' && (
          <span 
            className={`${currentSize.text} font-bold synthwave-text relative z-10`}
          >
            AutoPromptr
          </span>
        )}
      </div>
      
      {/* CSS Styles for Synthwave Effects */}
      <style>
        {`
          .synthwave-logo {
            animation: synthwaveFloat 4s ease-in-out infinite;
            filter: drop-shadow(0 0 20px rgba(255, 0, 255, 0.5));
          }

          .synthwave-icon {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .synthwave-bolt {
            stroke: url(#synthwaveGradient);
            filter: drop-shadow(0 0 10px #ff00ff) drop-shadow(0 0 20px #00ffff);
            animation: synthwavePulse 2s ease-in-out infinite;
          }

          .synthwave-glow-1 {
            background: radial-gradient(circle, rgba(255, 0, 255, 0.4) 0%, transparent 70%);
            animation: synthwaveGlow1 3s ease-in-out infinite;
            border-radius: 50%;
            transform: scale(1.5);
          }

          .synthwave-glow-2 {
            background: radial-gradient(circle, rgba(0, 255, 255, 0.3) 0%, transparent 70%);
            animation: synthwaveGlow2 2.5s ease-in-out infinite reverse;
            border-radius: 50%;
            transform: scale(2);
          }

          .synthwave-glow-3 {
            background: radial-gradient(circle, rgba(255, 20, 147, 0.2) 0%, transparent 70%);
            animation: synthwaveGlow3 4s ease-in-out infinite;
            border-radius: 50%;
            transform: scale(2.5);
          }

          .synthwave-text {
            font-family: 'Courier New', monospace;
            background: linear-gradient(
              90deg,
              #ff00ff 0%,
              #00ffff 25%,
              #ff0080 50%,
              #8000ff 75%,
              #ff00ff 100%
            );
            background-size: 300% 300%;
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: synthwaveTextFlow 3s ease-in-out infinite;
            text-shadow: 
              0 0 10px rgba(255, 0, 255, 0.8),
              0 0 20px rgba(0, 255, 255, 0.6),
              0 0 30px rgba(255, 0, 128, 0.4);
            letter-spacing: 0.1em;
            font-weight: 900;
            text-transform: uppercase;
          }

          @keyframes synthwaveFloat {
            0%, 100% { 
              transform: translateY(0px) rotateZ(0deg); 
            }
            25% { 
              transform: translateY(-8px) rotateZ(0.5deg); 
            }
            50% { 
              transform: translateY(-12px) rotateZ(0deg); 
            }
            75% { 
              transform: translateY(-8px) rotateZ(-0.5deg); 
            }
          }

          @keyframes synthwavePulse {
            0%, 100% { 
              transform: scale(1); 
              filter: drop-shadow(0 0 10px #ff00ff) drop-shadow(0 0 20px #00ffff);
            }
            50% { 
              transform: scale(1.1); 
              filter: drop-shadow(0 0 20px #ff00ff) drop-shadow(0 0 40px #00ffff) drop-shadow(0 0 60px #ff0080);
            }
          }

          @keyframes synthwaveGlow1 {
            0%, 100% { opacity: 0.4; transform: scale(1.5) rotate(0deg); }
            50% { opacity: 0.8; transform: scale(2) rotate(180deg); }
          }

          @keyframes synthwaveGlow2 {
            0%, 100% { opacity: 0.3; transform: scale(2) rotate(0deg); }
            50% { opacity: 0.6; transform: scale(2.5) rotate(-180deg); }
          }

          @keyframes synthwaveGlow3 {
            0%, 100% { opacity: 0.2; transform: scale(2.5) rotate(0deg); }
            50% { opacity: 0.4; transform: scale(3) rotate(90deg); }
          }

          @keyframes synthwaveTextFlow {
            0%, 100% { 
              background-position: 0% 50%; 
              transform: perspective(500px) rotateX(0deg);
            }
            25% { 
              background-position: 50% 0%; 
              transform: perspective(500px) rotateX(2deg);
            }
            50% { 
              background-position: 100% 50%; 
              transform: perspective(500px) rotateX(0deg);
            }
            75% { 
              background-position: 50% 100%; 
              transform: perspective(500px) rotateX(-2deg);
            }
          }

          /* Hover effects */
          .synthwave-logo:hover .synthwave-bolt {
            animation-duration: 0.5s;
          }

          .synthwave-logo:hover .synthwave-text {
            animation-duration: 1s;
            text-shadow: 
              0 0 20px rgba(255, 0, 255, 1),
              0 0 40px rgba(0, 255, 255, 0.8),
              0 0 60px rgba(255, 0, 128, 0.6);
          }
        `}
      </style>

      {/* SVG gradient definition for the icon */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="synthwaveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff00ff">
              <animate 
                attributeName="stop-color" 
                values="#ff00ff;#00ffff;#ff0080;#8000ff;#ff00ff" 
                dur="3s" 
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="50%" stopColor="#00ffff">
              <animate 
                attributeName="stop-color" 
                values="#00ffff;#ff0080;#8000ff;#ff00ff;#00ffff" 
                dur="3s" 
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="#ff0080">
              <animate 
                attributeName="stop-color" 
                values="#ff0080;#8000ff;#ff00ff;#00ffff;#ff0080" 
                dur="3s" 
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default SynthwaveBrandLogo;
