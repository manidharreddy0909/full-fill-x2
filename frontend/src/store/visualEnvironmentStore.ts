import { create } from 'zustand';

export type SpatialEnvironmentMode = 'HOME' | 'COMMAND' | 'WORLD' | 'RISK' | 'INTELLIGENCE' | 'GOVERNANCE';
export type ViewMode2D3D = '2D' | '3D';

export interface PerformanceMetrics {
  fps: number;
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  isDegraded: boolean;
}

export interface VisualEnvironmentState {
  environmentMode: SpatialEnvironmentMode;
  viewMode: ViewMode2D3D;
  cameraTargetPosition: [number, number, number];
  cameraLookAt: [number, number, number];
  metrics: PerformanceMetrics;
  webglSupported: boolean;

  setEnvironmentMode: (mode: SpatialEnvironmentMode) => void;
  setViewMode: (mode: ViewMode2D3D) => void;
  setCameraTarget: (position: [number, number, number], lookAt?: [number, number, number]) => void;
  updateMetrics: (metrics: Partial<PerformanceMetrics>) => void;
  setWebglSupported: (supported: boolean) => void;
}

export const useVisualEnvironmentStore = create<VisualEnvironmentState>((set) => ({
  environmentMode: 'HOME',
  viewMode: '2D',
  cameraTargetPosition: [0, 15, 25],
  cameraLookAt: [0, 0, 0],
  metrics: {
    fps: 60,
    drawCalls: 12,
    triangles: 14200,
    geometries: 8,
    textures: 2,
    isDegraded: false,
  },
  webglSupported: true,

  setEnvironmentMode: (mode) => set({ environmentMode: mode }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setCameraTarget: (position, lookAt = [0, 0, 0]) => set({ cameraTargetPosition: position, cameraLookAt: lookAt }),
  updateMetrics: (metrics) => set((state) => ({ metrics: { ...state.metrics, ...metrics } })),
  setWebglSupported: (supported) => set({ webglSupported: supported }),
}));
