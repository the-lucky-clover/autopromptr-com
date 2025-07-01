
import PsychedelicZapIcon from './PsychedelicZapIcon';

interface ZapBrandLogoProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'horizontal' | 'icon-only';
  className?: string;
  id?: string;
  showHoverAnimation?: boolean;
}

const ZapBrandLogo = ({ 
  size = 'medium', 
  variant = 'horizontal', 
  className = '', 
  id,
  showHoverAnimation = false
}: ZapBrandLogoProps) => {
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

  return (
    <div className={`flex items-center ${showHoverAnimation ? 'group' : ''} ${className}`}>
      <div className={`flex items-center ${currentSize.spacing} relative`}>
        <PsychedelicZapIcon size={size} id={id} />
        
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
      
      <style>
        {`
          @supports not (-webkit-background-clip: text) {
            .brand-logo-text {
              background: none !important;
              -webkit-text-fill-color: white !important;
              color: white !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default ZapBrandLogo;
