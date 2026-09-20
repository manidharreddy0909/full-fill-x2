import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface RiskPulsePrimitiveProps {
  position: [number, number, number];
  riskScore: number;
}

export const RiskPulsePrimitive: React.FC<RiskPulsePrimitiveProps> = ({ position, riskScore }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      const pulse = 1.0 + Math.sin(time * (2.0 + riskScore * 3.0)) * 0.3;
      meshRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  const getColor = () => {
    if (riskScore >= 0.75) return '#e8503a';
    if (riskScore >= 0.5) return '#f5a623';
    if (riskScore >= 0.25) return '#38bdf8';
    return '#34c77b';
  };

  return (
    <mesh ref={meshRef} position={position} rotation-x={Math.PI / 2}>
      <ringGeometry args={[1.2, 1.6, 32]} />
      <meshBasicMaterial color={getColor()} side={THREE.DoubleSide} transparent opacity={0.35 + riskScore * 0.4} />
    </mesh>
  );
};
