import React, { useState, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { VirtualSpace } from '../types';
import { AIEnvironmentGenerator } from './three/AIEnvironmentGenerator';
import { PlayerController } from './PlayerController';
import { VirtualJoystick } from './VirtualJoystick';
import { TouchInteraction } from './TouchInteraction';

interface FantasySceneProps {
  space: VirtualSpace;
  onUserMove?: (position: { x: number; y: number; z: number }) => void;
}

// ファンタジーエラーバウンダリ
class FantasyErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('Fantasy Scene Error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Fantasy Scene Error Details:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
          <div className="text-center p-6 bg-black bg-opacity-50 rounded-lg backdrop-blur-sm">
            <h3 className="text-2xl mb-4">🧙‍♂️ 魔法的なエラーが発生しました</h3>
            <p className="text-sm mb-6 opacity-80">ファンタジー空間の生成に失敗しました</p>
            <div className="space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
              >
                🔮 魔法を再詠唱
              </button>
              <button
                onClick={() => window.history.back()}
                className="px-6 py-3 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                🏰 通常の空間に戻る
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ファンタジーローディング
const FantasyLoadingSpinner: React.FC = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 z-10">
    <div className="text-center text-white">
      <div className="relative mb-6">
        {/* 魔法陣エフェクト */}
        <div className="animate-spin w-24 h-24 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
        <div className="animate-spin w-20 h-20 border-4 border-blue-400 border-b-transparent rounded-full absolute top-2 left-1/2 transform -translate-x-1/2"></div>
        <div className="animate-pulse w-16 h-16 bg-yellow-400 bg-opacity-30 rounded-full absolute top-4 left-1/2 transform -translate-x-1/2"></div>

        {/* 魔法の星 */}
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-pulse"
            style={{
              left: `${50 + Math.cos((i / 8) * Math.PI * 2) * 30}%`,
              top: `${50 + Math.sin((i / 8) * Math.PI * 2) * 30}%`,
              animationDelay: `${i * 0.2}s`
            }}
          />
        ))}
      </div>

      <h2 className="text-2xl mb-2 font-bold">🧙‍♂️ 魔法を詠唱中...</h2>
      <p className="text-lg mb-2">ファンタジー空間を生成しています</p>
      <p className="text-sm opacity-70">古の魔法が現実を書き換えています</p>
    </div>
  </div>
);

export const FantasyScene: React.FC<FantasySceneProps> = ({ space, onUserMove }) => {
  const [playerPosition, setPlayerPosition] = useState<[number, number, number]>([0, 1, 8]);
  const [playerRotation, setPlayerRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [isPlayerMoving, setIsPlayerMoving] = useState(false);
  const [viewMode, setViewMode] = useState<'first-person' | 'third-person'>('first-person');
  const [isMobile, setIsMobile] = useState(false);

  // AI環境設定
  const [environmentConfig, setEnvironmentConfig] = useState({
    description: space.description || "神秘的な魔法学校。高い塔と古い図書館、魔法の光が漂う幻想的な空間",
    mood: 'mystical' as const,
    timeOfDay: 'dusk' as const,
    weather: 'magical' as const,
    scale: 'vast' as const
  });

  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [customDescription, setCustomDescription] = useState(environmentConfig.description);

  // バーチャルジョイスティックの入力
  const [virtualMoveInput, setVirtualMoveInput] = useState({ x: 0, y: 0 });
  const [virtualLookInput, setVirtualLookInput] = useState({ x: 0, y: 0 });
  const [lastPosition, setLastPosition] = useState<[number, number, number]>([0, 1, 8]);

  // モバイル検出
  React.useEffect(() => {
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

  const handlePlayerMove = (newPosition: [number, number, number]) => {
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
    console.log('Fantasy object touched:', object, 'at position:', position);
  };

  const generateNewEnvironment = () => {
    setEnvironmentConfig(prev => ({
      ...prev,
      description: customDescription
    }));
    setShowConfigPanel(false);
  };

  const getPresetDescriptions = () => [
    "古い魔法学校の大広間。高いアーチ天井、石の柱、松明の温かい光が踊る神秘的な空間",
    "星空の下の空中庭園。浮遊する島々、魔法の橋、水晶の花が咲く幻想的な楽園",
    "深い森の中の魔法図書館。巨大な古木に建てられた螺旋の塔、光る本が宙に舞う",
    "氷の宮殿の大広間。透明な氷の柱、オーロラの光、雪の結晶が舞う冷たく美しい空間",
    "地下の魔法実験室。光る薬瓶、古い錬金術の装置、紫の魔法の煙が立ち上る",
    "雲の上の天空城。白い大理石の宮殿、天使の像、虹色の光が差し込む神聖な場所"
  ];

  return (
    <FantasyErrorBoundary>
      <div className="w-full h-full relative">
        {/* ファンタジー空間設定パネル */}
        <div className="absolute top-4 left-4 z-50">
          <button
            onClick={() => setShowConfigPanel(!showConfigPanel)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors backdrop-blur-sm bg-opacity-80 border border-purple-400"
          >
            🧙‍♂️ 魔法詠唱
          </button>

          {showConfigPanel && (
            <div className="absolute top-12 left-0 w-96 bg-black bg-opacity-90 backdrop-blur-md rounded-lg p-6 text-white border border-purple-500">
              <h3 className="text-lg font-bold mb-4 text-purple-300">🔮 ファンタジー空間の詠唱</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-purple-200">
                  魔法の言葉（空間の説明）:
                </label>
                <textarea
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  className="w-full h-20 p-3 bg-purple-900 bg-opacity-50 border border-purple-400 rounded-lg text-white placeholder-purple-300 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="あなたの理想的なファンタジー空間を文章で描写してください..."
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-purple-200">
                  魔法のテンプレート:
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                  {getPresetDescriptions().map((desc, index) => (
                    <button
                      key={index}
                      onClick={() => setCustomDescription(desc)}
                      className="text-left p-2 text-xs bg-purple-800 bg-opacity-50 hover:bg-purple-700 rounded border border-purple-400 transition-colors"
                    >
                      {desc.substring(0, 60)}...
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium mb-1 text-purple-200">雰囲気:</label>
                  <select
                    value={environmentConfig.mood}
                    onChange={(e) => setEnvironmentConfig(prev => ({ ...prev, mood: e.target.value as any }))}
                    className="w-full p-2 bg-purple-900 bg-opacity-50 border border-purple-400 rounded text-white text-sm"
                  >
                    <option value="mystical">神秘的</option>
                    <option value="dark">ダーク</option>
                    <option value="bright">明るい</option>
                    <option value="ethereal">幽玄</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1 text-purple-200">時間帯:</label>
                  <select
                    value={environmentConfig.timeOfDay}
                    onChange={(e) => setEnvironmentConfig(prev => ({ ...prev, timeOfDay: e.target.value as any }))}
                    className="w-full p-2 bg-purple-900 bg-opacity-50 border border-purple-400 rounded text-white text-sm"
                  >
                    <option value="dawn">夜明け</option>
                    <option value="day">昼</option>
                    <option value="dusk">夕暮れ</option>
                    <option value="night">夜</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={generateNewEnvironment}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium"
                >
                  ✨ 魔法を発動
                </button>
                <button
                  onClick={() => setShowConfigPanel(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  閉じる
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 視点切り替えUI（デスクトップのみ） */}
        {!isMobile && (
          <div className="absolute top-4 right-4 z-50">
            <button
              onClick={() => setViewMode(viewMode === 'first-person' ? 'third-person' : 'first-person')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors backdrop-blur-sm bg-opacity-80 border ${viewMode === 'first-person'
                ? 'bg-orange-600 text-white hover:bg-orange-700 border-orange-400'
                : 'bg-blue-600 text-white hover:bg-blue-700 border-blue-400'
                }`}
            >
              {viewMode === 'first-person' ? '👁️ 1人称視点' : '🎮 3人称視点'}
            </button>
          </div>
        )}

        {/* 操作説明UI */}
        <div className="absolute bottom-4 left-4 z-50 bg-black bg-opacity-80 backdrop-blur-sm text-white p-4 rounded-lg text-sm border border-purple-400 pointer-events-none">
          <div className="space-y-1">
            <div className="text-purple-300 font-semibold">🎮 魔法の操作:</div>
            {isMobile ? (
              <>
                <div>🕹️ 左ジョイスティック: 移動</div>
                <div>🎯 右ジョイスティック: 視点</div>
                <div>🚀 黄色ボタン: ジャンプ</div>
                <div>👆 タッチ: 魔法発動</div>
              </>
            ) : (
              <>
                <div>🔤 WASD: 魔法の移動</div>
                <div>🚀 Space: 浮遊術</div>
                <div>⚡ Shift: 加速呪文</div>
                <div>🖱️ マウス: 視線操作</div>
                <div>🧙‍♂️ 左上: 魔法詠唱パネル</div>
              </>
            )}
            {isPlayerMoving && (
              <div className="text-yellow-300">✨ 魔法で移動中...</div>
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

        <Suspense fallback={<FantasyLoadingSpinner />}>
          {/* タッチインタラクション（Canvas外） */}
          {isMobile && (
            <TouchInteraction onObjectTouch={handleObjectTouch} />
          )}

          <Canvas
            shadows
            dpr={isMobile ? [1, 1.5] : [1, 2]}
            camera={{
              position: [0, 8, 15],
              fov: viewMode === 'first-person' ? 75 : 60,
              near: 0.1,
              far: 1000
            }}
            style={{ pointerEvents: 'auto' }}
            onCreated={(state) => {
              console.log('🧙‍♂️ Fantasy Canvas created successfully:', state);
            }}
            onError={(error) => {
              console.error('❌ Fantasy Canvas error:', error);
            }}
            gl={{
              antialias: !isMobile,
              alpha: false,
              powerPreference: isMobile ? 'default' : 'high-performance',
              precision: isMobile ? 'mediump' : 'highp',
            }}
          >
            {/* 環境光（魔法的な照明） */}
            <ambientLight
              intensity={environmentConfig.timeOfDay === 'night' ? 0.2 : 0.4}
              color="#e0aaff"
            />

            {/* 方向光（太陽または月） */}
            <directionalLight
              position={[50, 50, 25]}
              intensity={environmentConfig.timeOfDay === 'night' ? 0.5 : 1.2}
              color={environmentConfig.timeOfDay === 'night' ? "#c77dff" : "#ffffff"}
              castShadow={!isMobile}
              shadow-mapSize-width={isMobile ? 1024 : 4096}
              shadow-mapSize-height={isMobile ? 1024 : 4096}
              shadow-camera-far={200}
              shadow-camera-left={-100}
              shadow-camera-right={100}
              shadow-camera-top={100}
              shadow-camera-bottom={-100}
            />

            {/* プレイヤーコントローラー */}
            <PlayerController
              position={playerPosition}
              onMove={handlePlayerMove}
              onRotate={handlePlayerRotate}
              speed={10}
              jumpHeight={15}
              viewMode={viewMode}
              virtualMoveInput={virtualMoveInput}
              virtualLookInput={virtualLookInput}
            />

            {/* AI生成ファンタジー環境 */}
            <AIEnvironmentGenerator
              config={environmentConfig}
              onGenerated={(elements) => {
                console.log('🧙‍♂️ Fantasy environment generated:', elements);
              }}
            />

            {/* OrbitControlsは3人称視点かつデスクトップでのみ有効 */}
            {viewMode === 'third-person' && !isMobile && (
              <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                minDistance={5}
                maxDistance={100}
                maxPolarAngle={Math.PI / 2.2}
                enableDamping={true}
                dampingFactor={0.05}
              />
            )}
          </Canvas>
        </Suspense>
      </div>
    </FantasyErrorBoundary>
  );
}; 