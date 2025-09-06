import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

const Floor = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vPosition;
    
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float time;
    uniform vec3 color1;
    uniform vec3 color2;
    uniform vec3 color3;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    
    void main() {
      // Create grid pattern
      vec2 grid = abs(fract(vUv * 20.0) - 0.5) / fwidth(vUv * 20.0);
      float line = min(grid.x, grid.y);
      float gridPattern = 1.0 - min(line, 1.0);
      
      // Holographic shimmer effect
      float shimmer = sin(vUv.x * 10.0 + time * 2.0) * cos(vUv.y * 8.0 + time * 1.5);
      shimmer = smoothstep(-0.5, 0.5, shimmer);
      
      // Distance fade for vanishing point
      float dist = length(vPosition.xz);
      float fade = 1.0 - smoothstep(2.0, 8.0, dist);
      
      // Intermittent gleam
      float gleam = sin(time * 3.0) * 0.5 + 0.5;
      gleam = pow(gleam, 3.0);
      
      // Color mixing
      vec3 baseColor = mix(color1, color2, vUv.x);
      baseColor = mix(baseColor, color3, shimmer * 0.3);
      
      // Final color with grid and effects
      vec3 finalColor = baseColor * (0.1 + gridPattern * 0.4) * fade;
      finalColor += shimmer * gleam * color3 * 0.8 * fade;
      
      gl_FragColor = vec4(finalColor, (gridPattern * 0.6 + shimmer * 0.4) * fade);
    }
  `;

  const uniforms = {
    time: { value: 0 },
    color1: { value: new THREE.Color('hsl(263, 85%, 70%)') }, // primary
    color2: { value: new THREE.Color('hsl(263, 85%, 70%)') }, // accent  
    color3: { value: new THREE.Color('hsl(225, 47%, 20%)') }, // secondary
  };

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -2, 0]}
    >
      <planeGeometry args={[20, 20, 100, 100]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};

const HolographicFloor = () => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 2, 5], fov: 60 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.2} />
        <pointLight position={[0, 10, 5]} intensity={0.8} color="hsl(263, 85%, 70%)" />
        <Floor />
      </Canvas>
    </div>
  );
};

export default HolographicFloor;