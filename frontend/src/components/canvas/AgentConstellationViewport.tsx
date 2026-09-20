import React, { Component, ReactNode, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useVisualEnvironmentStore } from '../../store/visualEnvironmentStore';
import { CameraController } from './CameraController';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class WebGLErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Orbit Ring Line Mesh Component for visual constellation ring
const ConstellationOrbitRing: React.FC = () => {
  const ringRef = useRef<THREE.LineLoop>(null);

  useFrame((_, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.05;
    }
  });

  const points: THREE.Vector3[] = [];
  const radius = 12;
  const segments = 64;
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <lineLoop ref={ringRef} geometry={geometry}>
      <lineBasicMaterial attach="material" color="#38bdf8" transparent opacity={0.25} linewidth={1} />
    </lineLoop>
  );
};

export interface AgentConstellationViewportProps {
  children?: ReactNode;
}

export const AgentConstellationViewport: React.FC<AgentConstellationViewportProps> = ({ children }) => {
  const { viewMode, webglSupported, setWebglSupported } = useVisualEnvironmentStore();

  if (!webglSupported || viewMode === '2D') {
    return (
      <div className="absolute inset-0 bg-slate-950 pointer-events-none flex items-center justify-center text-slate-500 font-mono text-xs">
        {viewMode === '2D' ? '2D Accessible List Mode Active' : 'WebGL Context Unavailable — Operating in 2D List View'}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#040813]">
      <WebGLErrorBoundary
        fallback={
          <div className="absolute inset-0 flex items-center justify-center text-red-400 font-mono text-xs bg-slate-950">
            WebGL Context Error — Falling back to 2D List Layout
          </div>
        }
      >
        <Canvas
          camera={{ position: [0, 18, 26], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
          onCreated={() => setWebglSupported(true)}
        >
          {/* Intelligence Deep Space Lighting Setup */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[15, 25, 20]} intensity={1.2} color="#c084fc" />
          <pointLight position={[0, 5, 0]} intensity={1.5} color="#38bdf8" />
          <pointLight position={[-15, -10, -15]} intensity={0.5} color="#34d399" />

          {/* Camera Controller & Orbit Interactions */}
          <CameraController />
          <OrbitControls makeDefault enablePan enableZoom maxPolarAngle={Math.PI / 2.1} />

          {/* Orbit Ring Grid */}
          <ConstellationOrbitRing />

          {/* 3D Agent Constellation Primitives */}
          {children}
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
};
