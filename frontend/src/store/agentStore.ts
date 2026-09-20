import { create } from 'zustand';
import { AgentMetadata, AgentProposal, CoordinatorResult, AgentResult } from '../api/agentApi';

export type AgentVisualState =
  | 'IDLE'
  | 'ACTIVATING'
  | 'ANALYZING'
  | 'PROPOSING'
  | 'DELIBERATING'
  | 'CONSENSUS'
  | 'COMPLETED'
  | 'FAILED';

export interface AgentStateMap {
  [agentId: string]: {
    visualState: AgentVisualState;
    lastActive: string;
    proposal?: AgentProposal;
    confidence?: number;
    error?: string;
  };
}

export interface AgentStoreState {
  selectedAgentId: string | null;
  agentStates: AgentStateMap;
  latestProposals: Record<string, AgentProposal>;
  coordinatorResult: CoordinatorResult | null;
  isExecutingAll: boolean;
  isExecutingCoordinator: boolean;

  setSelectedAgentId: (id: string | null) => void;
  setAgentVisualState: (agentId: string, state: AgentVisualState, details?: { proposal?: AgentProposal; confidence?: number; error?: string }) => void;
  setLatestProposals: (proposals: Record<string, AgentProposal>) => void;
  setCoordinatorResult: (result: CoordinatorResult | null) => void;
  setIsExecutingAll: (executing: boolean) => void;
  setIsExecutingCoordinator: (executing: boolean) => void;
  resetAllStates: () => void;
}

const DEFAULT_AGENTS = ['inventory', 'supplier', 'transportation', 'fulfillment', 'sustainability', 'resilience', 'coordinator'];

const initialAgentStates: AgentStateMap = DEFAULT_AGENTS.reduce((acc, id) => {
  acc[id] = {
    visualState: 'IDLE',
    lastActive: new Date().toLocaleTimeString(),
  };
  return acc;
}, {} as AgentStateMap);

export const useAgentStore = create<AgentStoreState>((set) => ({
  selectedAgentId: 'inventory',
  agentStates: initialAgentStates,
  latestProposals: {},
  coordinatorResult: null,
  isExecutingAll: false,
  isExecutingCoordinator: false,

  setSelectedAgentId: (id) => set({ selectedAgentId: id }),

  setAgentVisualState: (agentId, state, details) =>
    set((store) => ({
      agentStates: {
        ...store.agentStates,
        [agentId]: {
          ...store.agentStates[agentId],
          visualState: state,
          lastActive: new Date().toLocaleTimeString(),
          proposal: details?.proposal || store.agentStates[agentId]?.proposal,
          confidence: details?.confidence ?? store.agentStates[agentId]?.confidence,
          error: details?.error || store.agentStates[agentId]?.error,
        },
      },
    })),

  setLatestProposals: (proposals) =>
    set((store) => {
      const updatedStates = { ...store.agentStates };
      Object.entries(proposals).forEach(([id, prop]) => {
        updatedStates[id] = {
          ...updatedStates[id],
          visualState: 'PROPOSING',
          proposal: prop,
          confidence: prop.confidence,
          lastActive: new Date().toLocaleTimeString(),
        };
      });
      return { latestProposals: proposals, agentStates: updatedStates };
    }),

  setCoordinatorResult: (result) =>
    set((store) => {
      if (!result) return { coordinatorResult: null };
      const updatedStates = { ...store.agentStates };

      // Update Coordinator state
      updatedStates['coordinator'] = {
        ...updatedStates['coordinator'],
        visualState: result.candidate_plans.length > 0 ? 'CONSENSUS' : 'COMPLETED',
        lastActive: new Date().toLocaleTimeString(),
      };

      // Mark contributing agents as COMPLETED
      result.candidate_plans.forEach((plan) => {
        plan.supporting_agents.forEach((agId) => {
          if (updatedStates[agId]) {
            updatedStates[agId] = {
              ...updatedStates[agId],
              visualState: 'COMPLETED',
            };
          }
        });
      });

      return { coordinatorResult: result, agentStates: updatedStates };
    }),

  setIsExecutingAll: (executing) => set({ isExecutingAll: executing }),
  setIsExecutingCoordinator: (executing) => set({ isExecutingCoordinator: executing }),

  resetAllStates: () => set({ agentStates: initialAgentStates, coordinatorResult: null, latestProposals: {} }),
}));
