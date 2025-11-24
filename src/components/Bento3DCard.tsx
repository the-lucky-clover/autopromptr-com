import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface Bento3DCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  neonColor?: 'cyan' | 'magenta' | 'purple' | 'yellow' | 'orange';
}

const neonColors = {
  cyan: 'from-neon-cyan/20 to-neon-cyan/5',
  magenta: 'from-neon-magenta/20 to-neon-magenta/5',
  purple: 'from-neon-purple/20 to-neon-purple/5',
  yellow: 'from-neon-yellow/20 to-neon-yellow/5',
  orange: 'from-neon-orange/20 to-neon-orange/5',
};

const borderColors = {
  cyan: 'border-neon-cyan/40',
  magenta: 'border-neon-magenta/40',
  purple: 'border-neon-purple/40',
  yellow: 'border-neon-yellow/40',
  orange: 'border-neon-orange/40',
};

const glowColors = {
  cyan: 'shadow-[0_0_30px_rgba(0,255,255,0.3)]',
  magenta: 'shadow-[0_0_30px_rgba(255,0,255,0.3)]',
  purple: 'shadow-[0_0_30px_rgba(138,43,226,0.3)]',
  yellow: 'shadow-[0_0_30px_rgba(255,255,0,0.3)]',
  orange: 'shadow-[0_0_30px_rgba(255,140,0,0.3)]',
};

const Bento3DCard = ({ 
  children, 
  className = '', 
  delay = 0,
  neonColor = 'cyan'
}: Bento3DCardProps) => {
  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        y: 60, 
        scale: 0.92,
        rotateX: 15
      }}
      whileInView={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
        rotateX: 0
      }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ 
        duration: 0.8, 
        delay,
        ease: [0.16, 1, 0.3, 1]
      }}
      whileHover={{ 
        y: -8,
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
      className={`relative group ${className}`}
      style={{ 
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
    >
      {/* Neon Glow */}
      <motion.div
        animate={{ 
          opacity: [0.3, 0.6, 0.3],
          scale: [0.98, 1.02, 0.98]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className={`absolute -inset-1 bg-gradient-to-br ${neonColors[neonColor]} rounded-3xl blur-xl ${glowColors[neonColor]} group-hover:shadow-[0_0_50px_rgba(0,255,255,0.5)] transition-all duration-500`}
      />
      
      {/* 3D Glass Card */}
      <div className={`relative bg-card/90 backdrop-blur-xl rounded-2xl border-2 ${borderColors[neonColor]} overflow-hidden`}>
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5" 
          style={{
            backgroundImage: `linear-gradient(rgba(0, 255, 255, 0.2) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(0, 255, 255, 0.2) 1px, transparent 1px)`,
            backgroundSize: '30px 30px'
          }}
        />
        
        {/* Top Highlight */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-cyan/50 to-transparent" />
        
        {/* Shimmer Effect */}
        <motion.div
          animate={{ 
            x: ['-200%', '200%'],
            opacity: [0, 0.3, 0]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut",
            repeatDelay: 3
          }}
          className={`absolute inset-0 bg-gradient-to-r from-transparent via-${neonColor === 'cyan' ? 'neon-cyan' : 'neon-magenta'}/30 to-transparent`}
          style={{ width: '40%' }}
        />
        
        {/* Content */}
        <div className="relative z-10 p-8">
          {children}
        </div>
        
        {/* Bottom Accent */}
        <motion.div
          animate={{ 
            opacity: [0.4, 0.7, 0.4]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${neonColors[neonColor]}`}
        />
      </div>
    </motion.div>
  );
};

export default Bento3DCard;
