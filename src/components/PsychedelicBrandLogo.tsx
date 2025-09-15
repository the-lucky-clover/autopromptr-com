import { Zap } from 'lucide-react';

interface PsychedelicBrandLogoProps {
  size?: 'small' | 'medium' | 'large' | 'xl';
  variant?: 'horizontal' | 'icon-only';
  className?: string;
  id?: string;
  animate?: boolean;
}

const PsychedelicBrandLogo = ({ 
  size = 'medium', 
  variant = 'horizontal', 
  className = '',
  id,
  animate = true 
}: PsychedelicBrandLogoProps) => {
  const sizeClasses = {
    small: { 
      icon: 'w-8 h-8',
      text: 'text-2xl',
      container: 'gap-2'
    },
    medium: { 
      icon: 'w-12 h-12',
      text: 'text-4xl',
      container: 'gap-3'
    },
    large: { 
      icon: 'w-16 h-16',
      text: 'text-5xl',
      container: 'gap-4'
    },
    xl: { 
      icon: 'w-20 h-20',
      text: 'text-6xl',
      container: 'gap-5'
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex items-center group ${currentSize.container} ${className}`}>
      {/* Psychedelic Animated Icon */}
      <div 
        className={`
          relative flex items-center justify-center 
          ${currentSize.icon} 
          ${animate ? 'animate-glow-pulse' : ''}
          smooth-transition
        `}
        id={id}
      >
        {/* Glowing Background Ring */}
        <div 
          className={`
            absolute inset-0 rounded-full 
            bg-gradient-psychedelic 
            ${animate ? 'animate-psychedelic-flow' : ''}
            opacity-80 blur-sm
            group-hover:opacity-100 group-hover:blur-md
            smooth-transition
          `}
        />
        
        {/* Main Icon with Glow */}
        <Zap 
          className={`
            relative z-10 
            ${currentSize.icon} 
            text-foreground 
            drop-shadow-lg
            group-hover:scale-110 
            glow-transition
            filter 
          `}
          style={{
            filter: `
              drop-shadow(0 0 10px hsl(var(--glow-purple) / 0.8))
              drop-shadow(0 0 20px hsl(var(--glow-cyan) / 0.6))
            `
          }}
        />
        
        {/* Additional Glow Layer */}
        <div 
          className={`
            absolute inset-0 rounded-full 
            bg-gradient-glow 
            ${animate ? 'animate-subtle-breathe' : ''}
            opacity-40 blur-xl
            group-hover:opacity-60
            smooth-transition pointer-events-none
          `}
        />
      </div>
      
      {/* Brand Text with Psychedelic Effects */}
      {variant === 'horizontal' && (
        <div className="relative flex flex-col">
          {/* Main Text */}
          <span 
            className={`
              ${currentSize.text} 
              font-bold 
              text-transparent 
              bg-clip-text 
              bg-gradient-rainbow-flow
              ${animate ? 'animate-rainbow-shift' : ''}
              group-hover:scale-105 
              glow-transition
              tracking-tight
              leading-none
              font-orbitron
            `}
            style={{
              backgroundSize: '400% 400%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            AutoPromptr
          </span>
          
          {/* Glowing Text Shadow */}
          <span 
            className={`
              absolute inset-0 
              ${currentSize.text} 
              font-bold 
              text-pastel-purple
              opacity-50 
              blur-sm
              ${animate ? 'animate-glow-pulse' : ''}
              font-orbitron
              tracking-tight
              leading-none
            `}
            aria-hidden="true"
          >
            AutoPromptr
          </span>
          
          {/* Shimmer Effect */}
          <div 
            className={`
              absolute inset-0 
              bg-shimmer-gradient 
              bg-[length:200%_100%] 
              ${animate ? 'animate-shimmer' : ''}
              opacity-30
              pointer-events-none
              rounded-lg
            `}
          />
        </div>
      )}
      
      {/* Floating Particles Effect */}
      {animate && (
        <>
          <div 
            className="
              absolute -top-1 -left-1 
              w-2 h-2 
              bg-pastel-pink 
              rounded-full 
              animate-float-gentle 
              opacity-60 
              blur-sm
            "
            style={{ animationDelay: '0s' }}
          />
          <div 
            className="
              absolute -bottom-1 -right-1 
              w-1.5 h-1.5 
              bg-pastel-cyan 
              rounded-full 
              animate-float-gentle 
              opacity-60 
              blur-sm
            "
            style={{ animationDelay: '2s' }}
          />
          <div 
            className="
              absolute top-1/2 -left-2 
              w-1 h-1 
              bg-pastel-mint 
              rounded-full 
              animate-float-gentle 
              opacity-60 
              blur-sm
            "
            style={{ animationDelay: '4s' }}
          />
        </>
      )}
    </div>
  );
};

export default PsychedelicBrandLogo;