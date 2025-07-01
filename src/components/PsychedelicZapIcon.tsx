
import { Zap } from 'lucide-react';

const PsychedelicZapIcon = () => {
  return (
    <div className="relative">
      <div className="w-16 h-16 bg-gradient-to-br from-pink-500 via-purple-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/25 transform hover:scale-105 transition-transform duration-300">
        <div className="w-14 h-14 bg-gradient-to-tr from-yellow-400 via-pink-500 to-cyan-400 rounded-lg flex items-center justify-center animate-pulse">
          <Zap className="w-8 h-8 text-white drop-shadow-lg" fill="currentColor" />
        </div>
      </div>
      {/* Animated glow effect */}
      <div className="absolute inset-0 w-16 h-16 bg-gradient-to-br from-pink-500 via-purple-600 to-blue-500 rounded-xl opacity-50 blur-sm animate-pulse"></div>
    </div>
  );
};

export default PsychedelicZapIcon;
