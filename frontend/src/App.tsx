import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './api/queryClient';

// ─── Phase 1: Experiential Resilience Intelligence Platform ───────────────────
// New application shell (sidebar + topbar, no internal project names visible)
import { ResilienceIntelligenceLayout } from './components/layouts/ResilienceIntelligenceLayout';

// New Phase 1 primary surfaces
import { ResilienceDashboard } from './components/workspaces/ResilienceDashboard';
import { ExperienceMemoryWorkspace } from './components/workspaces/ExperienceMemoryWorkspace';
import { ResilienceGenomeWorkspace } from './components/workspaces/ResilienceGenomeWorkspace';
import { TransferIntelligenceWorkspace } from './components/workspaces/TransferIntelligenceWorkspace';
import { StrategyArenaWorkspace } from './components/workspaces/StrategyArenaWorkspace';

// ─── Preserved Existing Workspaces (Phase 12 — all kept intact) ──────────────
import { HomeWorkspace } from './components/workspaces/HomeWorkspace';
import { CommandWorkspace } from './components/workspaces/CommandWorkspace';
import { WorldWorkspace } from './components/workspaces/WorldWorkspace';
import { RiskWorkspace } from './components/workspaces/RiskWorkspace';
import { AgentConstellationWorkspace } from './components/workspaces/AgentConstellationWorkspace';
import { GNNWorkspace } from './components/workspaces/GNNWorkspace';
import { CausalWorkspace } from './components/workspaces/CausalWorkspace';
import { WarRoomWorkspace } from './components/workspaces/WarRoomWorkspace';
import { AdversaryWorkspace } from './components/workspaces/AdversaryWorkspace';
import { CockpitWorkspace } from './components/workspaces/CockpitWorkspace';
import { VerificationWorkspace } from './components/workspaces/VerificationWorkspace';
import { DigitalTwinWorkspace } from './components/workspaces/DigitalTwinWorkspace';
import { DeliberateWorkspace } from './components/workspaces/DeliberateWorkspace';
import { EventsWorkspace } from './components/workspaces/EventsWorkspace';
import { ResilienceOSWorkspace } from './components/workspaces/ResilienceOSWorkspace';
import { GovernanceWorkspace } from './components/workspaces/GovernanceWorkspace';
import { EvaluationWorkspace } from './components/workspaces/EvaluationWorkspace';
import { ChallengeEngineWorkspace } from './components/workspaces/ChallengeEngineWorkspace';

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* ── Phase 1: New Experiential Intelligence Platform Shell ── */}
          <Route element={<ResilienceIntelligenceLayout />}>
            {/* ── Primary Dashboard (new home) ── */}
            <Route path="/" element={<ResilienceDashboard />} />

            {/* ── New Phase 1 Surfaces ── */}
            <Route path="/memory"   element={<ExperienceMemoryWorkspace />} />
            <Route path="/genome"   element={<ResilienceGenomeWorkspace />} />
            <Route path="/transfer" element={<TransferIntelligenceWorkspace />} />
            <Route path="/arena"    element={<StrategyArenaWorkspace />} />

            {/* ── Preserved: Live Resilience (was Command) ── */}
            <Route path="/command" element={<CommandWorkspace />} />

            {/* ── Preserved: Digital Twin / World ── */}
            <Route path="/world"          element={<WorldWorkspace />} />
            <Route path="/world/node/:id" element={<WorldWorkspace />} />

            {/* ── Preserved: Intelligence ── */}
            <Route path="/intelligence"                element={<AgentConstellationWorkspace />} />
            <Route path="/intelligence/agents"         element={<AgentConstellationWorkspace />} />
            <Route path="/intelligence/agents/:agentId" element={<AgentConstellationWorkspace />} />
            <Route path="/intelligence/risk"           element={<RiskWorkspace />} />
            <Route path="/intelligence/gnn"            element={<GNNWorkspace />} />
            <Route path="/intelligence/causal"         element={<CausalWorkspace />} />

            {/* ── Phase 4: Challenge Engine ── */}
            <Route path="/challenge" element={<ChallengeEngineWorkspace />} />

            {/* ── Preserved: Response / Challenge ── */}
            <Route path="/response/war-room" element={<WarRoomWorkspace />} />
            <Route path="/response/adversary" element={<ChallengeEngineWorkspace />} />

            {/* ── Preserved: Decision ── */}
            <Route path="/decision/cockpit"      element={<CockpitWorkspace />} />
            <Route path="/decision/verification" element={<VerificationWorkspace />} />

            {/* ── Preserved: Simulation ── */}
            <Route path="/simulation/twin" element={<DigitalTwinWorkspace />} />

            {/* ── Preserved: Learning / Skills ── */}
            <Route path="/learning/deliberate" element={<DeliberateWorkspace />} />

            {/* ── Preserved: Observability ── */}
            <Route path="/observability/events" element={<EventsWorkspace />} />

            {/* ── Preserved: Governance ── */}
            <Route path="/governance/resilience" element={<ResilienceOSWorkspace />} />
            <Route path="/governance/policies"   element={<GovernanceWorkspace />} />

            {/* ── Preserved: Evaluation ── */}
            <Route path="/evaluation" element={<EvaluationWorkspace />} />

            {/* ── Catch-all → Primary Dashboard ── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
