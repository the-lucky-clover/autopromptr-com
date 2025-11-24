import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import AuthModal from './AuthModal';

interface AnimatedAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'signin' | 'signup';
}

const AnimatedAuthModal = ({ isOpen, onClose, mode }: AnimatedAuthModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur and darken */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 bg-black/70 z-50"
            onClick={onClose}
          />

          {/* Modal Content */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ 
                opacity: 0, 
                scale: 0.85, 
                y: 50,
                rotateX: 10
              }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: 0,
                rotateX: 0
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.9, 
                y: 30,
                rotateX: -5
              }}
              transition={{ 
                duration: 0.5, 
                ease: [0.16, 1, 0.3, 1],
                scale: { type: "spring", stiffness: 300, damping: 30 }
              }}
              className="relative w-full max-w-md pointer-events-auto"
              style={{ 
                transformStyle: 'preserve-3d',
                perspective: '1000px'
              }}
            >
              {/* 3D Skeuomorphic Container */}
              <div className="relative">
                {/* Neon Glow Effect */}
                <motion.div
                  animate={{ 
                    opacity: [0.4, 0.7, 0.4],
                    scale: [1, 1.02, 1]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute -inset-1 bg-gradient-to-r from-neon-cyan via-neon-magenta to-neon-purple rounded-3xl blur-xl"
                />
                
                {/* Glass Morphism Card with 3D Effect */}
                <div className="relative bg-card/95 backdrop-blur-2xl rounded-2xl border-2 border-neon-cyan/30 overflow-hidden">
                  {/* Subtle grid pattern overlay */}
                  <div className="absolute inset-0 opacity-10" 
                    style={{
                      backgroundImage: `linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
                                       linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)`,
                      backgroundSize: '20px 20px'
                    }}
                  />
                  
                  {/* Animated shimmer effect */}
                  <motion.div
                    animate={{ 
                      x: ['-100%', '200%'],
                      opacity: [0, 0.5, 0]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity,
                      ease: "easeInOut",
                      repeatDelay: 2
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-cyan/20 to-transparent"
                    style={{ width: '50%' }}
                  />
                  
                  {/* Close Button */}
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-muted/50 backdrop-blur-sm border border-neon-cyan/30 hover:border-neon-magenta/50 transition-all duration-300"
                  >
                    <X className="w-5 h-5 text-foreground drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]" />
                  </motion.button>

                  {/* Content */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="relative z-10"
                  >
                    <AuthModal mode={mode} onClose={onClose} />
                  </motion.div>
                  
                  {/* Bottom glow accent */}
                  <motion.div
                    animate={{ 
                      opacity: [0.3, 0.6, 0.3],
                      scale: [0.98, 1, 0.98]
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-magenta"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AnimatedAuthModal;
