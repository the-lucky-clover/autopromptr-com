
import React from 'react';

const NavbarAnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Starry Sky Background - Far Background Layer */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/60 via-purple-950/40 to-slate-900/30">
        {/* Stationary Twinkling Stars */}
        <div className="stars-container">
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={i}
              className="star"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 70}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Green Wireframe Grid - Lower Half Moving Towards Camera */}
      <div className="absolute inset-0 wireframe-grid-container">
        <svg className="absolute bottom-0 left-0 w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
          {/* Horizon Line */}
          <line
            x1="0"
            y1="100"
            x2="400"
            y2="100"
            stroke="#00ff88"
            strokeWidth="1"
            opacity="0.8"
          />
          
          {/* Horizontal Grid Lines - Moving Towards Camera */}
          {Array.from({ length: 15 }).map((_, i) => {
            const y = 100 + (i * 8); // Start from horizon and go down
            const scale = 1 + (i * 0.1); // Increasing scale for perspective
            return (
              <line
                key={`h-${i}`}
                x1="0"
                y1={y}
                x2="400"
                y2={y}
                stroke="url(#synthwaveGreenGradient)"
                strokeWidth={0.8 + (i * 0.1)}
                className="grid-line-horizontal"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  transform: `scaleX(${scale})`,
                  transformOrigin: 'center'
                }}
              />
            );
          })}
          
          {/* Vertical Grid Lines - Vanishing Point Perspective */}
          {Array.from({ length: 21 }).map((_, i) => {
            const centerX = 200;
            const spacing = 20;
            const x = centerX + (i - 10) * spacing;
            const perspectiveOffset = Math.abs(i - 10) * 4;
            
            return (
              <line
                key={`v-${i}`}
                x1={x}
                y1="100"
                x2={x + perspectiveOffset}
                y2="200"
                stroke="url(#synthwaveGreenGradient)"
                strokeWidth="0.6"
                className="grid-line-vertical"
                style={{
                  animationDelay: `${i * 0.05}s`
                }}
              />
            );
          })}
          
          <defs>
            <linearGradient id="synthwaveGreenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00ff88" stopOpacity="0.9"/>
              <stop offset="50%" stopColor="#00ffaa" stopOpacity="0.7"/>
              <stop offset="100%" stopColor="#00ff88" stopOpacity="0.3"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* CSS Styles */}
      <style>
        {`
          .stars-container {
            position: absolute;
            width: 100%;
            height: 100%;
          }

          .star {
            position: absolute;
            width: 1px;
            height: 1px;
            background: white;
            border-radius: 50%;
            animation: subtleTwinkle infinite ease-in-out;
            box-shadow: 0 0 2px rgba(255, 255, 255, 0.8);
          }

          .star:nth-child(3n) {
            width: 1.5px;
            height: 1.5px;
            box-shadow: 0 0 3px rgba(255, 255, 255, 0.9);
          }

          .star:nth-child(5n) {
            width: 0.8px;
            height: 0.8px;
            box-shadow: 0 0 1px rgba(255, 255, 255, 0.6);
          }

          @keyframes subtleTwinkle {
            0%, 100% { 
              opacity: 0.3; 
              transform: scale(1);
            }
            50% { 
              opacity: 1; 
              transform: scale(1.1);
            }
          }

          .wireframe-grid-container {
            perspective: 600px;
            transform-style: preserve-3d;
          }

          .grid-line-horizontal {
            animation: synthwaveGridMoveTowards 8s linear infinite;
          }

          .grid-line-vertical {
            animation: synthwaveGridVanishing 6s linear infinite;
          }

          @keyframes synthwaveGridMoveTowards {
            0% { 
              transform: translateY(100px) scaleX(0.2);
              opacity: 0;
            }
            20% {
              opacity: 0.7;
            }
            80% {
              opacity: 0.9;
            }
            100% { 
              transform: translateY(-20px) scaleX(1.5);
              opacity: 0;
            }
          }

          @keyframes synthwaveGridVanishing {
            0% { 
              transform: perspective(400px) rotateX(0deg) translateZ(80px);
              opacity: 0;
            }
            25% {
              opacity: 0.6;
            }
            75% {
              opacity: 0.8;
            }
            100% { 
              transform: perspective(400px) rotateX(15deg) translateZ(-60px);
              opacity: 0;
            }
          }

          /* Reduced motion support */
          @media (prefers-reduced-motion: reduce) {
            .star,
            .grid-line-horizontal,
            .grid-line-vertical {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default NavbarAnimatedBackground;
