import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Text, Sky, Stars } from '@react-three/drei';
import * as THREE from 'three';
import type { VirtualSpace } from '../types';

// 新しい高度なコンポーネントをインポート
import {
  AdvancedAvatar,
  ModernBuilding,
  AdvancedTree,
  InteractiveFountain,
  FuturisticPlatform
} from './three/AdvancedModels';
import {
  AdvancedParticleSystem,
  LightningEffect,
  AuroraEffect,
  ExplosionEffect,
  PortalEffect
} from './three/AdvancedEffects';
import { DynamicMaterial } from './three/AdvancedMaterials';
import { PlayerController } from './PlayerController';
import { VirtualJoystick } from './VirtualJoystick';
import { TouchInteraction } from './TouchInteraction';

interface AdvancedThreeSceneProps {
  space: VirtualSpace;
  onUserMove?: (position: { x: number; y: number; z: number }) => void;
}

// エラーバウンダリコンポーネント
class AdvancedThreeErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('Advanced Three.js Error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Advanced Three.js Error Details:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-900 to-blue-900 text-white">
          <div className="text-center">
            <h3 className="text-2xl mb-2">🚀 高度3Dシステムエラー</h3>
            <p className="text-sm mb-4">高度な3D機能の読み込みに失敗しました</p>
            <div className="space-x-2">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700"
              >
                再読み込み
              </button>
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
              >
                基本3Dに戻る
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// 高度なローディングコンポーネント
const AdvancedLoadingSpinner: React.FC = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900 to-blue-900 z-10">
    <div className="text-center text-white">
      <div className="relative">
        <div className="animate-spin w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <div className="animate-pulse absolute inset-0 w-16 h-16 border-4 border-blue-400 border-b-transparent rounded-full mx-auto"></div>
      </div>
      <p className="text-xl mb-2">🚀 高度3D空間を生成中...</p>
      <p className="text-sm opacity-70">最新の3D技術を読み込んでいます</p>
    </div>
  </div>
);

// Canvas設定の最適化
const AdvancedCanvasSettings = {
  shadows: true,
  dpr: [1, 2] as [number, number],
  performance: { min: 0.3 },
  gl: {
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance' as const,
    shadowMap: {
      enabled: true,
      type: THREE.PCFSoftShadowMap,
    },
  },
  shadowMap: {
    enabled: true,
    type: THREE.PCFSoftShadowMap,
  },
};

// 高度な環境システム
const AdvancedEnvironment: React.FC<{ template: VirtualSpace['template'] }> = ({ template }) => {
  const [timeOfDay, setTimeOfDay] = useState<'dawn' | 'day' | 'dusk' | 'night'>('day');
  const [weather, setWeather] = useState<'clear' | 'rain' | 'snow' | 'storm'>('clear');

  useEffect(() => {
    // 時間の変化をシミュレート
    const interval = setInterval(() => {
      const times: Array<'dawn' | 'day' | 'dusk' | 'night'> = ['dawn', 'day', 'dusk', 'night'];
      setTimeOfDay(times[Math.floor(Math.random() * times.length)]);
    }, 30000); // 30秒ごとに時間が変わる

    return () => clearInterval(interval);
  }, []);

  const getEnvironmentPreset = () => {
    switch (template.type) {
      case 'room': return 'apartment' as const;
      case 'stage': return 'studio' as const;
      case 'gallery': return 'warehouse' as const;
      case 'outdoor': return 'park' as const;
      case 'futuristic': return 'city' as const;
      default: return 'sunset' as const;
    }
  };

  const getBackgroundColor = () => {
    switch (template.type) {
      case 'room': return '#2C2C2C';
      case 'stage': return '#000000';
      case 'gallery': return '#F5F5F5';
      case 'outdoor': return timeOfDay === 'night' ? '#001122' : '#87CEEB';
      case 'futuristic': return '#0A0A0A';
      default: return '#87CEEB';
    }
  };

  return (
    <>
      {/* 環境設定 */}
      <Environment preset={getEnvironmentPreset()} />

      {/* 背景色 */}
      <color attach="background" args={[getBackgroundColor()]} />

      {/* 屋外の場合は空を追加 */}
      {template.type === 'outdoor' && (
        <>
          <Sky
            distance={450000}
            sunPosition={timeOfDay === 'night' ? [0, -1, 0] : [100, 20, 100]}
            inclination={timeOfDay === 'night' ? 0.6 : 0.49}
            azimuth={0.25}
          />
          {timeOfDay === 'night' && <Stars radius={300} depth={60} count={20000} factor={7} />}
        </>
      )}

      {/* 未来的な空間の場合は星空を追加 */}
      {template.type === 'futuristic' && (
        <Stars radius={300} depth={60} count={15000} factor={4} />
      )}

      {/* 天候エフェクト */}
      {template.type === 'outdoor' && weather === 'rain' && (
        <AdvancedParticleSystem
          count={1000}
          type="rain"
          position={[0, 15, 0]}
          size={0.5}
          speed={2}
        />
      )}

      {template.type === 'outdoor' && weather === 'snow' && (
        <AdvancedParticleSystem
          count={800}
          type="snow"
          position={[0, 15, 0]}
          size={0.8}
          speed={0.5}
        />
      )}

      {/* 高度な床システム */}
      <AdvancedFloor template={template} timeOfDay={timeOfDay} />

      {/* 空間タイプ別の高度な装飾 */}
      <AdvancedDecorations template={template} timeOfDay={timeOfDay} />
    </>
  );
};

// 高度な床システム
const AdvancedFloor: React.FC<{
  template: VirtualSpace['template'];
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night';
}> = ({ template, timeOfDay }) => {
  const floorRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (floorRef.current && template.type === 'futuristic') {
      // 未来的な床の発光エフェクト
      const material = floorRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.2 + Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  const getFloorMaterial = () => {
    switch (template.type) {
      case 'room':
        return <DynamicMaterial type="wood" />;
      case 'stage':
        return <DynamicMaterial type="metal" color="#2C2C2C" />;
      case 'gallery':
        return <DynamicMaterial type="marble" />;
      case 'outdoor':
        return <DynamicMaterial type="grass" />;
      case 'futuristic':
        return <DynamicMaterial type="neon" color="#4169E1" emissiveIntensity={0.3} />;
      default:
        return <DynamicMaterial type="marble" />;
    }
  };

  return (
    <mesh
      ref={floorRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.5, 0]}
      receiveShadow
    >
      <planeGeometry args={[100, 100, 32, 32]} />
      {getFloorMaterial()}
    </mesh>
  );
};

// 高度な装飾システム
const AdvancedDecorations: React.FC<{
  template: VirtualSpace['template'];
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night';
}> = ({ template, timeOfDay }) => {
  switch (template.type) {
    case 'stage':
      return (
        <>
          {/* メインステージ */}
          <mesh position={[0, -0.3, -5]} castShadow>
            <boxGeometry args={[8, 0.4, 6]} />
            <DynamicMaterial type="wood" color="#8B4513" />
          </mesh>

          {/* スポットライト */}
          <spotLight
            position={[0, 15, 0]}
            angle={0.4}
            penumbra={1}
            intensity={2}
            castShadow
            color="#FFFFFF"
          />

          {/* ステージライト */}
          {Array.from({ length: 6 }, (_, i) => (
            <spotLight
              key={i}
              position={[
                Math.sin((i / 6) * Math.PI * 2) * 8,
                10,
                Math.cos((i / 6) * Math.PI * 2) * 8 - 5
              ]}
              angle={0.3}
              penumbra={0.5}
              intensity={1}
              color={`hsl(${(i * 60) % 360}, 100%, 50%)`}
              target-position={[0, 0, -5]}
            />
          ))}

          {/* 煙エフェクト */}
          <AdvancedParticleSystem
            count={200}
            type="smoke"
            position={[0, 0, -5]}
            size={2}
            speed={0.3}
          />
        </>
      );

    case 'gallery':
      return (
        <>
          {/* ギャラリーの壁 */}
          {Array.from({ length: 4 }, (_, i) => (
            <mesh
              key={i}
              position={[
                i < 2 ? (i === 0 ? -15 : 15) : 0,
                3,
                i >= 2 ? (i === 2 ? -15 : 15) : 0
              ]}
              rotation={[0, i >= 2 ? 0 : Math.PI / 2, 0]}
              castShadow
            >
              <boxGeometry args={[30, 6, 0.5]} />
              <DynamicMaterial type="marble" color="#FFFFFF" />
            </mesh>
          ))}

          {/* アート作品 */}
          {Array.from({ length: 8 }, (_, i) => (
            <mesh
              key={i}
              position={[
                Math.sin((i / 8) * Math.PI * 2) * 12,
                2,
                Math.cos((i / 8) * Math.PI * 2) * 12
              ]}
              rotation={[0, -(i / 8) * Math.PI * 2, 0]}
            >
              <boxGeometry args={[2, 3, 0.1]} />
              <DynamicMaterial
                type="glow"
                color={`hsl(${(i * 45) % 360}, 70%, 60%)`}
                emissiveIntensity={0.5}
              />
            </mesh>
          ))}

          {/* ギャラリーライト */}
          {Array.from({ length: 8 }, (_, i) => (
            <spotLight
              key={i}
              position={[
                Math.sin((i / 8) * Math.PI * 2) * 10,
                8,
                Math.cos((i / 8) * Math.PI * 2) * 10
              ]}
              angle={0.2}
              penumbra={0.5}
              intensity={1}
              color="#FFFFFF"
              target-position={[
                Math.sin((i / 8) * Math.PI * 2) * 12,
                2,
                Math.cos((i / 8) * Math.PI * 2) * 12
              ]}
            />
          ))}
        </>
      );

    case 'outdoor':
      return (
        <>
          {/* 高度な木々 */}
          {Array.from({ length: 12 }, (_, i) => (
            <AdvancedTree
              key={i}
              position={[
                (Math.random() - 0.5) * 80,
                0,
                (Math.random() - 0.5) * 80
              ]}
              scale={0.8 + Math.random() * 0.4}
              season={timeOfDay === 'night' ? 'winter' : 'summer'}
            />
          ))}

          {/* インタラクティブな噴水 */}
          <InteractiveFountain position={[0, 0, 0]} isActive={true} />

          {/* 花畑 */}
          {Array.from({ length: 50 }, (_, i) => (
            <mesh
              key={i}
              position={[
                (Math.random() - 0.5) * 60,
                0.2,
                (Math.random() - 0.5) * 60
              ]}
              scale={0.5 + Math.random() * 0.5}
            >
              <sphereGeometry args={[0.1, 8, 8]} />
              <DynamicMaterial
                type="glow"
                color={`hsl(${Math.random() * 360}, 80%, 70%)`}
                emissiveIntensity={0.3}
              />
            </mesh>
          ))}

          {/* 蝶々のエフェクト */}
          <AdvancedParticleSystem
            count={30}
            type="sparkles"
            position={[0, 2, 0]}
            size={0.3}
            speed={0.5}
            color="#FFD700"
          />

          {timeOfDay === 'night' && (
            <AuroraEffect position={[0, 20, -30]} scale={2} />
          )}
        </>
      );

    case 'futuristic':
      return (
        <>
          {/* 未来的な建物 */}
          {Array.from({ length: 8 }, (_, i) => (
            <ModernBuilding
              key={i}
              position={[
                (i - 3.5) * 12,
                0,
                -20 + (i % 2) * 15
              ]}
              height={8 + Math.random() * 8}
              width={3 + Math.random() * 2}
              depth={3 + Math.random() * 2}
            />
          ))}

          {/* 未来的なプラットフォーム */}
          {Array.from({ length: 5 }, (_, i) => (
            <FuturisticPlatform
              key={i}
              position={[
                (i - 2) * 8,
                0,
                10
              ]}
              size={2 + i * 0.3}
              isActive={true}
            />
          ))}

          {/* ポータル */}
          <PortalEffect position={[0, 3, -15]} size={4} isActive={true} />

          {/* エネルギーエフェクト */}
          <AdvancedParticleSystem
            count={500}
            type="energy"
            position={[0, 5, 0]}
            size={1}
            speed={1}
            color="#00FFFF"
          />

          {/* 雷エフェクト */}
          <LightningEffect
            position={[0, 15, 0]}
            target={[0, 0, 0]}
            isActive={Math.random() > 0.8}
          />
        </>
      );

    case 'room':
    default:
      return (
        <>
          {/* 暖炉 */}
          <mesh position={[0, 1, -8]} castShadow>
            <boxGeometry args={[3, 2, 1]} />
            <DynamicMaterial type="wood" color="#8B4513" />
          </mesh>

          {/* 火のエフェクト */}
          <AdvancedParticleSystem
            count={100}
            type="fire"
            position={[0, 1, -7.5]}
            size={0.5}
            speed={1}
          />

          {/* ソファ */}
          <mesh position={[0, 0.5, 2]} castShadow>
            <boxGeometry args={[4, 1, 2]} />
            <DynamicMaterial type="fabric" color="#8B0000" />
          </mesh>

          {/* 本棚 */}
          {Array.from({ length: 2 }, (_, i) => (
            <mesh
              key={i}
              position={[i === 0 ? -6 : 6, 2, -6]}
              castShadow
            >
              <boxGeometry args={[1, 4, 3]} />
              <DynamicMaterial type="wood" />
            </mesh>
          ))}

          {/* 観葉植物 */}
          {Array.from({ length: 4 }, (_, i) => (
            <AdvancedTree
              key={i}
              position={[
                (i - 1.5) * 4,
                0,
                6
              ]}
              scale={0.3}
              season="spring"
            />
          ))}

          {/* 暖かい照明 */}
          <pointLight
            position={[0, 4, 0]}
            intensity={1}
            color="#FFE4B5"
            castShadow
          />
        </>
      );
  }
};

export const AdvancedThreeScene: React.FC<AdvancedThreeSceneProps> = ({ space, onUserMove }) => {
  const [playerPosition, setPlayerPosition] = useState<[number, number, number]>([0, 0, 8]);
  const [playerRotation, setPlayerRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [isPlayerMoving, setIsPlayerMoving] = useState(false);

  const [otherUsers] = useState([
    {
      id: '2',
      name: 'ユーザー2',
      position: [3, 0, 5] as [number, number, number],
      color: '#4ECDC4',
      isMoving: false,
      emotion: 'happy' as const
    },
    {
      id: '3',
      name: 'ユーザー3',
      position: [-3, 0, 6] as [number, number, number],
      color: '#45B7D1',
      isMoving: true,
      emotion: 'neutral' as const
    },
  ]);

  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [explosionActive, setExplosionActive] = useState(false);
  const [viewMode, setViewMode] = useState<'first-person' | 'third-person'>('first-person');
  const [lastPosition, setLastPosition] = useState<[number, number, number]>([0, 0, 8]);
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

    // 特別なエフェクトを追加
    if (type === 'magic') {
      setExplosionActive(true);
    }

    alert(`${title}をクリックしました！高度な3D機能が動作中です！`);
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
    console.log('Advanced object touched:', object, 'at position:', position);
  };

  return (
    <AdvancedThreeErrorBoundary>
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

        <Suspense fallback={<AdvancedLoadingSpinner />}>
          <Canvas
            {...AdvancedCanvasSettings}
            camera={{
              position: [0, 8, 15],
              fov: viewMode === 'first-person' ? 75 : 60
            }}
            style={{ pointerEvents: 'auto' }}
            onCreated={(state) => {
              console.log('🚀 Advanced Canvas created successfully:', state);
            }}
            onError={(error) => {
              console.error('❌ Advanced Canvas error:', error);
            }}
          >
            {/* 高度なライティング */}
            <ambientLight intensity={0.3} />
            <directionalLight
              position={[20, 20, 10]}
              intensity={1.5}
              castShadow
              shadow-mapSize-width={4096}
              shadow-mapSize-height={4096}
              shadow-camera-far={100}
              shadow-camera-left={-50}
              shadow-camera-right={50}
              shadow-camera-top={50}
              shadow-camera-bottom={-50}
            />

            {/* プレイヤーコントローラー */}
            <PlayerController
              position={playerPosition}
              onMove={handlePlayerMove}
              onRotate={handlePlayerRotate}
              speed={8}
              jumpHeight={12}
              viewMode={viewMode}
              virtualMoveInput={virtualMoveInput}
              virtualLookInput={virtualLookInput}
            />

            {/* タッチインタラクション */}
            {isMobile && (
              <TouchInteraction onObjectTouch={handleObjectTouch} />
            )}

            {/* 高度な環境 */}
            <AdvancedEnvironment template={space.template} />

            {/* プレイヤーアバター（3人称視点の場合のみ表示） */}
            {viewMode === 'third-person' && (
              <AdvancedAvatar
                position={playerPosition}
                color="#FF6B6B"
                name="あなた"
                isMoving={isPlayerMoving}
                emotion="excited"
              />
            )}

            {/* 高度なアバター */}
            {otherUsers.map((user) => (
              <AdvancedAvatar
                key={user.id}
                position={user.position}
                color={user.color}
                name={user.name}
                isMoving={user.isMoving}
                emotion={user.emotion}
              />
            ))}

            {/* 空間タイトル（3D文字） */}
            <Text
              position={[0, 8, -8]}
              fontSize={2}
              color="#FFFFFF"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.1}
              outlineColor="#000000"
            >
              {space.title}
            </Text>

            {/* 爆発エフェクト */}
            <ExplosionEffect
              position={[0, 2, 0]}
              isActive={explosionActive}
              onComplete={() => setExplosionActive(false)}
            />

            {/* OrbitControlsは3人称視点かつデスクトップでのみ有効 */}
            {viewMode === 'third-person' && !isMobile && (
              <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                minDistance={5}
                maxDistance={50}
                maxPolarAngle={Math.PI / 2.2}
                enableDamping={true}
                dampingFactor={0.05}
              />
            )}
          </Canvas>
        </Suspense>
      </div>
    </AdvancedThreeErrorBoundary>
  );
};