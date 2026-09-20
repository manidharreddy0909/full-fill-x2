import React, { useMemo } from 'react';
import * as THREE from 'three';

export interface SpatialEdgePrimitiveProps {
  id: string;
  sourcePos: [number, number, number];
  targetPos: [number, number, number];
  isDisrupted?: boolean;
}

export const SpatialEdgePrimitive: React.FC<SpatialEdgePrimitiveProps> = ({
  sourcePos,
  targetPos,
  isDisrupted = false,
}) => {
  const lineGeometry = useMemo(() => {
    const points = [new THREE.Vector3(...sourcePos), new THREE.Vector3(...targetPos)];
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [sourcePos, targetPos]);

  const color = isDisrupted ? '#e8503a' : '#4a5c72';

  return (
    <primitive object={new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({ color, linewidth: 2, transparent: true, opacity: isDisrupted ? 0.9 : 0.4 }))} />
  );
};
