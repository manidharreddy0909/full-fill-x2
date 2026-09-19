import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { WorldNode, WorldEdge } from '../../types/world';

interface World3DViewProps {
  nodes: WorldNode[];
  edges: WorldEdge[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
}

interface NodeMeshProps {
  node: WorldNode;
  isSelected: boolean;
  onSelectNode: (nodeId: string) => void;
}

const NodeMesh: React.FC<NodeMeshProps> = ({ node, isSelected, onSelectNode }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Slow rotation for visual dynamic effect
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.4;
    }
  });

  const getGeometry = (type: string) => {
    switch (type) {
      case 'SUPPLIER': return <sphereGeometry args={[1.2, 24, 24]} />;
      case 'PORT': return <octahedronGeometry args={[1.1]} />;
      case 'WAREHOUSE': return <boxGeometry args={[1.6, 1.4, 1.6]} />;
      case 'FULFILLMENT_CENTER': return <octahedronGeometry args={[1.5]} />;
      case 'CUSTOMER_ZONE': return <sphereGeometry args={[0.7, 16, 16]} />;
      default: return <sphereGeometry args={[1.0, 16, 16]} />;
    }
  };

  const getNodeColor = (node: WorldNode) => {
    if (node.is_disrupted) return '#FF3B30';
    if (node.risk_scores.composite >= 0.6) return '#E8503A';
    if (node.risk_scores.composite >= 0.25) return '#F5A623';
    switch (node.type) {
      case 'SUPPLIER': return '#3B82F6';
      case 'PORT': return '#8B5CF6';
      case 'WAREHOUSE': return '#06B6D4';
      case 'FULFILLMENT_CENTER': return '#10B981';
      case 'CUSTOMER_ZONE': return '#F59E0B';
      default: return '#5B93F6';
    }
  };

  const pos = [node.position.x, node.position.y, node.position.z] as [number, number, number];
  const color = getNodeColor(node);

  return (
    <group position={pos}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelectNode(node.id);
        }}
      >
        {getGeometry(node.type)}
        <meshStandardMaterial
          color={color}
          emissive={isSelected ? '#5B93F6' : node.is_disrupted ? '#FF3B30' : '#000000'}
          emissiveIntensity={isSelected ? 0.6 : node.is_disrupted ? 0.8 : 0.1}
          roughness={0.3}
          metalness={0.4}
        />
      </mesh>

      {/* Selected Indicator Ring */}
      {isSelected && (
        <mesh rotation-x={-Math.PI / 2}>
          <ringGeometry args={[1.8, 2.0, 32]} />
          <meshBasicMaterial color="#5B93F6" side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* HTML Floating Node Label */}
      <Html distanceFactor={18} position={[0, 2.0, 0]} center>
        <div style={{
          background: 'rgba(13, 21, 32, 0.85)',
          border: isSelected ? '1px solid #5B93F6' : node.is_disrupted ? '1px solid #FF3B30' : '1px solid rgba(255,255,255,0.15)',
          padding: '2px 8px',
          borderRadius: '4px',
          color: '#E8EEFF',
          fontSize: '11px',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          backdropFilter: 'blur(4px)'
        }}>
          {node.name}
        </div>
      </Html>
    </group>
  );
};

export const World3DView: React.FC<World3DViewProps> = ({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
}) => {
  const nodeMap = useMemo(() => {
    const map = new Map<string, WorldNode>();
    nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodes]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#080D14' }}>
      <Canvas
        camera={{ position: [0, 22, 35], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[20, 40, 20]} intensity={1.2} />
        <pointLight position={[-20, -20, -20]} intensity={0.5} />

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2 - 0.05}
          minDistance={10}
          maxDistance={80}
        />

        {/* Render 3D Route Edges */}
        {edges.map((edge) => {
          const src = nodeMap.get(edge.source_node_id);
          const tgt = nodeMap.get(edge.target_node_id);
          if (!src || !tgt) return null;

          const points: [number, number, number][] = [
            [src.position.x, src.position.y, src.position.z],
            [tgt.position.x, tgt.position.y, tgt.position.z],
          ];

          const edgeColor = edge.is_disrupted
            ? '#FF3B30'
            : edge.type === 'DEPENDENCY'
            ? 'rgba(255, 255, 255, 0.15)'
            : '#5B93F6';

          return (
            <Line
              key={edge.id}
              points={points}
              color={edgeColor}
              lineWidth={edge.is_disrupted ? 3 : 1.5}
              dashed={edge.type === 'DEPENDENCY'}
            />
          );
        })}

        {/* Render 3D Nodes */}
        {nodes.map((node) => (
          <NodeMesh
            key={node.id}
            node={node}
            isSelected={node.id === selectedNodeId}
            onSelectNode={onSelectNode}
          />
        ))}
      </Canvas>
    </div>
  );
};
