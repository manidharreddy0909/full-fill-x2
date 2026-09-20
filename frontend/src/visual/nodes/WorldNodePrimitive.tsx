/**
 * WorldNodePrimitive — Enhanced 3D supply-chain node
 * Phase 13A: Cinematic Visual Foundation
 *
 * Replaces SpatialNodePrimitive with:
 * - Risk-mapped glow rings
 * - Inner core + outer aura shells
 * - Disruption pulse animation
 * - Selection vertical beam + camera ring
 * - Node-type color coding
 * - Performance: single mesh ref, no per-frame allocation
 */
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { riskColor, riskEmissiveIntensity, nodeTypeColor } from '../tokens';

export interface WorldNodePrimitiveProps {
  id: string;
  label: string;
  nodeType: string;
  position: [number, number, number];
  riskScore: number;
  isDisrupted: boolean;
  isSelected: boolean;
  onSelect: (id: string | null) => void;
}

export const WorldNodePrimitive: React.FC<WorldNodePrimitiveProps> = ({
  id,
  label,
  nodeType,
  position,
  riskScore,
  isDisrupted,
  isSelected,
  onSelect,
}) => {
  const coreRef  = useRef<THREE.Mesh>(null);
  const auraRef  = useRef<THREE.Mesh>(null);
  const ringRef  = useRef<THREE.Mesh>(null);
  const beamRef  = useRef<THREE.Mesh>(null);

  const primaryColor = riskColor(riskScore, isDisrupted);
  const typeColor    = nodeTypeColor(nodeType);
  const emissive     = riskEmissiveIntensity(riskScore, isDisrupted);
  const coreSize     = isSelected ? 1.0 : 0.75;
  const auraSize     = isSelected ? 1.6 : 1.3;

  // Memoize materials to prevent per-frame re-creation
  const coreMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: primaryColor,
    emissive: primaryColor,
    emissiveIntensity: emissive,
    roughness: 0.15,
    metalness: 0.6,
  }), [primaryColor, emissive]);

  const auraMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: primaryColor,
    transparent: true,
    opacity: isDisrupted ? 0.12 : 0.06,
    roughness: 1,
    metalness: 0,
    side: THREE.FrontSide,
    depthWrite: false,
  }), [primaryColor, isDisrupted]);

  const ringMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: isSelected ? '#5b93f6' : primaryColor,
    transparent: true,
    opacity: isSelected ? 0.9 : 0.5,
    side: THREE.DoubleSide,
    depthWrite: false,
  }), [primaryColor, isSelected]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const float = Math.sin(t * 1.4 + position[0] * 0.7) * 0.12;

    if (coreRef.current) {
      coreRef.current.position.y = float;
      // Disruption pulse: scale breathe
      if (isDisrupted) {
        const pulse = 1 + Math.sin(t * 4) * 0.06;
        coreRef.current.scale.setScalar(pulse * coreSize);
      } else {
        coreRef.current.scale.setScalar(coreSize);
      }
    }

    if (auraRef.current) {
      auraRef.current.position.y = float;
      // Aura breathe (slower)
      const breathe = 1 + Math.sin(t * 1.8 + 1) * (isDisrupted ? 0.15 : 0.05);
      auraRef.current.scale.setScalar(auraSize * breathe);
      if (auraRef.current.material instanceof THREE.MeshStandardMaterial) {
        auraRef.current.material.opacity = isDisrupted
          ? 0.08 + Math.sin(t * 3) * 0.04
          : 0.05 + Math.sin(t * 1.5) * 0.015;
      }
    }

    if (ringRef.current) {
      ringRef.current.position.y = float - 0.05;
      ringRef.current.rotation.y = t * (isSelected ? 0.6 : 0.2);
    }

    if (beamRef.current && isSelected) {
      beamRef.current.material && ((beamRef.current.material as THREE.MeshBasicMaterial).opacity = 0.15 + Math.sin(t * 2) * 0.05);
    }
  });

  return (
    <group position={position}>
      {/* Core sphere */}
      <mesh
        ref={coreRef}
        material={coreMaterial}
        onClick={(e) => { e.stopPropagation(); onSelect(id); }}
      >
        <sphereGeometry args={[0.7, 28, 28]} />
      </mesh>

      {/* Outer aura (transparent shell) */}
      <mesh ref={auraRef} material={auraMaterial}>
        <sphereGeometry args={[0.7, 16, 16]} />
      </mesh>

      {/* Equatorial ring */}
      <mesh ref={ringRef} material={ringMaterial} rotation-x={Math.PI / 2}>
        <ringGeometry args={[
          isSelected ? 1.2 : 0.9,
          isSelected ? 1.45 : 1.08,
          isSelected ? 48 : 32,
        ]} />
      </mesh>

      {/* Selection vertical beam */}
      {isSelected && (
        <mesh ref={beamRef} position={[0, 4, 0]}>
          <cylinderGeometry args={[0.05, 0.35, 8, 8, 1, true]} />
          <meshBasicMaterial
            color="#5b93f6"
            transparent
            opacity={0.18}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Type indicator — small colored sphere at bottom */}
      <mesh position={[0, -0.85, 0]}>
        <sphereGeometry args={[0.15, 10, 10]} />
        <meshBasicMaterial color={typeColor} />
      </mesh>

      {/* HTML label */}
      <Html
        distanceFactor={28}
        position={[0, 1.7, 0]}
        center
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div
          style={{
            padding: '3px 8px',
            borderRadius: '5px',
            fontSize: '10px',
            fontFamily: 'var(--font-mono, monospace)',
            fontWeight: isSelected ? 700 : 500,
            whiteSpace: 'nowrap',
            background: isSelected
              ? 'rgba(59,130,246,0.88)'
              : isDisrupted
              ? 'rgba(80,8,8,0.88)'
              : 'rgba(10,18,30,0.82)',
            color: isSelected ? '#fff' : isDisrupted ? '#fca5a5' : '#b0c8e0',
            border: `1px solid ${isSelected ? 'rgba(91,147,246,0.7)' : isDisrupted ? 'rgba(232,80,58,0.5)' : 'rgba(255,255,255,0.08)'}`,
            backdropFilter: 'blur(4px)',
            transition: 'all 0.2s',
          }}
        >
          {id}
        </div>
      </Html>
    </group>
  );
};
