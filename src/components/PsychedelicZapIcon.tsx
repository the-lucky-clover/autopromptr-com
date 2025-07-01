
import { Zap } from 'lucide-react';

interface PsychedelicZapIconProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
  id?: string;
}

const PsychedelicZapIcon = ({ size = 'medium', className = '', id }: PsychedelicZapIconProps) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const containerSizes = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  const iconSizes = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-10 h-10'
  };

  const currentSize = sizeClasses[size];
  const currentContainer = containerSizes[size];
  const currentIcon = iconSizes[size];

  return (
    <div className={`relative ${className}`} id={id}>
      <div className={`${currentContainer} bg-gradient-to-br from-pink-500 via-purple-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/25 transform hover:scale-105 transition-transform duration-300`}>
        <div className={`${currentSize} bg-gradient-to-tr from-yellow-400 via-pink-500 to-cyan-400 rounded-lg flex items-center justify-center animate-pulse`}>
          <Zap className={`${currentIcon} text-white drop-shadow-lg`} fill="currentColor" />
        </div>
      </div>
      {/* Animated glow effect */}
      <div className={`absolute inset-0 ${currentContainer} bg-gradient-to-br from-pink-500 via-purple-600 to-blue-500 rounded-xl opacity-50 blur-sm animate-pulse`}></div>
    </div>
  );
};

export default PsychedelicZapIcon;
