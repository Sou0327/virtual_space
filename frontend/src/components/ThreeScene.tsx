import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Text, Box, Sphere, Plane } from '@react-three/drei';
import * as THREE from 'three';
import type { VirtualSpace } from '../types';
import { InteractiveObject } from './InteractiveObject';
import { ParticleSystem } from './ParticleSystem';
import { PlayerController } from './PlayerController';
import { VirtualJoystick } from './VirtualJoystick';
import { TouchInteraction } from './TouchInteraction';

interface ThreeSceneProps {
  space: VirtualSpace;
  onUserMove?: (position: { x: number; y: number; z: number }) => void;
}

// アバターコンポーネント
const Avatar: React.FC<{
  position: [number, number, number];
  rotation?: [number, number, number];
  color: string;
  name: string;
  isPlayer?: boolean;
  isMoving?: boolean;
}> = ({
  position,
  rotation = [0, 0, 0],
  color,
  name,
  isPlayer = false,
  isMoving = false
}) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
      if (meshRef.current && !isPlayer) {
        meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.1;
      }

      if (groupRef.current && isPlayer) {
        // プレイヤーの回転を適用
        groupRef.current.rotation.set(...rotation);
      }

      // 歩行アニメーション
      if (isMoving && groupRef.current) {
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 8) * 0.05;
      }
    });

    return (
      <group ref={groupRef} position={position}>
        <Sphere ref={meshRef} args={[0.3, 16, 16]} position={[0, 1, 0]} castShadow>
          <meshStandardMaterial color={color} />
        </Sphere>
        <Box args={[0.4, 1.2, 0.2]} position={[0, 0, 0]} castShadow>
          <meshStandardMaterial color={color} />
        </Box>
        <Text
          position={[0, 2, 0]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {name}
        </Text>
      </group>
    );
  };

// 空間のテンプレートに応じた環境を作成
const SpaceEnvironment: React.FC<{ template: VirtualSpace['template'] }> = ({ template }) => {
  const getEnvironmentProps = () => {
    switch (template.type) {
      case 'room':
        return { preset: 'apartment' as const };
      case 'stage':
        return { preset: 'studio' as const };
      case 'gallery':
        return { preset: 'warehouse' as const };
      case 'outdoor':
        return { preset: 'park' as const };
      case 'futuristic':
        return { preset: 'city' as const };
      default:
        return { preset: 'sunset' as const };
    }
  };

  const getFloorColor = () => {
    switch (template.type) {
      case 'room': return '#8B4513';
      case 'stage': return '#2C2C2C';
      case 'gallery': return '#F5F5F5';
      case 'outdoor': return '#228B22';
      case 'futuristic': return '#4169E1';
      default: return '#808080';
    }
  };

  return (
    <>
      <Environment {...getEnvironmentProps()} />

      {/* 床 */}
      <Plane
        args={[40, 40]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.5, 0]}
        receiveShadow
      >
        <meshStandardMaterial color={getFloorColor()} />
      </Plane>

      {/* 空間タイプに応じた装飾 */}
      {template.type === 'stage' && (
        <>
          {/* ステージ */}
          <Box args={[6, 0.2, 4]} position={[0, -0.4, -3]} castShadow>
            <meshStandardMaterial color="#8B4513" />
          </Box>
          {/* スポットライト */}
          <spotLight
            position={[0, 10, 0]}
            angle={0.3}
            penumbra={1}
            intensity={1}
            castShadow
            target-position={[0, 0, -3]}
          />
        </>
      )}

      {template.type === 'gallery' && (
        <>
          {/* 壁 */}
          <Box args={[0.2, 4, 20]} position={[-10, 1.5, 0]} castShadow>
            <meshStandardMaterial color="#FFFFFF" />
          </Box>
          <Box args={[0.2, 4, 20]} position={[10, 1.5, 0]} castShadow>
            <meshStandardMaterial color="#FFFFFF" />
          </Box>
          <Box args={[20, 4, 0.2]} position={[0, 1.5, -10]} castShadow>
            <meshStandardMaterial color="#FFFFFF" />
          </Box>
        </>
      )}

      {template.type === 'outdoor' && (
        <>
          {/* 木々 */}
          {Array.from({ length: 8 }, (_, i) => (
            <group key={i} position={[Math.random() * 30 - 15, 0, Math.random() * 30 - 15]}>
              <Box args={[0.3, 2, 0.3]} position={[0, 1, 0]} castShadow>
                <meshStandardMaterial color="#8B4513" />
              </Box>
              <Sphere args={[1, 8, 8]} position={[0, 3, 0]} castShadow>
                <meshStandardMaterial color="#228B22" />
              </Sphere>
            </group>
          ))}
        </>
      )}

      {template.type === 'futuristic' && (
        <>
          {/* 未来的な構造物 */}
          {Array.from({ length: 5 }, (_, i) => (
            <Box
              key={i}
              args={[1, 4, 1]}
              position={[i * 4 - 8, 2, -8]}
              castShadow
            >
              <meshStandardMaterial
                color="#4169E1"
                emissive="#0000FF"
                emissiveIntensity={0.2}
              />
            </Box>
          ))}
        </>
      )}
    </>
  );
};

export const ThreeScene: React.FC<ThreeSceneProps> = ({ space, onUserMove }) => {
  const [playerPosition, setPlayerPosition] = useState<[number, number, number]>([0, 0, 5]);
  const [playerRotation, setPlayerRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [isPlayerMoving, setIsPlayerMoving] = useState(false);

  const [otherUsers] = useState([
    { id: '2', name: 'ユーザー2', position: [2, 0, 3] as [number, number, number], color: '#4ECDC4' },
    { id: '3', name: 'ユーザー3', position: [-2, 0, 4] as [number, number, number], color: '#45B7D1' },
  ]);

  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'first-person' | 'third-person'>('first-person'); // デフォルトを1人称に
  const [lastPosition, setLastPosition] = useState<[number, number, number]>([0, 0, 5]);
  const [isMobile, setIsMobile] = useState(false);

  // バーチャルジョイスティックの入力
  const [virtualMoveInput, setVirtualMoveInput] = useState({ x: 0, y: 0 });
  const [virtualLookInput, setVirtualLookInput] = useState({ x: 0, y: 0 });

  // モバイル検出
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      const isMobileDevice = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsMobile(isMobileDevice || isTouchDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleObjectClick = (type: string, title: string) => {
    setSelectedObject(`${type}: ${title}`);
    alert(`${title}をクリックしました！`);
  };

  const handlePlayerMove = (newPosition: [number, number, number]) => {
    // 移動しているかどうかを判定
    const moved = Math.abs(newPosition[0] - lastPosition[0]) > 0.01 ||
      Math.abs(newPosition[2] - lastPosition[2]) > 0.01;
    setIsPlayerMoving(moved);

    setPlayerPosition(newPosition);
    setLastPosition(newPosition);

    if (onUserMove) {
      onUserMove({
        x: newPosition[0],
        y: newPosition[1],
        z: newPosition[2]
      });
    }
  };

  const handlePlayerRotate = (newRotation: [number, number, number]) => {
    setPlayerRotation(newRotation);
  };

  const handleObjectTouch = (object: any, position: { x: number; y: number }) => {
    console.log('Object touched:', object, 'at position:', position);
  };

  return (
    <div className="w-full h-full relative">
      {/* 視点切り替えUI（デスクトップのみ） */}
      {!isMobile && (
        <div className="absolute top-4 right-4 z-50 space-x-2">
          <button
            onClick={() => setViewMode(viewMode === 'first-person' ? 'third-person' : 'first-person')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === 'first-person'
              ? 'bg-orange-500 text-white hover:bg-orange-600'
              : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
          >
            {viewMode === 'first-person' ? '👁️ 1人称視点' : '🎮 3人称視点'}
          </button>
        </div>
      )}

      {/* 操作説明UI */}
      <div className="absolute bottom-4 left-4 z-50 bg-black bg-opacity-70 text-white p-3 rounded-lg text-sm pointer-events-none">
        <div className="space-y-1">
          <div className="text-yellow-300 font-semibold">🎮 操作方法:</div>
          {isMobile ? (
            <>
              <div>🕹️ 左ジョイスティック: 移動</div>
              <div>🎯 右ジョイスティック: 視点</div>
              <div>🚀 黄色ボタン: ジャンプ</div>
              <div>👆 タッチ: オブジェクト詳細</div>
            </>
          ) : (
            <>
              <div>🔤 WASD: 移動</div>
              <div>🚀 Space: ジャンプ</div>
              <div>⚡ Shift: 走る</div>
              <div>🖱️ マウス: 視点回転</div>
              <div>👁️ 右上ボタン: 視点切り替え</div>
            </>
          )}
          {isPlayerMoving && (
            <div className="text-green-300">🏃 移動中...</div>
          )}
        </div>
      </div>

      {/* モバイル用バーチャルジョイスティック */}
      {isMobile && (
        <VirtualJoystick
          onMove={(x, y) => setVirtualMoveInput({ x, y })}
          onLook={(x, y) => setVirtualLookInput({ x, y })}
          size={120}
          deadZone={0.1}
        />
      )}

      <Canvas
        shadows
        camera={{
          position: [0, 8, 15],
          fov: viewMode === 'first-person' ? 75 : 60
        }}
        gl={{ antialias: true }}
        style={{ pointerEvents: 'auto' }}
      >
        {/* 基本ライティング */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-25}
          shadow-camera-right={25}
          shadow-camera-top={25}
          shadow-camera-bottom={-25}
        />

        {/* プレイヤーコントローラー */}
        <PlayerController
          position={playerPosition}
          onMove={handlePlayerMove}
          onRotate={handlePlayerRotate}
          speed={5}
          jumpHeight={8}
          viewMode={viewMode}
          virtualMoveInput={virtualMoveInput}
          virtualLookInput={virtualLookInput}
        />

        {/* タッチインタラクション */}
        {isMobile && (
          <TouchInteraction onObjectTouch={handleObjectTouch} />
        )}

        {/* 空間環境 */}
        <SpaceEnvironment template={space.template} />

        {/* パーティクルエフェクト */}
        {space.template.type === 'outdoor' && (
          <ParticleSystem count={500} type="sparkles" />
        )}
        {space.template.type === 'futuristic' && (
          <ParticleSystem count={800} type="stars" />
        )}
        {space.template.type === 'stage' && (
          <ParticleSystem count={300} type="sparkles" />
        )}
        {space.template.type === 'room' && (
          <ParticleSystem count={200} type="bubbles" />
        )}

        {/* プレイヤーアバター（3人称視点の場合のみ表示） */}
        {viewMode === 'third-person' && (
          <Avatar
            position={playerPosition}
            rotation={playerRotation}
            color="#FF6B6B"
            name="あなた"
            isPlayer={true}
            isMoving={isPlayerMoving}
          />
        )}

        {/* 他のユーザーアバター */}
        {otherUsers.map((user) => (
          <Avatar
            key={user.id}
            position={user.position}
            color={user.color}
            name={user.name}
          />
        ))}

        {/* 空間タイトル */}
        <Text
          position={[0, 6, -5]}
          fontSize={1}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {space.title}
        </Text>

        {/* インタラクティブオブジェクト */}
        <InteractiveObject
          position={[3, 1, -2]}
          type="info"
          title="インフォメーション"
          description="このスペースの詳細情報を確認できます"
          onClick={() => handleObjectClick('info', 'インフォメーション')}
        />

        <InteractiveObject
          position={[-3, 1, -2]}
          type="media"
          title="メディアギャラリー"
          description="写真や動画を閲覧できます"
          onClick={() => handleObjectClick('media', 'メディアギャラリー')}
        />

        <InteractiveObject
          position={[0, 1, -6]}
          type="shop"
          title="ショップ"
          description="限定グッズを購入できます"
          onClick={() => handleObjectClick('shop', 'ショップ')}
        />

        <InteractiveObject
          position={[5, 1, 2]}
          type="social"
          title="ファンコミュニティ"
          description="他のファンと交流できます"
          onClick={() => handleObjectClick('social', 'ファンコミュニティ')}
        />

        {/* OrbitControlsは3人称視点かつデスクトップでのみ有効 */}
        {viewMode === 'third-person' && !isMobile && (
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={3}
            maxDistance={20}
            maxPolarAngle={Math.PI / 2}
          />
        )}
      </Canvas>
    </div>
  );
}; 