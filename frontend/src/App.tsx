import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './api/queryClient';
import { SpatialAppLayout } from './components/layouts/SpatialAppLayout';

// Phase 12.1 — Spatial Shell + World + Risk
import { HomeWorkspace } from './components/workspaces/HomeWorkspace';
import { CommandWorkspace } from './components/workspaces/CommandWorkspace';
import { WorldWorkspace } from './components/workspaces/WorldWorkspace';
import { RiskWorkspace } from './components/workspaces/RiskWorkspace';

// Phase 12.2 — Intelligence + Agents + GNN + Causal
import { AgentConstellationWorkspace } from './components/workspaces/AgentConstellationWorkspace';
import { GNNWorkspace } from './components/workspaces/GNNWorkspace';
import { CausalWorkspace } from './components/workspaces/CausalWorkspace';

// Phase 12.3 — Response + Decision Workspaces
import { WarRoomWorkspace } from './components/workspaces/WarRoomWorkspace';
import { AdversaryWorkspace } from './components/workspaces/AdversaryWorkspace';
import { CockpitWorkspace } from './components/workspaces/CockpitWorkspace';
import { VerificationWorkspace } from './components/workspaces/VerificationWorkspace';

// Phase 12.3 — Analytical + Governance Workspaces
import { DigitalTwinWorkspace } from './components/workspaces/DigitalTwinWorkspace';
import { DeliberateWorkspace } from './components/workspaces/DeliberateWorkspace';
import { EventsWorkspace } from './components/workspaces/EventsWorkspace';
import { ResilienceOSWorkspace } from './components/workspaces/ResilienceOSWorkspace';
import { GovernanceWorkspace } from './components/workspaces/GovernanceWorkspace';
import { EvaluationWorkspace } from './components/workspaces/EvaluationWorkspace';

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<SpatialAppLayout />}>
            {/* Root */}
            <Route path="/" element={<HomeWorkspace />} />

            {/* Command */}
            <Route path="/command" element={<CommandWorkspace />} />

            {/* World — NodeInspector is embedded inside WorldWorkspace via useParams */}
            <Route path="/world" element={<WorldWorkspace />} />
            <Route path="/world/node/:id" element={<WorldWorkspace />} />

            {/* Intelligence */}
            <Route path="/intelligence" element={<AgentConstellationWorkspace />} />
            <Route path="/intelligence/agents" element={<AgentConstellationWorkspace />} />
            <Route path="/intelligence/agents/:agentId" element={<AgentConstellationWorkspace />} />
            <Route path="/intelligence/risk" element={<RiskWorkspace />} />
            <Route path="/intelligence/gnn" element={<GNNWorkspace />} />
            <Route path="/intelligence/causal" element={<CausalWorkspace />} />

            {/* Response — Autonomous Resilience */}
            <Route path="/response/war-room" element={<WarRoomWorkspace />} />
            <Route path="/response/adversary" element={<AdversaryWorkspace />} />

            {/* Decision */}
            <Route path="/decision/cockpit" element={<CockpitWorkspace />} />
            <Route path="/decision/verification" element={<VerificationWorkspace />} />

            {/* Simulation */}
            <Route path="/simulation/twin" element={<DigitalTwinWorkspace />} />

            {/* Learning */}
            <Route path="/learning/deliberate" element={<DeliberateWorkspace />} />

            {/* Observability */}
            <Route path="/observability/events" element={<EventsWorkspace />} />

            {/* Governance */}
            <Route path="/governance/resilience" element={<ResilienceOSWorkspace />} />
            <Route path="/governance/policies" element={<GovernanceWorkspace />} />

            {/* Evaluation */}
            <Route path="/evaluation" element={<EvaluationWorkspace />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/command" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
