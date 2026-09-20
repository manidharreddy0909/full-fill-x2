/**
 * FlowEdgePrimitive — Animated supply-chain edge
 * Phase 13A: Cinematic Visual Foundation
 *
 * Replaces SpatialEdgePrimitive with:
 * - Directional flow particle travelling along path
 * - Disrupted state: red dashed appearance via opacity pulse
 * - Normal state: dim blue with capacity-encoded brightness
 * - Highlighted state (when connected node is selected)
 * - Performance: single geometry per edge, one Points for particle
 */
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface FlowEdgePrimitiveProps {
  id: string;
  sourcePos: [number, number, number];
  targetPos: [number, number, number];
  isDisrupted?: boolean;
  isHighlighted?: boolean;
  /** 0–1 flow capacity */
  capacity?: number;
}

export const FlowEdgePrimitive: React.FC<FlowEdgePrimitiveProps> = ({
  sourcePos,
  targetPos,
  isDisrupted = false,
  isHighlighted = false,
  capacity = 1,
}) => {
  const particleRef = useRef<THREE.Mesh>(null);
  const lineMtlRef  = useRef<THREE.LineBasicMaterial>(null);

  // Position along path: 0→1
  const progressRef = useRef(Math.random()); // stagger starts

  const lineGeometry = useMemo(() => {
    const src = new THREE.Vector3(...sourcePos);
    const tgt = new THREE.Vector3(...targetPos);
    return new THREE.BufferGeometry().setFromPoints([src, tgt]);
  }, [sourcePos, targetPos]);

  // Derive edge color from state
  const baseColor = isDisrupted
    ? '#e8503a'
    : isHighlighted
    ? '#5b93f6'
    : '#2a4060';

  const lineOpacity = isDisrupted
    ? 0.7
    : isHighlighted
    ? 0.65
    : 0.22 + capacity * 0.15;

  const particleColor = isDisrupted ? '#f87171' : isHighlighted ? '#7fb3ff' : '#4a8abf';

  const src = new THREE.Vector3(...sourcePos);
  const tgt = new THREE.Vector3(...targetPos);

  useFrame((state, delta) => {
    if (!particleRef.current) return;

    const speed = isDisrupted ? 0.4 : 0.2 + capacity * 0.15;
    progressRef.current = (progressRef.current + delta * speed) % 1.0;
    const p = progressRef.current;

    // Lerp along the edge path
    particleRef.current.position.lerpVectors(src, tgt, p);

    // Disrupted: pulse opacity
    if (lineMtlRef.current) {
      if (isDisrupted) {
        lineMtlRef.current.opacity = lineOpacity * (0.5 + Math.sin(state.clock.getElapsedTime() * 6) * 0.5);
      }
    }

    // Fade particle in/out at endpoints
    if (particleRef.current.material instanceof THREE.MeshBasicMaterial) {
      const fadeEdge = 0.12;
      const fade = p < fadeEdge
        ? p / fadeEdge
        : p > 1 - fadeEdge
        ? (1 - p) / fadeEdge
        : 1;
      particleRef.current.material.opacity = fade * (isDisrupted ? 0.9 : 0.75);
    }
  });

  const lineMaterial = useMemo(() => new THREE.LineBasicMaterial({
    color: baseColor,
    transparent: true,
    opacity: lineOpacity,
    linewidth: 1,
  }), [baseColor, lineOpacity]);

  // Keep a ref for animation updates
  React.useEffect(() => {
    (lineMtlRef as React.MutableRefObject<THREE.LineBasicMaterial | null>).current = lineMaterial;
    return () => { lineMaterial.dispose(); };
  }, [lineMaterial]);

  const lineObject = useMemo(
    () => new THREE.Line(lineGeometry, lineMaterial),
    [lineGeometry, lineMaterial]
  );

  return (
    <group>
      {/* Base line */}
      <primitive object={lineObject} />

      {/* Flow particle */}
      <mesh ref={particleRef} position={sourcePos}>
        <sphereGeometry args={[isDisrupted ? 0.14 : 0.1, 8, 8]} />
        <meshBasicMaterial
          color={particleColor}
          transparent
          opacity={0.8}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};
