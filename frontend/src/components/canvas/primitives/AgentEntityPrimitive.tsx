import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { AgentVisualState } from '../../../store/agentStore';

export interface AgentEntityPrimitiveProps {
  id: string;
  name: string;
  color: string;
  position: [number, number, number];
  visualState: AgentVisualState;
  isCoordinator?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

export const AgentEntityPrimitive: React.FC<AgentEntityPrimitiveProps> = ({
  id,
  name,
  color,
  position,
  visualState,
  isCoordinator = false,
  isSelected = false,
  onSelect,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const pulseRef = useRef<THREE.Mesh>(null);

  // Animate core pulsing / slow rotation
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * (isCoordinator ? 0.8 : 0.4);
      if (visualState === 'ANALYZING' || visualState === 'PROPOSING' || visualState === 'DELIBERATING') {
        const s = 1.0 + Math.sin(state.clock.getElapsedTime() * 6.0) * 0.15;
        meshRef.current.scale.set(s, s, s);
      } else {
        meshRef.current.scale.set(1, 1, 1);
      }
    }

    if (pulseRef.current && (visualState === 'ACTIVATING' || visualState === 'PROPOSING' || visualState === 'CONSENSUS')) {
      const scale = 1.0 + ((state.clock.getElapsedTime() * 2.0) % 1.8);
      pulseRef.current.scale.set(scale, scale, scale);
      (pulseRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1.0 - (scale / 2.8));
    }
  });

  const getStatusColor = () => {
    switch (visualState) {
      case 'ACTIVATING': return '#38bdf8';
      case 'ANALYZING': return '#fbbf24';
      case 'PROPOSING': return '#c084fc';
      case 'DELIBERATING': return '#818cf8';
      case 'CONSENSUS': return '#34d399';
      case 'COMPLETED': return '#10b981';
      case 'FAILED': return '#f87171';
      default: return color || '#60a5fa';
    }
  };

  const statusColor = getStatusColor();

  return (
    <group position={position}>
      {/* Laser Connection Line to Central Coordinator [0,0,0] */}
      {!isCoordinator && (
        <Line
          points={[[0, 0, 0], [-position[0], -position[1], -position[2]]]}
          color={statusColor}
          transparent
          opacity={isSelected ? 0.9 : 0.35}
          lineWidth={2}
        />
      )}

      {/* Activity Pulse Ring */}
      <mesh ref={pulseRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[isCoordinator ? 1.5 : 0.8, isCoordinator ? 1.8 : 1.0, 32]} />
        <meshBasicMaterial color={statusColor} transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>

      {/* Core Node Sphere */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.(id);
        }}
      >
        <sphereGeometry args={[isCoordinator ? 1.2 : 0.7, 32, 32]} />
        <meshStandardMaterial
          color={statusColor}
          emissive={statusColor}
          emissiveIntensity={isSelected ? 0.8 : 0.4}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Selected Halo Outline Ring */}
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[isCoordinator ? 1.6 : 1.0, isCoordinator ? 1.8 : 1.15, 32]} />
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.9} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Accessible 2D/3D HTML Label Overlay */}
      <Html position={[0, isCoordinator ? 1.4 : 0.9, 0]} center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
        <div className="flex flex-col items-center bg-[#060b14]/90 px-2 py-0.5 rounded-md border border-cyan-500/30 backdrop-blur-md whitespace-nowrap shadow-md">
          <span className="font-mono text-[9px] font-bold text-slate-200">{name}</span>
          <span
            className="text-[8px] font-mono px-1 py-0.2 rounded font-semibold uppercase mt-0.5"
            style={{ backgroundColor: `${statusColor}22`, color: statusColor, border: `1px solid ${statusColor}66` }}
          >
            {visualState}
          </span>
        </div>
      </Html>
    </group>
  );
};
