import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './api/queryClient';
import { SpatialAppLayout } from './components/layouts/SpatialAppLayout';
import { HomeWorkspace } from './components/workspaces/HomeWorkspace';
import { CommandWorkspace } from './components/workspaces/CommandWorkspace';
import { WorldWorkspace } from './components/workspaces/WorldWorkspace';
import { RiskWorkspace } from './components/workspaces/RiskWorkspace';

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<SpatialAppLayout />}>
            <Route path="/" element={<HomeWorkspace />} />
            <Route path="/command" element={<CommandWorkspace />} />
            <Route path="/world" element={<WorldWorkspace />} />
            <Route path="/world/node/:id" element={<WorldWorkspace />} />
            <Route path="/intelligence/risk" element={<RiskWorkspace />} />
            <Route path="*" element={<Navigate to="/command" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
