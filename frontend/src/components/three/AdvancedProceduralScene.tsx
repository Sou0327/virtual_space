import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Stats } from '@react-three/drei';
import * as THREE from 'three';
import {
  ProceduralTerrain,
  ProceduralBuilding,
  ProceduralVegetation,
  ProceduralCity
} from './ProceduralGeneration';
import {
  AccessibilityProvider,
  useAccessibility,
  FocusManager,
  FeedbackSystem,
  ProgressIndicator,
  LowStimulationEnvironment,
  AccessibilitySettingsPanel
} from './AccessibilitySystem';
import {
  WebGPUProvider,
  useWebGPU,
  useOptimizedRenderer,
  PerformanceStats,
  WebGPUSettingsPanel
} from './WebGPUOptimizer';

// 統合シーンの設定型
interface SceneConfiguration {
  terrainType: 'hills' | 'mountains' | 'plains' | 'islands' | 'valley';
  biome: 'forest' | 'savanna' | 'jungle' | 'desert' | 'tundra';
  cityStyle: 'modern' | 'fantasy' | 'industrial' | 'residential' | 'mixed';
  density: {
    vegetation: number;
    buildings: number;
  };
  size: number;
  seed: number;
}

const defaultSceneConfig: SceneConfiguration = {
  terrainType: 'hills',
  biome: 'forest',
  cityStyle: 'mixed',
  density: {
    vegetation: 0.8,
    buildings: 0.6
  },
  size: 80,
  seed: 42
};

// メインシーンコンポーネント
const ProceduralScene: React.FC<{
  config: SceneConfiguration;
}> = ({ config }) => {
  const { settings: accessibilitySettings } = useAccessibility();
  const { metrics, capabilities } = useWebGPU();
  const [feedback, setFeedback] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    position: [number, number, number];
  }>>([]);

  const sceneRef = useRef<THREE.Group>(null);

  // プロシージャル生成のデバッグ情報
  useEffect(() => {
    console.log('🌍 プロシージャル生成設定:', {
      config,
      vegetationCount: Math.floor(config.size * config.size * config.density.vegetation / 100),
      buildingCount: Math.floor((config.size / 8) * (config.size / 8) * config.density.buildings),
      webgpuSupported: capabilities.isSupported,
      webgpuEnabled: capabilities.isEnabled
    });
  }, [config, capabilities]);

  // インタラクション処理
  const handleObjectClick = (position: [number, number, number], objectType: string) => {
    const feedbackId = Date.now().toString();
    setFeedback(prev => [...prev, {
      id: feedbackId,
      type: 'success',
      message: `${objectType}をクリックしました！`,
      position: [position[0], position[1] + 2, position[2]]
    }]);

    // 3秒後にフィードバックを削除
    setTimeout(() => {
      setFeedback(prev => prev.filter(f => f.id !== feedbackId));
    }, 3000);
  };

  return (
    <LowStimulationEnvironment>
      <group ref={sceneRef}>
        {/* 環境設定 */}
        <Environment preset="sunset" />

        {/* 照明設定（アクセシビリティ対応） */}
        <ambientLight
          intensity={accessibilitySettings.lowStimulation ? 0.4 : 0.6}
          color="#ffffff"
        />
        <directionalLight
          position={[10, 10, 5]}
          intensity={accessibilitySettings.brightnessLevel * 0.8}
          castShadow={!accessibilitySettings.reducedMotion}
          shadow-mapSize-width={
            accessibilitySettings.lowStimulation ? 1024 : 2048
          }
          shadow-mapSize-height={
            accessibilitySettings.lowStimulation ? 1024 : 2048
          }
        />

        {/* プロシージャル地形 */}
        <FocusManager isActive={true}>
          <ProceduralTerrain
            size={config.size}
            resolution={accessibilitySettings.lowStimulation ? 32 : 64}
            heightScale={config.terrainType === 'mountains' ? 15 : 8}
            seed={config.seed}
            type={config.terrainType}
          />
        </FocusManager>

        {/* プロシージャル植生 */}
        <FocusManager isActive={false}>
          <ProceduralVegetation
            terrainSize={config.size}
            density={config.density.vegetation * 100}
            seed={config.seed + 1}
            biome={config.biome}
          />
        </FocusManager>

        {/* プロシージャル都市 */}
        <FocusManager isActive={false}>
          <ProceduralCity
            size={config.size * 0.6}
            buildingDensity={config.density.buildings}
            seed={config.seed + 2}
            style={config.cityStyle}
          />
        </FocusManager>

        {/* テスト用単体建物（デバッグ） */}
        <ProceduralBuilding
          position={[0, 0, 0]}
          seed={config.seed + 100}
          style="modern"
        />

        {/* シンプルなテスト用キューブ（生成確認） */}
        <mesh position={[5, 2, 5]} castShadow>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial color="#ff6b6b" />
        </mesh>

        {/* WebGPU状態表示（デバッグ） */}
        <mesh position={[-5, 2, 5]} castShadow>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial
            color={capabilities.isEnabled ? "#00ff00" : "#ff0000"}
            emissive={capabilities.isEnabled ? "#004400" : "#440000"}
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* インタラクティブオブジェクト例 */}
        <FocusManager isActive={true}>
          <mesh
            position={[10, 5, 10]}
            onClick={(e) => {
              e.stopPropagation();
              handleObjectClick([10, 5, 10], '魔法の水晶');
            }}
            castShadow
          >
            <octahedronGeometry args={[2, 0]} />
            <meshStandardMaterial
              color="#4080ff"
              emissive="#000000"
              emissiveIntensity={0}
              transparent={false}
              opacity={1}
            />
          </mesh>
        </FocusManager>

        {/* 動的フィードバック表示 */}
        {feedback.map(fb => (
          <FeedbackSystem
            key={fb.id}
            position={fb.position}
            type={fb.type}
            message={fb.message}
            duration={3000}
          />
        ))}

        {/* 進捗インジケーター例 - 静的表示 */}
        <mesh position={[0, 20, 0]}>
          <boxGeometry args={[4, 0.5, 0.2]} />
          <meshStandardMaterial color="#333333" />
        </mesh>

        {/* 静的な装飾オブジェクト */}
        <group>
          {/* 固定位置の装飾球体 */}
          {Array.from({ length: 5 }, (_, i) => (
            <mesh
              key={i}
              position={[
                (i - 2) * 15,
                5,
                (i - 2) * 10
              ]}
            >
              <sphereGeometry args={[0.5, 16, 16]} />
              <meshStandardMaterial
                color={`hsl(${i * 72}, 70%, 60%)`}
              />
            </mesh>
          ))}
        </group>
      </group>
    </LowStimulationEnvironment>
  );
};

// 設定コントロールパネル
const SceneControls: React.FC<{
  config: SceneConfiguration;
  onConfigChange: (config: SceneConfiguration) => void;
}> = ({ config, onConfigChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed top-4 left-4 z-40 bg-white bg-opacity-90 p-4 rounded-lg shadow-lg max-w-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex justify-between items-center text-lg font-bold text-gray-800"
      >
        🌍 プロシージャル世界設定
        <span className="text-sm">{isExpanded ? '▼' : '▶'}</span>
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">地形タイプ</label>
            <select
              value={config.terrainType}
              onChange={(e) => onConfigChange({
                ...config,
                terrainType: e.target.value as any
              })}
              className="w-full p-2 border rounded"
            >
              <option value="hills">丘陵</option>
              <option value="mountains">山脈</option>
              <option value="plains">平原</option>
              <option value="islands">島々</option>
              <option value="valley">渓谷</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">バイオーム</label>
            <select
              value={config.biome}
              onChange={(e) => onConfigChange({
                ...config,
                biome: e.target.value as any
              })}
              className="w-full p-2 border rounded"
            >
              <option value="forest">森林</option>
              <option value="savanna">サバンナ</option>
              <option value="jungle">ジャングル</option>
              <option value="desert">砂漠</option>
              <option value="tundra">ツンドラ</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">都市スタイル</label>
            <select
              value={config.cityStyle}
              onChange={(e) => onConfigChange({
                ...config,
                cityStyle: e.target.value as any
              })}
              className="w-full p-2 border rounded"
            >
              <option value="modern">現代</option>
              <option value="fantasy">ファンタジー</option>
              <option value="industrial">工業</option>
              <option value="residential">住宅</option>
              <option value="mixed">混合</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              植生密度: {Math.round(config.density.vegetation * 100)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={config.density.vegetation}
              onChange={(e) => onConfigChange({
                ...config,
                density: {
                  ...config.density,
                  vegetation: parseFloat(e.target.value)
                }
              })}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              建物密度: {Math.round(config.density.buildings * 100)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="0.8"
              step="0.1"
              value={config.density.buildings}
              onChange={(e) => onConfigChange({
                ...config,
                density: {
                  ...config.density,
                  buildings: parseFloat(e.target.value)
                }
              })}
              className="w-full"
            />
          </div>

          <button
            onClick={() => onConfigChange({
              ...config,
              seed: Math.floor(Math.random() * 100000)
            })}
            className="w-full px-6 py-4 bg-orange-600 text-white text-lg font-bold rounded-lg hover:bg-orange-700 shadow-lg"
          >
            🎲 新しい世界を生成！
          </button>
        </div>
      )}
    </div>
  );
};

// メインコンポーネント
export const AdvancedProceduralScene: React.FC = () => {
  const [config, setConfig] = useState<SceneConfiguration>(defaultSceneConfig);
  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false);
  const [showWebGPUPanel, setShowWebGPUPanel] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const { capabilities, metrics } = useWebGPU();

  return (
    <div className="w-full h-screen relative">
      {/* 3Dキャンバス */}
      <CanvasWithOptimization
        config={config}
        showStats={showStats}
      />

      {/* UI オーバーレイ */}
      <SceneControls config={config} onConfigChange={setConfig} />

      {/* パフォーマンス統計 */}
      <PerformanceStats
        position="top-right"
        visible={showStats}
      />

      {/* コントロールボタン */}
      <div className="fixed bottom-4 right-4 z-40 space-y-2">
        <button
          onClick={() => setShowAccessibilityPanel(true)}
          className="block w-12 h-12 bg-purple-600 text-white rounded-full hover:bg-purple-700 flex items-center justify-center"
          title="アクセシビリティ設定"
        >
          🌈
        </button>
        <button
          onClick={() => setShowWebGPUPanel(true)}
          className="block w-12 h-12 bg-blue-600 text-white rounded-full hover:bg-blue-700 flex items-center justify-center"
          title="パフォーマンス設定"
        >
          🚀
        </button>
        <button
          onClick={() => setShowStats(!showStats)}
          className="block w-12 h-12 bg-green-600 text-white rounded-full hover:bg-green-700 flex items-center justify-center"
          title="統計表示切り替え"
        >
          📊
        </button>
      </div>

      {/* 設定パネル */}
      <AccessibilitySettingsPanel
        isOpen={showAccessibilityPanel}
        onClose={() => setShowAccessibilityPanel(false)}
      />

      <WebGPUSettingsPanel
        isOpen={showWebGPUPanel}
        onClose={() => setShowWebGPUPanel(false)}
      />

      {/* 情報パネル */}
      <div className="fixed bottom-4 left-4 z-40 bg-black bg-opacity-80 text-white p-3 rounded-lg text-sm max-w-xs">
        <h3 className="font-bold mb-2">🎮 操作方法</h3>
        <ul className="space-y-1 text-xs">
          <li>• マウス: 視点回転</li>
          <li>• ホイール: ズーム</li>
          <li>• 右クリック+ドラッグ: パン</li>
          <li>• オブジェクトクリック: インタラクション</li>
        </ul>

        <h3 className="font-bold mb-2 mt-4">🌍 生成状態</h3>
        <ul className="space-y-1 text-xs">
          <li>• 地形: {config.terrainType}</li>
          <li>• バイオーム: {config.biome}</li>
          <li>• 都市: {config.cityStyle}</li>
          <li>• 植生密度: {(config.density.vegetation * 100).toFixed(0)}%</li>
          <li>• 建物密度: {(config.density.buildings * 100).toFixed(0)}%</li>
          <li>• WebGPU: {capabilities.isEnabled ? '✅' : '❌'}</li>
          <li>• FPS: {metrics.fps}</li>
          <li>• シード値: {config.seed}</li>
        </ul>
      </div>
    </div>
  );
};

// 最適化されたCanvasコンポーネント
const CanvasWithOptimization: React.FC<{
  config: SceneConfiguration;
  showStats: boolean;
}> = ({ config, showStats }) => {
  const { createOptimizedRenderer } = useOptimizedRenderer();
  const { capabilities, settings } = useWebGPU();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // WebGPU対応カメラ設定
  const getCameraSettings = () => {
    // 安全で見やすい固定カメラ位置
    return {
      position: [30, 20, 30] as [number, number, number],
      fov: 75,
      near: 0.1,
      far: 500
    };
  };

  // レンダラー設定
  const getCanvasSettings = () => {
    const baseSettings = {
      ref: canvasRef,
      dpr: Math.min(window.devicePixelRatio, settings.textureQuality === 'ultra' ? 2 : 1.5),
      shadows: settings.shadowQuality !== 'low',
      performance: {
        min: 0.2,
        max: 1,
        debounce: 200
      }
    };

    if (capabilities.isEnabled) {
      return {
        ...baseSettings,
        gl: {
          powerPreference: 'high-performance' as WebGLPowerPreference,
          antialias: settings.shadowQuality !== 'low',
          alpha: false,
          depth: true,
          stencil: false
        }
      };
    }

    return baseSettings;
  };

  useEffect(() => {
    if (canvasRef.current) {
      const renderer = createOptimizedRenderer(canvasRef.current);
      console.log('🎨 最適化レンダラー初期化:', {
        webgpu: capabilities.isEnabled,
        shadowQuality: settings.shadowQuality,
        textureQuality: settings.textureQuality
      });
    }
  }, [createOptimizedRenderer, capabilities.isEnabled, settings]);

  return (
    <Canvas
      camera={getCameraSettings()}
      {...getCanvasSettings()}
    >
      <Suspense fallback={null}>
        <ProceduralScene config={config} />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxDistance={200}
          minDistance={5}
          enableDamping={false}
          autoRotate={false}
          autoRotateSpeed={0}
        />
        {showStats && <Stats showPanel={0} className="stats" />}
      </Suspense>
    </Canvas>
  );
};

// プロバイダーでラップした最終エクスポート
export const AdvancedProceduralSceneWithProviders: React.FC = () => {
  return (
    <WebGPUProvider>
      <AccessibilityProvider>
        <AdvancedProceduralScene />
      </AccessibilityProvider>
    </WebGPUProvider>
  );
}; 