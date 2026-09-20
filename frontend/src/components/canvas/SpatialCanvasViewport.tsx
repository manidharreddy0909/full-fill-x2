import React, { Component, ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useVisualEnvironmentStore } from '../../store/visualEnvironmentStore';
import { CameraController } from './CameraController';
import { SceneAtmosphere } from '../../visual/environment/SceneAtmosphere';
import { EnvironmentMode } from '../../visual/tokens';

// ─── WebGL Error Boundary ─────────────────────────────────────────────────────

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
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

// ─── Viewport ────────────────────────────────────────────────────────────────

export interface SpatialCanvasViewportProps {
  children?: ReactNode;
  /** Override environment mode (default: from store) */
  environmentModeOverride?: EnvironmentMode;
  /** Show floor grid in scene */
  showGrid?: boolean;
  /** Show star field particles */
  showStars?: boolean;
  /** Star density (default: 200) */
  starCount?: number;
  /** Disable orbit controls (e.g. for auto-rotating home scene) */
  noOrbitControls?: boolean;
  /** Enable demand frame loop for static scenes */
  demandFrameLoop?: boolean;
}

export const SpatialCanvasViewport: React.FC<SpatialCanvasViewportProps> = ({
  children,
  environmentModeOverride,
  showGrid = true,
  showStars = true,
  starCount = 200,
  noOrbitControls = false,
  demandFrameLoop = false,
}) => {
  const { environmentMode, viewMode, webglSupported, setWebglSupported } = useVisualEnvironmentStore();

  // Resolve mode — allow override for embedded canvases (e.g. Home hero)
  const resolvedMode = (environmentModeOverride ?? environmentMode ?? 'COMMAND') as EnvironmentMode;

  if (!webglSupported || viewMode === '2D') {
    return (
      <div
        className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-500 font-mono text-xs"
        style={{ background: '#040813' }}
      >
        {viewMode === '2D' ? '2D SVG Viewport Active' : 'WebGL Context Unavailable — Operating in 2D Mode'}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-0 overflow-hidden" style={{ background: '#040813' }}>
      <WebGLErrorBoundary
        fallback={
          <div className="absolute inset-0 flex items-center justify-center text-red-400 font-mono text-xs" style={{ background: '#0a0304' }}>
            WebGL Context Error — Degrading to 2D UI
          </div>
        }
      >
        <Canvas
          camera={{ position: [0, 15, 25], fov: 50 }}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
          dpr={Math.min(window.devicePixelRatio, 1.5)}
          frameloop={demandFrameLoop ? 'demand' : 'always'}
          onCreated={() => setWebglSupported(true)}
        >
          {/* Atmospheric scene environment */}
          <SceneAtmosphere
            mode={resolvedMode}
            showGrid={showGrid}
            showStars={showStars}
            starCount={starCount}
          />

          {/* Camera smooth transitions */}
          <CameraController />

          {/* Orbit interaction */}
          {!noOrbitControls && (
            <OrbitControls
              makeDefault
              enablePan
              enableZoom
              maxPolarAngle={Math.PI / 2.05}
              minDistance={5}
              maxDistance={60}
            />
          )}

          {/* Scene content (nodes, edges, agents, etc.) */}
          {children}
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
};
