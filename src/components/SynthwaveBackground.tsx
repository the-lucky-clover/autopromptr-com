
import React from 'react';

const SynthwaveBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Starry Sky Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900 via-indigo-900 to-pink-900">
        {/* Animated Stars */}
        <div className="stars-container">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="star"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 60}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Horizon Line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80" />

      {/* Terrain Silhouettes */}
      <div className="absolute bottom-0 left-0 right-0 h-16 terrain-container">
        {/* Mountains */}
        <svg className="absolute bottom-0 left-0 w-full h-full" viewBox="0 0 800 64" preserveAspectRatio="none">
          <polygon 
            points="0,64 100,20 200,40 300,10 400,35 500,15 600,30 700,25 800,45 800,64" 
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

        {/* Palm Trees */}
        <div className="absolute bottom-0 left-1/4 w-2 h-8 bg-gradient-to-t from-cyan-400 to-transparent palm-tree" />
        <div className="absolute bottom-0 left-3/4 w-2 h-6 bg-gradient-to-t from-cyan-400 to-transparent palm-tree" />
        
        {/* Cacti */}
        <div className="absolute bottom-0 left-1/3 w-1 h-4 bg-gradient-to-t from-green-400 to-transparent cactus" />
        <div className="absolute bottom-0 left-2/3 w-1 h-5 bg-gradient-to-t from-green-400 to-transparent cactus" />
      </div>

      {/* Wireframe Grid */}
      <div className="absolute inset-0 wireframe-grid">
        <svg className="absolute bottom-0 left-0 w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="none">
          {/* Horizontal Grid Lines */}
          {Array.from({ length: 20 }).map((_, i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={400 - (i * 20)}
              x2="800"
              y2={400 - (i * 20)}
              stroke="url(#gridGradient)"
              strokeWidth="1"
              className="grid-line-horizontal"
              style={{
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
          
          {/* Vertical Grid Lines */}
          {Array.from({ length: 30 }).map((_, i) => (
            <line
              key={`v-${i}`}
              x1={i * 30}
              y1="200"
              x2={i * 30}
              y2="400"
              stroke="url(#gridGradient)"
              strokeWidth="1"
              className="grid-line-vertical"
              style={{
                animationDelay: `${i * 0.05}s`
              }}
            />
          ))}
          
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
            width: 2px;
            height: 2px;
            background: white;
            border-radius: 50%;
            animation: twinkle infinite ease-in-out;
            box-shadow: 0 0 4px #fff, 0 0 8px #fff;
          }

          @keyframes twinkle {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.2); }
          }

          .wireframe-grid {
            perspective: 1000px;
            transform-style: preserve-3d;
          }

          .grid-line-horizontal {
            animation: gridMoveHorizontal 8s linear infinite;
          }

          .grid-line-vertical {
            animation: gridMoveVertical 6s linear infinite;
          }

          @keyframes gridMoveHorizontal {
            0% { transform: translateZ(0) scaleY(1); opacity: 0.8; }
            100% { transform: translateZ(200px) scaleY(0.1); opacity: 0; }
          }

          @keyframes gridMoveVertical {
            0% { transform: translateZ(0) perspective(500px) rotateX(0deg); opacity: 0.6; }
            100% { transform: translateZ(200px) perspective(500px) rotateX(45deg); opacity: 0; }
          }

          .terrain-mountain {
            animation: terrainFloat 4s ease-in-out infinite;
          }

          .palm-tree, .cactus {
            animation: terrainSway 3s ease-in-out infinite;
          }

          @keyframes terrainFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-2px); }
          }

          @keyframes terrainSway {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(1deg); }
          }
        `}
      </style>
    </div>
  );
};

export default SynthwaveBackground;
