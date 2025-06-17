
import React from 'react';

const SynthwaveBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Starry Sky Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900 via-indigo-900 to-pink-900">
        {/* Animated Stars - more concentrated for smaller space */}
        <div className="stars-container">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="star"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 50}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Horizon Line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80" />

      {/* Terrain Silhouettes - adjusted for smaller space */}
      <div className="absolute bottom-0 left-0 right-0 h-8 terrain-container">
        {/* Mountains */}
        <svg className="absolute bottom-0 left-0 w-full h-full" viewBox="0 0 400 32" preserveAspectRatio="none">
          <polygon 
            points="0,32 50,10 100,20 150,5 200,18 250,8 300,15 350,12 400,22 400,32" 
            fill="url(#mountainGradient)"
            className="terrain-mountain"
          />
          <defs>
            <linearGradient id="mountainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ff00ff" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#00ffff" stopOpacity="0.1"/>
            </linearGradient>
          </defs>
        </svg>

        {/* Palm Trees - smaller for confined space */}
        <div className="absolute bottom-0 left-1/4 w-1 h-4 bg-gradient-to-t from-cyan-400 to-transparent palm-tree" />
        <div className="absolute bottom-0 left-3/4 w-1 h-3 bg-gradient-to-t from-cyan-400 to-transparent palm-tree" />
        
        {/* Cacti */}
        <div className="absolute bottom-0 left-1/3 w-0.5 h-2 bg-gradient-to-t from-green-400 to-transparent cactus" />
        <div className="absolute bottom-0 left-2/3 w-0.5 h-3 bg-gradient-to-t from-green-400 to-transparent cactus" />
      </div>

      {/* Wireframe Grid - enhanced for flyover effect */}
      <div className="absolute inset-0 wireframe-grid">
        <svg className="absolute bottom-0 left-0 w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
          {/* Horizontal Grid Lines - perspective effect */}
          {Array.from({ length: 12 }).map((_, i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={200 - (i * 16)}
              x2="400"
              y2={200 - (i * 16)}
              stroke="url(#gridGradient)"
              strokeWidth="0.8"
              className="grid-line-horizontal"
              style={{
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
          
          {/* Vertical Grid Lines - vanishing point perspective */}
          {Array.from({ length: 20 }).map((_, i) => {
            const x = (i - 10) * 20 + 200; // Center around middle
            const perspective = Math.abs(i - 10) * 2; // Perspective distortion
            return (
              <line
                key={`v-${i}`}
                x1={x}
                y1="100"
                x2={x + perspective}
                y2="200"
                stroke="url(#gridGradient)"
                strokeWidth="0.6"
                className="grid-line-vertical"
                style={{
                  animationDelay: `${i * 0.05}s`
                }}
              />
            );
          })}
          
          <defs>
            <linearGradient id="gridGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00ffff" stopOpacity="0.8"/>
              <stop offset="50%" stopColor="#ff00ff" stopOpacity="0.6"/>
              <stop offset="100%" stopColor="#00ffff" stopOpacity="0.2"/>
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
            width: 1.5px;
            height: 1.5px;
            background: white;
            border-radius: 50%;
            animation: twinkle infinite ease-in-out;
            box-shadow: 0 0 3px #fff, 0 0 6px #fff;
          }

          @keyframes twinkle {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.2); }
          }

          .wireframe-grid {
            perspective: 500px;
            transform-style: preserve-3d;
          }

          .grid-line-horizontal {
            animation: gridMoveHorizontal 6s linear infinite;
          }

          .grid-line-vertical {
            animation: gridMoveVertical 4s linear infinite;
          }

          @keyframes gridMoveHorizontal {
            0% { 
              transform: translateZ(0) scaleY(1); 
              opacity: 0.8; 
            }
            100% { 
              transform: translateZ(150px) scaleY(0.1); 
              opacity: 0; 
            }
          }

          @keyframes gridMoveVertical {
            0% { 
              transform: translateZ(0) perspective(300px) rotateX(0deg); 
              opacity: 0.6; 
            }
            100% { 
              transform: translateZ(150px) perspective(300px) rotateX(30deg); 
              opacity: 0; 
            }
          }

          .terrain-mountain {
            animation: terrainFloat 4s ease-in-out infinite;
          }

          .palm-tree, .cactus {
            animation: terrainSway 3s ease-in-out infinite;
          }

          @keyframes terrainFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-1px); }
          }

          @keyframes terrainSway {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(0.5deg); }
          }
        `}
      </style>
    </div>
  );
};

export default SynthwaveBackground;
