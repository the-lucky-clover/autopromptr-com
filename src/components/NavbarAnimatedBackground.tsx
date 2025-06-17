
import React from 'react';

const NavbarAnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Subtle Starry Sky Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/40 via-indigo-900/30 to-pink-900/20">
        {/* Stationary Twinkling Stars */}
        <div className="stars-container">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="star"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 60}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Wireframe Grid - Moving Towards Camera */}
      <div className="absolute inset-0 wireframe-grid-container">
        <svg className="absolute bottom-0 left-0 w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
          {/* Horizontal Grid Lines - Perspective Moving Towards Camera */}
          {Array.from({ length: 8 }).map((_, i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={120 + (i * 10)}
              x2="400"
              y2={120 + (i * 10)}
              stroke="url(#wireframeGradient)"
              strokeWidth="0.8"
              className="grid-line-horizontal"
              style={{
                animationDelay: `${i * 0.2}s`
              }}
            />
          ))}
          
          {/* Vertical Grid Lines - Vanishing Point Perspective */}
          {Array.from({ length: 12 }).map((_, i) => {
            const centerX = 200;
            const spacing = 40;
            const x = centerX + (i - 6) * spacing;
            const perspectiveOffset = Math.abs(i - 6) * 8;
            
            return (
              <line
                key={`v-${i}`}
                x1={x}
                y1="120"
                x2={x + perspectiveOffset}
                y2="200"
                stroke="url(#wireframeGradient)"
                strokeWidth="0.6"
                className="grid-line-vertical"
                style={{
                  animationDelay: `${i * 0.1}s`
                }}
              />
            );
          })}
          
          <defs>
            <linearGradient id="wireframeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00ff88" stopOpacity="0.6"/>
              <stop offset="50%" stopColor="#00ffaa" stopOpacity="0.4"/>
              <stop offset="100%" stopColor="#00ff88" stopOpacity="0.2"/>
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
            animation: gentleTwinkle infinite ease-in-out;
            box-shadow: 0 0 2px #fff, 0 0 4px #fff;
          }

          @keyframes gentleTwinkle {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 1; }
          }

          .wireframe-grid-container {
            perspective: 800px;
            transform-style: preserve-3d;
          }

          .grid-line-horizontal {
            animation: gridMoveTowardsCamera 4s linear infinite;
          }

          .grid-line-vertical {
            animation: gridVanishingPoint 5s linear infinite;
          }

          @keyframes gridMoveTowardsCamera {
            0% { 
              transform: translateY(80px) scaleX(0.3);
              opacity: 0;
            }
            20% {
              opacity: 0.6;
            }
            80% {
              opacity: 0.8;
            }
            100% { 
              transform: translateY(-20px) scaleX(1.2);
              opacity: 0;
            }
          }

          @keyframes gridVanishingPoint {
            0% { 
              transform: perspective(400px) rotateX(0deg) translateZ(100px);
              opacity: 0;
            }
            20% {
              opacity: 0.5;
            }
            80% {
              opacity: 0.7;
            }
            100% { 
              transform: perspective(400px) rotateX(10deg) translateZ(-50px);
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
};

export default NavbarAnimatedBackground;
