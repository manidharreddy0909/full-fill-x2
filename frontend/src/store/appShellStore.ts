import { create } from 'zustand';

export interface AppShellState {
  selectedNodeId: string | null;
  activePreset: string;
  activeSeed: number;
  isBackendConnected: boolean;
  reducedMotion: boolean;
  
  // Modals
  isInjectorOpen: boolean;
  injectorTargetId: string | null;
  isWarRoomOpen: boolean;
  isCockpitOpen: boolean;
  isAuthGatewayOpen: boolean;

  // Actions
  setSelectedNodeId: (nodeId: string | null) => void;
  setActivePresetAndSeed: (preset: string, seed: number) => void;
  setIsBackendConnected: (connected: boolean) => void;
  setReducedMotion: (reduced: boolean) => void;
  openInjector: (targetId?: string | null) => void;
  closeInjector: () => void;
  setWarRoomOpen: (open: boolean) => void;
  setCockpitOpen: (open: boolean) => void;
  setAuthGatewayOpen: (open: boolean) => void;
}

export const useAppShellStore = create<AppShellState>((set) => ({
  selectedNodeId: 'sup-001',
  activePreset: 'healthy',
  activeSeed: 42,
  isBackendConnected: true,
  reducedMotion: typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false,

  isInjectorOpen: false,
  injectorTargetId: null,
  isWarRoomOpen: false,
  isCockpitOpen: false,
  isAuthGatewayOpen: false,

  setSelectedNodeId: (nodeId) => set({ selectedNodeId: nodeId }),
  setActivePresetAndSeed: (preset, seed) => set({ activePreset: preset, activeSeed: seed }),
  setIsBackendConnected: (connected) => set({ isBackendConnected: connected }),
  setReducedMotion: (reduced) => set({ reducedMotion: reduced }),
  openInjector: (targetId = null) => set((state) => ({ isInjectorOpen: true, injectorTargetId: targetId || state.selectedNodeId })),
  closeInjector: () => set({ isInjectorOpen: false }),
  setWarRoomOpen: (open) => set({ isWarRoomOpen: open }),
  setCockpitOpen: (open) => set({ isCockpitOpen: open }),
  setAuthGatewayOpen: (open) => set({ isAuthGatewayOpen: open }),
}));
