import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import { GLBLoader } from './GLBLoader';
import { isMobile } from '../../utils/deviceDetection';

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

interface RoomEnvironmentProps {
  config: RoomConfig;
  selectedObjectId: string | null;
  onObjectSelect?: (objectId: string | null) => void;
  onObjectTransform?: (
    id: string,
    position: [number, number, number],
    rotation: [number, number, number],
    scale: [number, number, number]
  ) => void;
  isPointerLocked: boolean;
  editMode?: 'translate' | 'rotate' | 'scale';
  showGrid?: boolean;
}

interface GeneratedObjectProps {
  object: {
    id: string;
    type: string;
    name: string;
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
    modelUrl?: string;
    generated?: boolean;
  };
  isSelected: boolean;
  onSelect?: (objectId: string | null) => void;
  onTransform?: (
    id: string,
    position: [number, number, number],
    rotation: [number, number, number],
    scale: [number, number, number]
  ) => void;
  isPointerLocked: boolean;
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

// 個別オブジェクトコンポーネント
const GeneratedObject: React.FC<GeneratedObjectProps> = ({
  object,
  isSelected,
  onSelect,
  onTransform,
  isPointerLocked
}) => {
  const meshRef = useRef<THREE.Group>(null);

  // オブジェクトがクリックされた時の処理
  const handleClick = (e: any) => {
    e.stopPropagation();
    if (!isPointerLocked && onSelect) {
      onSelect(object.id);
    }
  };

  // Transform更新時の処理
  useFrame(() => {
    if (meshRef.current && onTransform) {
      const mesh = meshRef.current;
      const currentPos: [number, number, number] = [mesh.position.x, mesh.position.y, mesh.position.z];
      const currentRot: [number, number, number] = [mesh.rotation.x, mesh.rotation.y, mesh.rotation.z];
      const currentScale: [number, number, number] = [mesh.scale.x, mesh.scale.y, mesh.scale.z];

      // 位置・回転・スケールが変わった場合のみ更新
      if (
        Math.abs(currentPos[0] - object.position[0]) > 0.001 ||
        Math.abs(currentPos[1] - object.position[1]) > 0.001 ||
        Math.abs(currentPos[2] - object.position[2]) > 0.001 ||
        Math.abs(currentRot[0] - object.rotation[0]) > 0.001 ||
        Math.abs(currentRot[1] - object.rotation[1]) > 0.001 ||
        Math.abs(currentRot[2] - object.rotation[2]) > 0.001 ||
        Math.abs(currentScale[0] - object.scale[0]) > 0.001 ||
        Math.abs(currentScale[1] - object.scale[1]) > 0.001 ||
        Math.abs(currentScale[2] - object.scale[2]) > 0.001
      ) {
        onTransform(object.id, currentPos, currentRot, currentScale);
      }
    }
  });

  return (
    <group
      ref={meshRef}
      position={object.position}
      rotation={object.rotation}
      scale={object.scale}
      onClick={handleClick}
    >
      {/* オブジェクトの描画 */}
      {object.modelUrl ? (
        <GLBLoader url={object.modelUrl} />
      ) : (
        // デフォルトキューブ
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshLambertMaterial
            color={isSelected ? '#4F46E5' : object.generated ? '#10B981' : '#6B7280'}
          />
        </mesh>
      )}

      {/* 選択インジケーター */}
      {isSelected && (
        <mesh position={[0, 0.6, 0]}>
          <sphereGeometry args={[0.05]} />
          <meshBasicMaterial color="#4F46E5" />
        </mesh>
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
  editMode = 'translate',
  showGrid = false
}) => {
  const transformControlsRef = useRef<any>(null);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const selectedObjectRef = useRef<THREE.Group>(null);

  // デバイス検出
  useEffect(() => {
    setIsMobileDevice(isMobile());
  }, []);

  // 選択されたオブジェクトのrefを更新
  useEffect(() => {
    if (transformControlsRef.current && selectedObjectRef.current) {
      transformControlsRef.current.attach(selectedObjectRef.current);
    }
  }, [selectedObjectId]);

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
          e.stopPropagation();
          if (!isPointerLocked) {
            onObjectSelect?.(null);
          }
        }}
        receiveShadow
      >
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial
          color={config.floorMaterial === 'wood' ? '#DEB887' : '#D3D3D3'}
          roughness={0.8}
          metalness={0.1}
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
          onSelect={onObjectSelect}
          onTransform={onObjectTransform}
          isPointerLocked={isPointerLocked}
        />
      ))}

      {/* Transform Controls - モバイル対応 */}
      {selectedObjectId && (
        <TransformControls
          ref={transformControlsRef}
          mode={editMode}
          enabled={!isPointerLocked}
          showX={true}
          showY={true}
          showZ={true}
          // モバイル用の設定
          size={isMobileDevice ? 1.2 : 1.0}
          space="world"
          // タッチデバイスではスナップを有効化
          rotationSnap={isMobileDevice ? Math.PI / 8 : undefined}
          translationSnap={isMobileDevice ? 0.5 : undefined}
          scaleSnap={isMobileDevice ? 0.1 : undefined}
          onChange={(e: any) => {
            if (e && e.target && e.target.object) {
              const target = e.target.object;
              const selectedObject = config.objects.find(obj => obj.id === selectedObjectId);

              if (selectedObject && onObjectTransform) {
                onObjectTransform(
                  selectedObjectId,
                  [target.position.x, target.position.y, target.position.z],
                  [target.rotation.x, target.rotation.y, target.rotation.z],
                  [target.scale.x, target.scale.y, target.scale.z]
                );
              }
            }
          }}
        />
      )}
    </>
  );
};

export default RoomEnvironment; 