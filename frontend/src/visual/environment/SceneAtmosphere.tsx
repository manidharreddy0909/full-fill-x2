/**
 * SceneAtmosphere — R3F scene environment component
 * Phase 13A: Cinematic Visual Foundation
 *
 * Drops inside any <Canvas> to provide:
 * - Environment-mode-driven fog
 * - Calibrated ambient + directional lighting
 * - Subtle floor grid
 * - Optional distant star particles
 *
 * Usage: <SceneAtmosphere mode="WORLD" />
 */
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EnvironmentMode, ENVIRONMENT_IDENTITY } from '../tokens';

interface SceneAtmosphereProps {
  mode: EnvironmentMode;
  showGrid?: boolean;
  showStars?: boolean;
  starCount?: number;
}

export const SceneAtmosphere: React.FC<SceneAtmosphereProps> = ({
  mode,
  showGrid = true,
  showStars = true,
  starCount = 200,
}) => {
  const identity = ENVIRONMENT_IDENTITY[mode];
  const fogColor = new THREE.Color(identity.fogColor);

  return (
    <>
      {/* Fog */}
      <fog attach="fog" args={[fogColor, identity.fogNear, identity.fogFar]} />

      {/* Ambient light — soft fill */}
      <ambientLight intensity={identity.ambientIntensity} color="#c8d8f0" />

      {/* Primary directional — from above-front */}
      <directionalLight
        position={[8, 18, 12]}
        intensity={identity.directionalIntensity}
        color="#d4e8ff"
        castShadow={false}
      />

      {/* Accent fill — from below-back, mode-colored */}
      <pointLight
        position={[-12, -6, -12]}
        intensity={0.4}
        color={identity.accentColor}
        distance={50}
      />

      {/* Rim light from side */}
      <pointLight
        position={[20, 8, 0]}
        intensity={0.2}
        color="#6baee8"
        distance={40}
      />

      {/* Floor grid */}
      {showGrid && (
        <SceneGrid accentColor={identity.accentColor} />
      )}

      {/* Star field */}
      {showStars && (
        <StarField count={starCount} color={identity.accentColor} />
      )}
    </>
  );
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const SceneGrid: React.FC<{ accentColor: string }> = ({ accentColor }) => {
  const gridRef = useRef<THREE.GridHelper>(null);
  const color = new THREE.Color(accentColor);
  color.multiplyScalar(0.15); // very dim

  return (
    <gridHelper
      ref={gridRef}
      args={[80, 40, color, color]}
      position={[0, -3, 0]}
    />
  );
};

const StarField: React.FC<{ count: number; color: string }> = ({ count, color }) => {
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Spread stars far out in a hemisphere
      const r = 40 + Math.random() * 30;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.5; // upper hemisphere only
      arr[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.cos(phi);
      arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.008;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        color={color}
        transparent
        opacity={0.35}
        sizeAttenuation
      />
    </points>
  );
};
