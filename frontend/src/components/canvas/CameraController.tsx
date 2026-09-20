import React, { useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useVisualEnvironmentStore } from '../../store/visualEnvironmentStore';
import { useAppShellStore } from '../../store/appShellStore';

export const CameraController: React.FC = () => {
  const { camera } = useThree();
  const { cameraTargetPosition, cameraLookAt } = useVisualEnvironmentStore();
  const { reducedMotion } = useAppShellStore();

  const targetVec = new THREE.Vector3(...cameraTargetPosition);
  const lookAtVec = new THREE.Vector3(...cameraLookAt);

  useEffect(() => {
    if (reducedMotion) {
      camera.position.copy(targetVec);
      camera.lookAt(lookAtVec);
    }
  }, [reducedMotion, cameraTargetPosition, cameraLookAt, camera, targetVec, lookAtVec]);

  useFrame((_, delta) => {
    if (!reducedMotion) {
      camera.position.lerp(targetVec, Math.min(delta * 3.0, 0.1));
      camera.lookAt(lookAtVec);
    }
  });

  return null;
};
