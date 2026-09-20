import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVisualEnvironmentStore } from '../../store/visualEnvironmentStore';
import { useAppShellStore } from '../../store/appShellStore';
import { Shield, Cpu, Activity, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ProceduralHomeParticles: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      pointsRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.03) * 0.1;
    }
  });

  const count = 300;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 40;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
  }

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.15} color="#5b93f6" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
};

export const HomeWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const { setEnvironmentMode } = useVisualEnvironmentStore();
  const { activePreset, activeSeed, isBackendConnected } = useAppShellStore();

  useEffect(() => {
    setEnvironmentMode('HOME');
  }, [setEnvironmentMode]);

  return (
    <div className="relative min-h-[calc(100vh-60px)] w-full overflow-hidden flex flex-col justify-between p-8 text-slate-100">
      {/* Background Procedural Canvas */}
      <div className="absolute inset-0 z-0 opacity-40">
        <Canvas camera={{ position: [0, 0, 15] }}>
          <ProceduralHomeParticles />
        </Canvas>
      </div>

      {/* Hero Branding Section */}
      <div className="relative z-10 max-w-4xl pt-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-700/50 text-blue-400 text-xs font-mono mb-6">
          <Zap className="w-3.5 h-3.5 animate-pulse" />
          <span>FULFILL-X — Phase 12 Dynamic Spatial Operations OS</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
          Autonomous Resilience <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400">
            Intelligence & Supply Network OS
          </span>
        </h1>

        <p className="text-slate-300 text-base md:text-lg max-w-2xl font-light mb-8 leading-relaxed">
          Predictive disruption propagation, GNN causal intelligence, multi-agent swarm deliberation, Digital Twin Monte Carlo resilience, and human-in-the-loop executive safety plane.
        </p>

        {/* CTA Launch Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => navigate('/command')}
            className="flex items-center gap-3 px-6 py-3.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-600/30 transition-all transform hover:-translate-y-0.5"
          >
            <span>ENTER COMMAND OS</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigate('/world')}
            className="flex items-center gap-2 px-6 py-3.5 rounded-lg bg-slate-900/80 border border-slate-700 hover:border-slate-500 text-slate-200 font-medium backdrop-blur-md transition-all"
          >
            <span>Explore Topology Graph</span>
          </button>
        </div>
      </div>

      {/* Realtime Environment Status HUD Footer */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-4 max-w-5xl mt-12">
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>BACKEND STATUS</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-mono text-sm font-semibold text-emerald-400">
            {isBackendConnected ? 'LIVE (FastAPI 0.13.0)' : 'OFFLINE (Fallback)'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>SEED CONFIG</span>
            <RefreshCw className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="font-mono text-sm font-semibold text-slate-200">
            Preset: {activePreset} (Seed #{activeSeed})
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>SAFETY PLANE</span>
            <Shield className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-mono text-sm font-semibold text-amber-400">
            DRY_RUN (Locked)
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>AI PROVIDER</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <div className="font-mono text-sm font-semibold text-purple-400">
            Deterministic Mock
          </div>
        </div>
      </div>
    </div>
  );
};
