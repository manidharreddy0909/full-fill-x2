import React, { Component, ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
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

export interface SpatialCanvasViewportProps {
  children?: ReactNode;
}

export const SpatialCanvasViewport: React.FC<SpatialCanvasViewportProps> = ({ children }) => {
  const { environmentMode, viewMode, webglSupported, setWebglSupported } = useVisualEnvironmentStore();

  if (!webglSupported || viewMode === '2D') {
    return (
      <div className="absolute inset-0 bg-slate-950 pointer-events-none flex items-center justify-center text-slate-500 font-mono text-xs">
        {viewMode === '2D' ? '2D SVG Viewport Active' : 'WebGL Context Unavailable — Operating in 2D Mode'}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#050911]">
      <WebGLErrorBoundary
        fallback={
          <div className="absolute inset-0 flex items-center justify-center text-red-400 font-mono text-xs bg-slate-950">
            WebGL Context Error — Degrading to 2D UI
          </div>
        }
      >
        <Canvas
          camera={{ position: [0, 15, 25], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
          onCreated={() => setWebglSupported(true)}
        >
          {/* Environment Lighting Setup */}
          <ambientLight intensity={environmentMode === 'HOME' ? 0.3 : 0.6} />
          <directionalLight position={[10, 20, 15]} intensity={1.0} color="#e2e8f0" />
          <pointLight position={[-10, -10, -10]} intensity={0.4} color="#0ea5e9" />

          {/* Camera Controller & Orbit Interactions */}
          <CameraController />
          <OrbitControls makeDefault enablePan enableZoom maxPolarAngle={Math.PI / 2.1} />

          {/* R3F Children (Spatial Primitives) */}
          {children}
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
};
