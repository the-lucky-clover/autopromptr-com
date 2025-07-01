
import PromptIcon from './PromptIcon';

interface BrandLogoProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'horizontal' | 'icon-only';
  className?: string;
  id?: string; // Allow unique identification
}

const BrandLogo = ({ size = 'medium', variant = 'horizontal', className = '', id }: BrandLogoProps) => {
  const sizeClasses = {
    small: { text: 'text-2xl' },
    medium: { text: 'text-4xl' },
    large: { text: 'text-6xl' }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex items-center group ${className}`}>
      <div className="flex items-center space-x-2 relative">
        <PromptIcon size={size} id={id} />
        
        {variant === 'horizontal' && (
          <span 
            className={`${currentSize.text} font-bold transition-all duration-300 group-hover:scale-105 text-white brand-logo-text`}
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

export default BrandLogo;
