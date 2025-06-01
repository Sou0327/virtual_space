import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import { GLBLoader } from './GLBLoader';

// 型定義
interface RoomConfig {
  wallMaterial: string;
  floorMaterial: string;
  wallTexture?: string;
  floorTexture?: string;
  objects: Array<{
    id: string;
    type: string;
    name: string;
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
    modelUrl?: string;
    generated?: boolean;
  }>;
}

interface GeneratedObjectProps {
  object: any;
  isSelected: boolean;
  onSelect: () => void;
  onTransform: (position: [number, number, number], rotation: [number, number, number], scale: [number, number, number]) => void;
  isPointerLocked: boolean;
  editMode: 'translate' | 'rotate' | 'scale';
  snapToGrid: boolean;
  gridSize: number;
  onHover?: (objectId: string | null) => void;
  onDoubleClick?: (objectId: string) => void;
  onRightClick?: (objectId: string, x: number, y: number) => void;
  onQuickAction?: (action: string, objectId: string) => void;
  isHovered?: boolean;
  showQuickActions?: boolean;
}

interface RoomEnvironmentProps {
  config: RoomConfig;
  selectedObjectId: string | null;
  onObjectSelect: (id: string | null) => void;
  onObjectTransform: (id: string, position: [number, number, number], rotation: [number, number, number], scale: [number, number, number]) => void;
  isPointerLocked: boolean;
  editMode: 'translate' | 'rotate' | 'scale';
  showGrid?: boolean;
  gridSize?: number;
  onFloorClick?: (position: [number, number, number]) => void;
}

// GridHelperコンポーネント
const GridHelper: React.FC = () => {
  const gridRef = useRef<THREE.GridHelper>(null);

  useFrame(() => {
    if (gridRef.current) {
      gridRef.current.position.y = 0.01;
    }
  });

  return (
    <gridHelper
      ref={gridRef}
      args={[20, 40, '#ffffff', '#888888']}
      position={[0, 0.01, 0]}
    />
  );
};

// GeneratedObjectコンポーネント
export const GeneratedObject: React.FC<GeneratedObjectProps> = ({
  object,
  isSelected,
  onSelect,
  onTransform,
  isPointerLocked,
  editMode,
  snapToGrid,
  gridSize,
  onHover,
  onDoubleClick,
  onRightClick,
  onQuickAction,
  isHovered = false,
  showQuickActions = true
}) => {
  const meshRef = useRef<THREE.Group>(null);

  const handleDragStart = () => {
    onHover?.(object.id);
  };

  const handleDragEnd = () => {
    onHover?.(null);
  };

  const handleChange = () => {
    if (meshRef.current) {
      const position = meshRef.current.position.toArray() as [number, number, number];
      const rotation = meshRef.current.rotation.toArray().slice(0, 3) as [number, number, number];
      const scale = meshRef.current.scale.toArray() as [number, number, number];
      onTransform(position, rotation, scale);
    }
  };

  const renderObject = () => {
    console.log('🔍 Object render check:', object);

    if (object.modelUrl) {
      console.log('🌐 Using external model URL:', object.modelUrl);
      return <GLBLoader url={object.modelUrl} />;
    }

    // デフォルトメッシュ
    console.log('🔧 Rendering mock object for:', object.name, object.type);

    switch (object.type) {
      case 'chair':
        return (
          <group>
            {/* 座面 */}
            <mesh position={[0, 0.25, 0]}>
              <boxGeometry args={[0.4, 0.05, 0.4]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
            {/* 背もたれ */}
            <mesh position={[0, 0.5, -0.175]}>
              <boxGeometry args={[0.4, 0.5, 0.05]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
            {/* 脚 */}
            {[-0.15, 0.15].map((x, i) =>
              [-0.15, 0.15].map((z, j) => (
                <mesh key={`${i}-${j}`} position={[x, 0.125, z]}>
                  <cylinderGeometry args={[0.02, 0.02, 0.25]} />
                  <meshStandardMaterial color="#654321" />
                </mesh>
              ))
            )}
          </group>
        );

      case 'table':
        return (
          <group>
            {/* 天板 */}
            <mesh position={[0, 0.4, 0]}>
              <boxGeometry args={[1.2, 0.05, 0.8]} />
              <meshStandardMaterial color="#DEB887" />
            </mesh>
            {/* 脚 */}
            {[-0.5, 0.5].map((x, i) =>
              [-0.3, 0.3].map((z, j) => (
                <mesh key={`${i}-${j}`} position={[x, 0.2, z]}>
                  <cylinderGeometry args={[0.03, 0.03, 0.4]} />
                  <meshStandardMaterial color="#8B7355" />
                </mesh>
              ))
            )}
          </group>
        );

      case 'lamp':
        return (
          <group>
            {/* ベース */}
            <mesh position={[0, 0.05, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 0.1]} />
              <meshStandardMaterial color="#2F4F4F" />
            </mesh>
            {/* ポール */}
            <mesh position={[0, 0.75, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 1.4]} />
              <meshStandardMaterial color="#2F4F4F" />
            </mesh>
            {/* シェード */}
            <mesh position={[0, 1.3, 0]}>
              <coneGeometry args={[0.25, 0.3]} />
              <meshStandardMaterial color="#F5F5DC" />
            </mesh>
          </group>
        );

      case 'bookshelf':
        return (
          <group>
            {/* メインフレーム */}
            <mesh position={[0, 1, 0]}>
              <boxGeometry args={[0.8, 2, 0.3]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
            {/* 棚板 */}
            {[0.3, 0.9, 1.5].map((y, i) => (
              <mesh key={i} position={[0, y, 0]}>
                <boxGeometry args={[0.75, 0.03, 0.25]} />
                <meshStandardMaterial color="#DEB887" />
              </mesh>
            ))}
          </group>
        );

      default:
        return (
          <mesh>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color="#4A90E2" />
          </mesh>
        );
    }
  };

  return (
    <group
      ref={meshRef}
      position={object.position}
      rotation={object.rotation}
      scale={object.scale}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onPointerEnter={() => onHover?.(object.id)}
      onPointerLeave={() => onHover?.(null)}
    >
      {renderObject()}

      {isSelected && !isPointerLocked && (
        <TransformControls
          mode={editMode}
          onMouseDown={handleDragStart}
          onMouseUp={handleDragEnd}
          onChange={handleChange}
          showX showY showZ
          size={0.8}
          space="world"
        />
      )}
    </group>
  );
};

// RoomEnvironmentコンポーネント
export const RoomEnvironment: React.FC<RoomEnvironmentProps> = ({
  config,
  selectedObjectId,
  onObjectSelect,
  onObjectTransform,
  isPointerLocked,
  editMode,
  showGrid = false,
  gridSize = 0.5,
  onFloorClick
}) => {
  return (
    <>
      {/* 環境光 */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />

      {/* 床 */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        onClick={(e) => {
          if (onFloorClick) {
            const point = e.point;
            console.log('🏠 Floor clicked - deselecting objects only (no object creation)');
            onFloorClick([point.x, point.y + 0.5, point.z]);
          }
          onObjectSelect(null);
        }}
        receiveShadow
      >
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial
          color={config.floorMaterial === 'wood' ? '#DEB887' : '#D3D3D3'}
          roughness={0.8}
        />
      </mesh>

      {/* 壁 */}
      {/* 後ろの壁 */}
      <mesh position={[0, 2.5, -10]} castShadow receiveShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial
          color={config.wallMaterial === 'brick' ? '#B22222' : '#F5F5F5'}
          roughness={0.9}
        />
      </mesh>

      {/* 左の壁 */}
      <mesh position={[-10, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial
          color={config.wallMaterial === 'brick' ? '#B22222' : '#F5F5F5'}
          roughness={0.9}
        />
      </mesh>

      {/* 右の壁 */}
      <mesh position={[10, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial
          color={config.wallMaterial === 'brick' ? '#B22222' : '#F5F5F5'}
          roughness={0.9}
        />
      </mesh>

      {/* グリッド表示 */}
      {showGrid && <GridHelper />}

      {/* オブジェクト表示 */}
      {config.objects.map((object) => (
        <GeneratedObject
          key={object.id}
          object={object}
          isSelected={selectedObjectId === object.id}
          onSelect={() => onObjectSelect(object.id)}
          onTransform={(position, rotation, scale) =>
            onObjectTransform(object.id, position, rotation, scale)
          }
          isPointerLocked={isPointerLocked}
          editMode={editMode}
          snapToGrid={false}
          gridSize={gridSize}
        />
      ))}
    </>
  );
};

export default RoomEnvironment; 