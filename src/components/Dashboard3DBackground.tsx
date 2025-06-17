
import React, { useEffect, useState } from 'react';

const Dashboard3DBackground = () => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; delay: number }>>([]);

  useEffect(() => {
    // Generate floating particles
    const particleArray = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 8
    }));
    setParticles(particleArray);
  }, []);

  return (
    <div className="dashboard-3d-background">
      <div className="particle-layer">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.x}%`,
              animationDelay: `${particle.delay}s`,
              '--shimmer-delay': `${particle.delay}s`
            } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard3DBackground;
