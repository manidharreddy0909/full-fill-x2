import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export interface SpatialNodePrimitiveProps {
  id: string;
  label: string;
  nodeType: string;
  position: [number, number, number];
  riskScore: number;
  isDisrupted: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const SpatialNodePrimitive: React.FC<SpatialNodePrimitiveProps> = ({
  id,
  label,
  nodeType,
  position,
  riskScore,
  isDisrupted,
  isSelected,
  onSelect,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Subtle floating oscillation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 1.5 + position[0]) * 0.15;
    }
  });

  const getColor = () => {
    if (isDisrupted) return '#e8503a';
    if (riskScore >= 0.75) return '#e8503a';
    if (riskScore >= 0.5) return '#f5a623';
    if (riskScore >= 0.25) return '#38bdf8';
    return '#34c77b';
  };

  const nodeColor = getColor();
  const scale = isSelected ? 1.4 : 1.0;

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        scale={[scale, scale, scale]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(id);
        }}
      >
        <sphereGeometry args={[0.8, 24, 24]} />
        <meshStandardMaterial
          color={nodeColor}
          emissive={nodeColor}
          emissiveIntensity={isDisrupted ? 0.8 : isSelected ? 0.6 : 0.2}
          roughness={0.2}
          metalness={0.5}
        />
      </mesh>

      {/* Outer focus aura ring when selected */}
      {isSelected && (
        <mesh rotation-x={Math.PI / 2}>
          <ringGeometry args={[1.1, 1.35, 32]} />
          <meshBasicMaterial color="#5b93f6" side={THREE.DoubleSide} transparent opacity={0.8} />
        </mesh>
      )}

      {/* HTML Label on hover or selection */}
      <Html distanceFactor={25} position={[0, 1.4, 0]} center style={{ pointerEvents: 'none' }}>
        <div
          className={`px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap shadow-lg ${
            isSelected
              ? 'bg-blue-600/90 text-white border border-blue-400 font-bold'
              : 'bg-slate-900/80 text-slate-200 border border-slate-700/60'
          }`}
        >
          {id} | {label}
        </div>
      </Html>
    </group>
  );
};
