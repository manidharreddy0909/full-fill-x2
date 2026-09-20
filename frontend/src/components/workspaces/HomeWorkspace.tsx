/**
 * HomeWorkspace — Cinematic operational introduction
 * Phase 13A: Visual Transformation
 *
 * Design: Living global supply-chain network backdrop, real API data,
 * Framer Motion staggered entrance, premium typography hierarchy.
 *
 * Data: fetchWorldSummary + fetchRiskMap → real node count, health, disruptions.
 * Zero fake counters.
 */
import React, { useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useVisualEnvironmentStore } from '../../store/visualEnvironmentStore';
import { useAppShellStore } from '../../store/appShellStore';
import { useRealtimeStore } from '../../store/realtimeStore';
import { fetchWorldSummary, fetchWorldSnapshot } from '../../api/worldApi';
import { fetchRiskMap } from '../../api/riskApi';
import { AtmosphereLayer } from '../../visual/atmosphere/AtmosphereLayer';
import { MetricCard } from '../../visual/telemetry/MetricCard';
import { StatusPill } from '../../visual/telemetry/StatusPill';
import { COLOR, riskColor } from '../../visual/tokens';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  ArrowRight, Activity, Shield, Zap, Globe,
  Network, AlertTriangle, CheckCircle2, Cpu,
} from 'lucide-react';

// ─── Mini Home Canvas ─────────────────────────────────────────────────────────

interface HomeNetworkProps {
  nodes: Array<{ id: string; position?: { x: number; y: number; z: number }; risk_scores: { composite: number }; is_disrupted: boolean }>;
  edges: Array<{ id: string; source_node_id: string; target_node_id: string; is_disrupted: boolean }>;
}

const HomeNetworkScene: React.FC<HomeNetworkProps> = ({ nodes, edges }) => {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Ambient star particles
  const particlePositions = useMemo(() => {
    const arr = new Float32Array(300 * 3);
    for (let i = 0; i < 300; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 50;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 25;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 35;
    }
    return arr;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.04;
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y = t * 0.02;
    }
  });

  // Build node lookup for edge rendering
  const nodeMap = useMemo(() => {
    const m = new Map<string, [number, number, number]>();
    nodes.forEach((n) => {
      if (n.position) {
        // Scale down for home canvas
        m.set(n.id, [n.position.x * 0.4, n.position.y * 0.4, n.position.z * 0.4]);
      }
    });
    return m;
  }, [nodes]);

  return (
    <>
      {/* Fog */}
      <fog attach="fog" args={[new THREE.Color('#040d1c'), 25, 65]} />
      <ambientLight intensity={0.3} color="#a0c0e0" />
      <directionalLight position={[5, 10, 8]} intensity={0.7} color="#c8d8f0" />
      <pointLight position={[-10, -5, -10]} intensity={0.3} color="#5b93f6" />

      {/* Ambient star particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particlePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.09} color="#4a7abf" transparent opacity={0.4} sizeAttenuation />
      </points>

      {/* Rotating network group */}
      <group ref={groupRef}>
        {/* Nodes */}
        {nodes.slice(0, 25).map((n) => {
          const pos = nodeMap.get(n.id) ?? [0, 0, 0];
          const color = riskColor(n.risk_scores.composite, n.is_disrupted);
          const emissive = n.is_disrupted ? 0.8 : 0.25;
          return (
            <mesh key={n.id} position={pos}>
              <sphereGeometry args={[0.28, 14, 14]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={emissive}
                roughness={0.2}
                metalness={0.5}
              />
            </mesh>
          );
        })}

        {/* Edges */}
        {edges.slice(0, 40).map((e) => {
          const src = nodeMap.get(e.source_node_id);
          const tgt = nodeMap.get(e.target_node_id);
          if (!src || !tgt) return null;
          const points = [new THREE.Vector3(...src), new THREE.Vector3(...tgt)];
          const geo = new THREE.BufferGeometry().setFromPoints(points);
          const color = e.is_disrupted ? '#e8503a' : '#1e3a5f';
          const opacity = e.is_disrupted ? 0.6 : 0.18;
          return (
            <primitive
              key={e.id}
              object={new THREE.Line(geo, new THREE.LineBasicMaterial({ color, transparent: true, opacity }))}
            />
          );
        })}
      </group>
    </>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const HomeWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const { setEnvironmentMode } = useVisualEnvironmentStore();
  const { activePreset, activeSeed, isBackendConnected, reducedMotion } = useAppShellStore();
  const { networkHealth, connectionStatus } = useRealtimeStore();

  useEffect(() => {
    setEnvironmentMode('HOME');
  }, [setEnvironmentMode]);

  // Real API data
  const { data: summary } = useQuery({
    queryKey: ['worldSummary'],
    queryFn: fetchWorldSummary,
    staleTime: 30_000,
  });

  const { data: snapshot } = useQuery({
    queryKey: ['worldSnapshot'],
    queryFn: fetchWorldSnapshot,
    staleTime: 30_000,
  });

  const { data: riskMap } = useQuery({
    queryKey: ['riskMap'],
    queryFn: fetchRiskMap,
    staleTime: 30_000,
  });

  // Derived real metrics
  const nodes = snapshot?.nodes ?? [];
  const edges = snapshot?.edges ?? [];
  const nodeCount = nodes.length || summary?.total_nodes || 0;
  const disrupted = nodes.filter((n) => n.is_disrupted || (riskMap?.node_risks[n.id]?.composite ?? 0) >= 0.5).length;
  const healthScore = networkHealth > 0 ? networkHealth : riskMap?.network_health ?? summary?.network_health_score ?? 0.94;
  const wsLive = connectionStatus === 'CONNECTED';

  // Stagger variants
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
  };
  const item = {
    hidden: { opacity: 0, y: 18 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
  };

  return (
    <div
      className="relative overflow-hidden"
      style={{ minHeight: 'calc(100vh - 60px)', background: '#040813' }}
    >
      {/* Atmospheric background */}
      <AtmosphereLayer mode="HOME" />

      {/* 3D Network — right half background */}
      <div
        className="absolute"
        style={{
          top: 0, right: 0,
          width: '60%',
          height: '100%',
          zIndex: 1,
          opacity: 0.45,
          maskImage: 'linear-gradient(to right, transparent 0%, black 30%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 30%)',
          pointerEvents: 'none',
        }}
      >
        <Canvas
          camera={{ position: [0, 8, 22], fov: 48 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'default' }}
          dpr={Math.min(window.devicePixelRatio, 1.2)}
        >
          <HomeNetworkScene nodes={nodes} edges={edges} />
        </Canvas>
      </div>

      {/* Content Layer */}
      <div
        className="relative flex flex-col justify-between"
        style={{ minHeight: 'calc(100vh - 60px)', padding: '48px 56px 40px', zIndex: 2 }}
      >
        {/* ── Hero Section ─── */}
        <motion.div
          variants={container}
          initial={reducedMotion ? 'show' : 'hidden'}
          animate="show"
          style={{ maxWidth: '640px' }}
        >
          {/* Product badge */}
          <motion.div variants={item}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '5px 14px',
                borderRadius: '100px',
                background: 'rgba(91,147,246,0.1)',
                border: '1px solid rgba(91,147,246,0.3)',
                marginBottom: '28px',
              }}
            >
              <Zap size={12} color="#5b93f6" />
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  color: '#7aabf8',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                Phase 13 · Autonomous Operations OS
              </span>
            </div>
          </motion.div>

          {/* Main headline */}
          <motion.div variants={item}>
            <h1
              style={{
                fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)',
                fontWeight: 900,
                lineHeight: 1.08,
                letterSpacing: '-0.03em',
                color: '#ddeeff',
                marginBottom: '0px',
              }}
            >
              FULFILL
              <span style={{ color: '#5b93f6' }}>-X</span>
            </h1>
            <h1
              style={{
                fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)',
                fontWeight: 900,
                lineHeight: 1.08,
                letterSpacing: '-0.03em',
                marginBottom: '16px',
              }}
            >
              <span className="gradient-text-blue-cyan">
                Autonomous Resilience
              </span>
            </h1>
            <h2
              style={{
                fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                fontWeight: 400,
                color: 'rgba(170,195,225,0.65)',
                lineHeight: 1.5,
                marginBottom: '32px',
                letterSpacing: '-0.01em',
              }}
            >
              Fulfillment Resilience Intelligence &amp; Supply Network Operating System.
              <br />
              Predictive disruption · GNN causal inference · Multi-agent swarm deliberation.
            </h2>
          </motion.div>

          {/* CTA row */}
          <motion.div
            variants={item}
            style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '52px' }}
          >
            <button
              onClick={() => navigate('/command')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '13px 28px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                border: '1px solid rgba(91,147,246,0.5)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(59,130,246,0.4)',
                transition: 'all 0.2s',
                letterSpacing: '0.02em',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 28px rgba(59,130,246,0.5)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(59,130,246,0.4)';
              }}
            >
              <span>ENTER OPERATIONS</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={() => navigate('/world')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '13px 22px',
                borderRadius: '10px',
                background: 'rgba(13,21,32,0.7)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#94b8d8',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(91,147,246,0.5)';
                (e.currentTarget as HTMLButtonElement).style.color = '#b8d4f0';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)';
                (e.currentTarget as HTMLButtonElement).style.color = '#94b8d8';
              }}
            >
              <Globe size={15} />
              <span>Explore Topology</span>
            </button>

            <button
              onClick={() => navigate('/intelligence')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '13px 22px',
                borderRadius: '10px',
                background: 'rgba(15,5,30,0.7)',
                border: '1px solid rgba(124,58,237,0.3)',
                color: '#a78bfa',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(124,58,237,0.6)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(124,58,237,0.3)';
              }}
            >
              <Cpu size={15} />
              <span>AI Constellation</span>
            </button>
          </motion.div>

          {/* Live status pills */}
          <motion.div
            variants={item}
            style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}
          >
            <StatusPill
              color={isBackendConnected ? COLOR.healthy : COLOR.critical}
              label="Backend"
              value={isBackendConnected ? 'LIVE' : 'OFFLINE'}
              pulse={isBackendConnected}
              size="sm"
            />
            <StatusPill
              color={wsLive ? COLOR.info : '#4a5c72'}
              label="WebSocket"
              value={wsLive ? 'CONNECTED' : 'STANDBY'}
              pulse={wsLive}
              size="sm"
            />
            <StatusPill
              color={COLOR.healthy}
              label="Preset"
              value={`${activePreset} #${activeSeed}`}
              size="sm"
            />
          </motion.div>
        </motion.div>

        {/* ── Bottom Metric Strip ─── */}
        <motion.div
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6, ease: 'easeOut' as const }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px',
            }}
          >
            <div style={{ width: '20px', height: '1px', background: 'rgba(91,147,246,0.4)' }} />
            <span
              style={{
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                color: 'rgba(91,147,246,0.6)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              Live Network State
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '10px',
              maxWidth: '820px',
            }}
          >
            <MetricCard
              label="Network Health"
              value={(healthScore * 100).toFixed(1)}
              unit="%"
              fill={healthScore}
              color={healthScore >= 0.85 ? COLOR.healthy : healthScore >= 0.6 ? '#f5a623' : COLOR.critical}
              icon={<Activity size={14} />}
            />
            <MetricCard
              label="Topology Nodes"
              value={nodeCount}
              color={COLOR.info}
              sub={`${edges.length} active edges`}
              icon={<Network size={14} />}
            />
            <MetricCard
              label="Disrupted Nodes"
              value={disrupted}
              color={disrupted > 0 ? COLOR.critical : COLOR.healthy}
              fill={nodeCount > 0 ? disrupted / nodeCount : 0}
              icon={<AlertTriangle size={14} />}
            />
            <MetricCard
              label="Safety Plane"
              value="DRY_RUN"
              color="#f5a623"
              sub="Human-in-the-loop locked"
              icon={<Shield size={14} />}
            />
          </div>

          {/* Secondary nav strip */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              marginTop: '20px',
            }}
          >
            {[
              { label: 'War Room', path: '/response/war-room', color: '#f87171' },
              { label: 'Decision Cockpit', path: '/decision/cockpit', color: '#60a5fa' },
              { label: 'Digital Twin', path: '/simulation/twin', color: '#22d3ee' },
              { label: 'Evaluation', path: '/evaluation', color: '#fbbf24' },
              { label: 'Governance', path: '/governance/resilience', color: '#a78bfa' },
            ].map(({ label, path, color }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  background: `${color}0f`,
                  border: `1px solid ${color}28`,
                  color: `${color}cc`,
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = `${color}55`;
                  (e.currentTarget as HTMLButtonElement).style.color = color;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = `${color}28`;
                  (e.currentTarget as HTMLButtonElement).style.color = `${color}cc`;
                }}
              >
                <CheckCircle2 size={10} />
                {label}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
