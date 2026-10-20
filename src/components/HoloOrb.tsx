import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export type OrbPhase = 'idle' | 'observing' | 'analyzing' | 'suggesting' | 'typing';

interface HoloOrbProps {
  phase?: OrbPhase;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
  onClick?: () => void;
  showStatusLabel?: boolean;
}

// Raw 3D Perlin Noise GLSL
const noiseGLSL = /* glsl */ `
vec3 hash3(vec3 p) {
  p = vec3(dot(p, vec3(127.1, 311.7, 74.7)), dot(p, vec3(269.5, 183.3, 246.1)), dot(p, vec3(113.5, 271.9, 124.6)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float noise3(vec3 p) {
  vec3 i = floor(p), f = fract(p), u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(
    mix(
      mix(dot(hash3(i), f), dot(hash3(i + vec3(1, 0, 0)), f - vec3(1, 0, 0)), u.x),
      mix(dot(hash3(i + vec3(0, 1, 0)), f - vec3(0, 1, 0)), dot(hash3(i + vec3(1, 1, 0)), f - vec3(1, 1, 0)), u.x),
      u.y
    ),
    mix(
      mix(dot(hash3(i + vec3(0, 0, 1)), f - vec3(0, 0, 1)), dot(hash3(i + vec3(1, 0, 1)), f - vec3(1, 0, 1)), u.x),
      mix(dot(hash3(i + vec3(0, 1, 1)), f - vec3(0, 1, 1)), dot(hash3(i + vec3(1, 1, 1)), f - vec3(1, 1, 1)), u.x),
      u.y
    ),
    u.z
  );
}

float fbm(vec3 p) {
  return noise3(p) * 0.57 + noise3(p * 2.03 + 3.1) * 0.28 + noise3(p * 4.07 + 7.4) * 0.15;
}
`;

const vertexShader = /* glsl */ `
uniform float uTime, uTurbulence, uPulse, uHover;
uniform vec2 uPointer;
varying vec3 vPosition, vNormal, vView;
${noiseGLSL}

void main() {
  vec3 n = normalize(position);
  float flow = fbm(n * 3.4 + vec3(uTime * 0.16, -uTime * 0.21, uTime * 0.09));
  vec3 pull = vec3(uPointer * 0.8, 0.75);
  float attraction = exp(-length(n.xy - uPointer * 0.7) * 3.0) * uHover;
  vec3 p = position * (1.0 + flow * uTurbulence * 0.28 + sin(uTime * uPulse) * 0.022);
  p += pull * attraction * 0.18;
  p.xy += vec2(-n.y, n.x) * flow * uHover * 0.13;
  vPosition = p;
  vNormal = normalize(normalMatrix * n);
  vec4 view = modelViewMatrix * vec4(p, 1.0);
  vView = -view.xyz;
  gl_Position = projectionMatrix * view;
}
`;

const fragmentShader = /* glsl */ `
uniform float uTime, uTurbulence, uPulse, uHover;
uniform vec2 uPointer;
uniform vec3 uNeonBlue, uPurplishBlue, uDeepViolet;
varying vec3 vPosition, vNormal, vView;
${noiseGLSL}

void main() {
  vec3 p = normalize(vPosition);
  vec3 q = p * 3.1 + vec3(uTime * 0.13, -uTime * 0.18, uTime * 0.09);
  q.xy += uPointer * uHover * 0.32;
  float n = fbm(q + fbm(q + 2.8) * (1.4 + uTurbulence));
  float ribbon = pow(1.0 - abs(sin(p.y * 10.5 + p.x * 3.0 + n * 8.0 - uTime * 0.75)), 10.0);
  float fine = pow(1.0 - abs(sin(p.y * 22.0 - n * 13.0 + uTime * 0.4)), 22.0);
  float facing = max(dot(normalize(vNormal), normalize(vView)), 0.0);
  float rim = pow(1.0 - facing, 2.7);
  float core = pow(facing, 7.0) * (0.44 + 0.13 * sin(uTime * uPulse));
  float tint = clamp(n * 2.2 + p.x * 0.5 + 0.45, 0.0, 1.0);

  // Exact Requested Color Palette: Black background with Purplish Blue body and Light Neon Blue highlights
  vec3 energy = mix(uDeepViolet, uPurplishBlue, tint);
  energy = mix(energy, uNeonBlue, smoothstep(0.15, 0.7, p.x + n) * 0.85);

  vec3 col = energy * (0.08 + ribbon * 1.8 + fine * 0.45 + rim * 0.85);
  col += uNeonBlue * core * 1.3 + mix(uNeonBlue, uPurplishBlue, 0.4) * pow(facing, 22.0) * 0.7;

  gl_FragColor = vec4(col, 0.75 + ribbon * 0.25);
}
`;

const particleVertex = /* glsl */ `
uniform float uTime, uPulse;
attribute float aSeed;
varying float vSeed;

void main() {
  vSeed = aSeed;
  vec3 p = position;
  float angle = uTime * (0.2 + aSeed * 0.3);
  float c = cos(angle), s = sin(angle);
  p.xz = mat2(c, -s, s, c) * p.xz;
  p *= 1.0 + sin(uTime * uPulse + aSeed * 6.28) * 0.04;
  vec4 view = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * view;
  gl_PointSize = (1.5 + aSeed * 2.2) * (3.5 / -view.z);
}
`;

const particleFragment = /* glsl */ `
uniform vec3 uNeonBlue, uPurplishBlue;
varying float vSeed;

void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  vec3 c = mix(uPurplishBlue, uNeonBlue, vSeed);
  gl_FragColor = vec4(c, (1.0 - smoothstep(0.05, 0.5, d)) * 0.9);
}
`;

export const HoloOrb: React.FC<HoloOrbProps> = ({
  phase = 'idle',
  size = 'md',
  className = '',
  onClick,
  showStatusLabel = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  const sizeStyles = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    hero: 'w-56 h-56 sm:w-64 sm:h-64',
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let animationFrameId: number;

    try {
      // 1. Scene & Camera
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
      camera.position.z = 4.2;

      // 2. Renderer with transparent background (black background underneath)
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      const width = container.clientWidth || 48;
      const height = container.clientHeight || 48;
      renderer.setSize(width, height);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      container.appendChild(renderer.domElement);

      // 3. Exact User Color Specs:
      // Purplish Blue (base) and Light Neon Blue (highlights)
      const uNeonBlue = new THREE.Color('#00f2fe');      // Light Neon Blue highlight
      const uPurplishBlue = new THREE.Color('#6366f1');  // Vibrant Purplish Blue
      const uDeepViolet = new THREE.Color('#311068');    // Deep obsidian/violet shadow

      // Uniforms
      const uniforms = {
        uTime: { value: 0 },
        uTurbulence: { value: 0.18 },
        uPulse: { value: 1.2 },
        uHover: { value: 0 },
        uPointer: { value: new THREE.Vector2(0, 0) },
        uNeonBlue: { value: uNeonBlue },
        uPurplishBlue: { value: uPurplishBlue },
        uDeepViolet: { value: uDeepViolet },
      };

      // 4. Plasma Sphere Surface Mesh
      const geometry = new THREE.SphereGeometry(1, 48, 36);
      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
        transparent: true,
        depthWrite: false,
      });
      const orbMesh = new THREE.Mesh(geometry, material);

      // 5. Ambient Stardust Particles
      const particleCount = 480;
      const positions = new Float32Array(particleCount * 3);
      const seeds = new Float32Array(particleCount);

      for (let i = 0; i < particleCount; i++) {
        const y = 1 - 2 * (i + 0.5) / particleCount;
        const radius = Math.sqrt(1 - y * y);
        const angle = i * 2.3999632;
        const shell = 1.08 + 0.18 * (0.5 + 0.5 * Math.sin(i * 18.31));
        positions[i * 3] = Math.cos(angle) * radius * shell;
        positions[i * 3 + 1] = y * shell;
        positions[i * 3 + 2] = Math.sin(angle) * radius * shell;
        seeds[i] = (i * 0.6180339) % 1;
      }

      const particleGeo = new THREE.BufferGeometry();
      particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particleGeo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));

      const particleMat = new THREE.ShaderMaterial({
        vertexShader: particleVertex,
        fragmentShader: particleFragment,
        uniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const particleMesh = new THREE.Points(particleGeo, particleMat);

      const group = new THREE.Group();
      group.add(orbMesh);
      group.add(particleMesh);
      scene.add(group);

      // 6. Pointer interactive magnetic distortion
      const targetPointer = new THREE.Vector2(0, 0);
      const currentPointer = new THREE.Vector2(0, 0);
      let targetHover = 0;
      let currentHover = 0;

      const handlePointerMove = (e: MouseEvent | TouchEvent) => {
        const rect = container.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        targetPointer.x = ((clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
        targetPointer.y = -(((clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1);
        targetHover = 1.6;
      };

      const handlePointerLeave = () => {
        targetPointer.set(0, 0);
        targetHover = 0;
      };

      container.addEventListener('mousemove', handlePointerMove);
      container.addEventListener('mouseleave', handlePointerLeave);
      container.addEventListener('touchmove', handlePointerMove);
      container.addEventListener('touchend', handlePointerLeave);

      // 7. Animation Loop with Phase Dynamics
      let clock = new THREE.Clock();

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        const delta = Math.min(clock.getDelta(), 0.1);

        // Adjust speed & turbulence based on thinking/analyzing phase
        let speedMultiplier = 1.0;
        let targetTurbulence = 0.18;
        let targetPulse = 1.2;

        if (phase === 'analyzing') {
          speedMultiplier = 2.4;
          targetTurbulence = 0.45;
          targetPulse = 2.8;
        } else if (phase === 'observing') {
          speedMultiplier = 1.4;
          targetTurbulence = 0.26;
          targetPulse = 1.6;
        } else if (phase === 'suggesting') {
          speedMultiplier = 1.2;
          targetTurbulence = 0.22;
          targetPulse = 1.9;
        } else if (phase === 'typing') {
          speedMultiplier = 1.6;
          targetTurbulence = 0.30;
          targetPulse = 2.2;
        }

        uniforms.uTime.value += delta * speedMultiplier;
        uniforms.uTurbulence.value += (targetTurbulence - uniforms.uTurbulence.value) * 0.1;
        uniforms.uPulse.value += (targetPulse - uniforms.uPulse.value) * 0.1;

        // Smooth pointer damping
        currentPointer.lerp(targetPointer, 0.1);
        currentHover += (targetHover - currentHover) * 0.1;
        uniforms.uPointer.value.copy(currentPointer);
        uniforms.uHover.value = currentHover;

        // Subtle 3D group rotation
        group.rotation.y += delta * 0.4 * speedMultiplier;
        group.rotation.x += delta * 0.15;

        renderer?.render(scene, camera);
      };

      animate();

      // Handle Resize
      const handleResize = () => {
        if (!container || !renderer) return;
        const w = container.clientWidth || 48;
        const h = container.clientHeight || 48;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', handleResize);

      // Cleanup
      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', handleResize);
        container.removeEventListener('mousemove', handlePointerMove);
        container.removeEventListener('mouseleave', handlePointerLeave);
        container.removeEventListener('touchmove', handlePointerMove);
        container.removeEventListener('touchend', handlePointerLeave);
        if (renderer?.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        geometry.dispose();
        material.dispose();
        particleGeo.dispose();
        particleMat.dispose();
        renderer?.dispose();
      };
    } catch (err) {
      console.warn('ThreeJS WebGL context init notice:', err);
      setHasWebGL(false);
    }
  }, [phase]);

  const getStatusLabel = () => {
    switch (phase) {
      case 'analyzing':
        return 'Thinking & Analyzing';
      case 'observing':
        return 'Perceiving Screen';
      case 'suggesting':
        return 'Ready with Insights';
      case 'typing':
        return 'Streaming Keyboard Neural Text';
      case 'idle':
      default:
        return 'Omni AI Consciousness';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center select-none cursor-pointer ${sizeStyles[size]} ${className}`}
      title={`Omni AI Orb — ${getStatusLabel()}`}
    >
      {/* Black glowing backdrop with deep purplish blue ambient halo and neon cyan rim */}
      <div 
        className="absolute inset-0 rounded-full bg-black shadow-[0_0_24px_rgba(99,102,241,0.4),inset_0_0_12px_rgba(0,242,254,0.3)] transition-all duration-500"
      />

      {/* 3D WebGL Canvas Container */}
      {hasWebGL ? (
        <div ref={containerRef} className="w-full h-full relative z-10 rounded-full overflow-hidden" />
      ) : (
        /* Fallback Vector Emblem with exact color palette */
        <div className="w-full h-full rounded-full bg-black border border-cyan-400/50 flex items-center justify-center relative z-10">
          <div className="w-2/3 h-2/3 rounded-full bg-gradient-to-tr from-[#311068] via-[#6366f1] to-[#00f2fe] animate-pulse" />
        </div>
      )}

      {/* Active Phase Ping Badge */}
      {phase === 'analyzing' && (
        <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 z-20">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00f2fe] opacity-80" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00f2fe]" />
        </span>
      )}

      {showStatusLabel && (
        <span className="absolute -bottom-5 text-[10px] text-cyan-300 font-mono tracking-wider whitespace-nowrap">
          {getStatusLabel()}
        </span>
      )}
    </div>
  );
};
