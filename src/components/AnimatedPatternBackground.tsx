import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

const PatternFloor = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const [pattern, setPattern] = useState<'cheetah' | 'zebra' | 'koi'>('cheetah');

  // Cycle through patterns every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPattern(prev => {
        if (prev === 'cheetah') return 'zebra';
        if (prev === 'zebra') return 'koi';
        return 'cheetah';
      });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

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
    uniform int patternType;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    
    // Noise function
    float noise(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }
    
    float cheetahPattern(vec2 uv) {
      vec2 spots = uv * 15.0 + sin(time * 0.5) * 0.5;
      float spot1 = smoothstep(0.3, 0.7, noise(spots));
      float spot2 = smoothstep(0.4, 0.6, noise(spots + vec2(0.5, 0.3)));
      float spot3 = smoothstep(0.35, 0.65, noise(spots * 1.3 + vec2(0.2, 0.8)));
      return spot1 * spot2 * spot3;
    }
    
    float zebraPattern(vec2 uv) {
      float stripes = sin((uv.x + uv.y) * 20.0 + time * 2.0) * 0.5 + 0.5;
      float wave = sin(uv.x * 10.0 + time * 1.5) * 0.1;
      return smoothstep(0.4, 0.6, stripes + wave);
    }
    
    float koiPattern(vec2 uv) {
      vec2 center = vec2(0.5, 0.5);
      float dist = distance(uv, center);
      float fish = sin(dist * 10.0 - time * 3.0) * 0.5 + 0.5;
      float scales = sin(uv.x * 30.0) * sin(uv.y * 30.0) * 0.5 + 0.5;
      return fish * scales;
    }
    
    void main() {
      // Create illuminated dot matrix
      vec2 grid = abs(fract(vUv * 30.0) - 0.5) / fwidth(vUv * 30.0);
      float dots = min(grid.x, grid.y);
      float dotPattern = 1.0 - min(dots, 1.0);
      
      // Pattern selection
      float patternIntensity = 0.0;
      if (patternType == 0) {
        patternIntensity = cheetahPattern(vUv);
      } else if (patternType == 1) {
        patternIntensity = zebraPattern(vUv);
      } else if (patternType == 2) {
        patternIntensity = koiPattern(vUv);
      }
      
      // Distance fade for vanishing point
      float dist = length(vPosition.xz);
      float fade = 1.0 - smoothstep(3.0, 12.0, dist);
      
      // Illumination effect
      float illumination = sin(time * 2.0) * 0.3 + 0.7;
      
      // Color mixing based on pattern
      vec3 baseColor = mix(color1, color2, patternIntensity);
      baseColor = mix(baseColor, color3, sin(time * 1.5) * 0.5 + 0.5);
      
      // Final color with dots and pattern
      vec3 finalColor = baseColor * (dotPattern * patternIntensity * illumination) * fade;
      finalColor += dotPattern * 0.2 * fade;
      
      gl_FragColor = vec4(finalColor, (dotPattern * patternIntensity * 0.8 + 0.2) * fade);
    }
  `;

  const uniforms = {
    time: { value: 0 },
    color1: { value: new THREE.Color('hsl(263, 85%, 70%)') },
    color2: { value: new THREE.Color('hsl(225, 47%, 20%)') },
    color3: { value: new THREE.Color('hsl(292, 76%, 71%)') },
    patternType: { 
      value: pattern === 'cheetah' ? 0 : pattern === 'zebra' ? 1 : 2 
    }
  };

  // Update pattern type in uniforms
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.patternType.value = 
        pattern === 'cheetah' ? 0 : pattern === 'zebra' ? 1 : 2;
    }
  }, [pattern]);

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -3, 0]}
    >
      <planeGeometry args={[25, 25, 150, 150]} />
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

const AnimatedPatternBackground = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <Canvas
        camera={{ position: [0, 3, 7], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[0, 8, 5]} intensity={1.2} color="hsl(263, 85%, 70%)" />
        <pointLight position={[-5, 5, 2]} intensity={0.8} color="hsl(292, 76%, 71%)" />
        <PatternFloor />
      </Canvas>
    </div>
  );
};

export default AnimatedPatternBackground;