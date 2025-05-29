import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// アクセシビリティ設定の型定義
interface AccessibilitySettings {
  // 刺激制御
  reducedMotion: boolean;
  lowStimulation: boolean;
  highContrast: boolean;

  // 注意散漫防止
  focusMode: boolean;
  minimizeAnimations: boolean;
  hideNonEssentialUI: boolean;

  // フィードバック設定
  hapticFeedback: boolean;
  audioFeedback: boolean;
  visualFeedback: boolean;

  // 認知支援
  showProgressIndicators: boolean;
  provideClearInstructions: boolean;
  consistentNavigation: boolean;

  // カスタム設定
  saturationLevel: number; // 0-1
  brightnessLevel: number; // 0-2
  animationSpeed: number; // 0-2
  soundVolume: number; // 0-1
}

const defaultSettings: AccessibilitySettings = {
  reducedMotion: false,
  lowStimulation: false,
  highContrast: false,
  focusMode: false,
  minimizeAnimations: false,
  hideNonEssentialUI: false,
  hapticFeedback: true,
  audioFeedback: true,
  visualFeedback: true,
  showProgressIndicators: true,
  provideClearInstructions: true,
  consistentNavigation: true,
  saturationLevel: 1,
  brightnessLevel: 1,
  animationSpeed: 1,
  soundVolume: 0.7
};

// アクセシビリティコンテキスト
const AccessibilityContext = createContext<{
  settings: AccessibilitySettings;
  updateSettings: (updates: Partial<AccessibilitySettings>) => void;
  presets: {
    adhd: () => void;
    autism: () => void;
    lowVision: () => void;
    motorImpairment: () => void;
    reset: () => void;
  };
}>({
  settings: defaultSettings,
  updateSettings: () => { },
  presets: {
    adhd: () => { },
    autism: () => { },
    lowVision: () => { },
    motorImpairment: () => { },
    reset: () => { }
  }
});

// アクセシビリティプロバイダー
export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    // ローカルストレージから設定を読み込み
    const saved = localStorage.getItem('fanverse-accessibility');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  const updateSettings = (updates: Partial<AccessibilitySettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    localStorage.setItem('fanverse-accessibility', JSON.stringify(newSettings));
  };

  const presets = {
    // ADHD向けプリセット
    adhd: () => updateSettings({
      reducedMotion: true,
      lowStimulation: true,
      focusMode: true,
      minimizeAnimations: true,
      showProgressIndicators: true,
      provideClearInstructions: true,
      saturationLevel: 0.8,
      animationSpeed: 0.7,
      soundVolume: 0.5
    }),

    // 自閉症向けプリセット
    autism: () => updateSettings({
      consistentNavigation: true,
      provideClearInstructions: true,
      minimizeAnimations: true,
      lowStimulation: true,
      saturationLevel: 0.7,
      soundVolume: 0.3,
      hapticFeedback: false
    }),

    // 視覚障害向けプリセット
    lowVision: () => updateSettings({
      highContrast: true,
      brightnessLevel: 1.5,
      saturationLevel: 1.2,
      hapticFeedback: true,
      audioFeedback: true,
      provideClearInstructions: true
    }),

    // 運動機能障害向けプリセット
    motorImpairment: () => updateSettings({
      hapticFeedback: true,
      visualFeedback: true,
      showProgressIndicators: true,
      consistentNavigation: true,
      animationSpeed: 0.5
    }),

    // リセット
    reset: () => updateSettings(defaultSettings)
  };

  return (
    <AccessibilityContext.Provider value={{ settings, updateSettings, presets }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

// アクセシビリティフック
export const useAccessibility = () => useContext(AccessibilityContext);

// フォーカス管理システム
export const FocusManager: React.FC<{
  children: React.ReactNode;
  isActive?: boolean;
}> = ({ children, isActive = true }) => {
  const { settings } = useAccessibility();
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    // 全てのアニメーションを無効化
    // if (groupRef.current && settings.focusMode && isActive) {
    //   // フォーカス中のオブジェクトを強調
    //   groupRef.current.children.forEach(child => {
    //     if (child instanceof THREE.Mesh) {
    //       if (child.material instanceof THREE.MeshStandardMaterial) {
    //         child.material.emissiveIntensity = 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
    //       }
    //     }
    //   });
    // }
  });

  return (
    <group ref={groupRef}>
      {children}
      {settings.focusMode && isActive && (
        // フォーカスリング
        <mesh position={[0, 0, 0]}>
          <ringGeometry args={[2, 2.2, 32]} />
          <meshBasicMaterial
            color="#00ff00"
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
};

// 即時フィードバックシステム
export const FeedbackSystem: React.FC<{
  position: [number, number, number];
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}> = ({ position, type, message, duration = 3000 }) => {
  const { settings } = useAccessibility();
  const [visible, setVisible] = useState(true);
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  useFrame((state) => {
    // 全ての気持ち悪いアニメーションを無効化
    // if (meshRef.current && visible) {
    //   // パルスエフェクト
    //   const scale = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.1;
    //   meshRef.current.scale.setScalar(scale);
    //
    //   // フェードアウト
    //   const timeLeft = Math.max(0, 1 - state.clock.elapsedTime / (duration / 1000));
    //   if (meshRef.current.material instanceof THREE.MeshBasicMaterial) {
    //     meshRef.current.material.opacity = timeLeft;
    //   }
    // }
  });

  const getColor = () => {
    switch (type) {
      case 'success': return '#00ff00';
      case 'error': return '#ff0000';
      case 'warning': return '#ffaa00';
      case 'info': return '#0088ff';
      default: return '#ffffff';
    }
  };

  const getEmoji = () => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '💬';
    }
  };

  if (!visible || !settings.visualFeedback) return null;

  return (
    <group position={position}>
      {/* フィードバック表示 */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial
          color={getColor()}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* メッセージ表示（2D UI として実装することを想定） */}
      <mesh position={[0, 1, 0]}>
        <planeGeometry args={[2, 0.5]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  );
};

// 進捗インジケーター
export const ProgressIndicator: React.FC<{
  position: [number, number, number];
  progress: number; // 0-1
  total: number;
  current: number;
  label: string;
}> = ({ position, progress, total, current, label }) => {
  const { settings } = useAccessibility();
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    // 進捗バーのアニメーションを無効化
    // if (meshRef.current) {
    //   // 進捗バーのアニメーション
    //   meshRef.current.scale.x = progress;
    // }
  });

  if (!settings.showProgressIndicators) return null;

  return (
    <group position={position}>
      {/* 背景バー */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[4, 0.2, 0.1]} />
        <meshBasicMaterial color="#333333" />
      </mesh>

      {/* 進捗バー */}
      <mesh ref={meshRef} position={[-2 + 2 * progress, 0, 0.01]}>
        <boxGeometry args={[4, 0.2, 0.1]} />
        <meshBasicMaterial color="#00ff00" />
      </mesh>

      {/* 数値表示 */}
      <mesh position={[0, 0.5, 0]}>
        <planeGeometry args={[3, 0.3]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  );
};

// 低刺激モード用環境調整
export const LowStimulationEnvironment: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { settings } = useAccessibility();

  if (!settings.lowStimulation) {
    return <>{children}</>;
  }

  return (
    <group>
      {/* 背景の彩度を下げる */}
      <color
        attach="background"
        args={[
          `hsl(220, ${30 * settings.saturationLevel}%, ${20 * settings.brightnessLevel}%)`
        ]}
      />

      {/* 霧で遠景を柔らかく */}
      <fog
        attach="fog"
        args={['#f0f0f0', 20, 100]}
      />

      {/* 環境光を調整 */}
      <ambientLight intensity={0.3 * settings.brightnessLevel} color="#f0f0f0" />

      {children}
    </group>
  );
};

// アクセシビリティ設定UI
export const AccessibilitySettingsPanel: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, presets } = useAccessibility();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-800">🌈 アクセシビリティ設定</h2>

        {/* プリセット */}
        <div className="mb-6">
          <h3 className="font-medium mb-2 text-gray-700">クイック設定</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={presets.adhd}
              className="px-3 py-2 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
            >
              🧠 ADHD向け
            </button>
            <button
              onClick={presets.autism}
              className="px-3 py-2 text-sm bg-purple-100 text-purple-800 rounded hover:bg-purple-200"
            >
              🌟 自閉症向け
            </button>
            <button
              onClick={presets.lowVision}
              className="px-3 py-2 text-sm bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
            >
              👁️ 視覚支援
            </button>
            <button
              onClick={presets.motorImpairment}
              className="px-3 py-2 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200"
            >
              🖐️ 運動支援
            </button>
          </div>
        </div>

        {/* 個別設定 */}
        <div className="space-y-4">
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={(e) => updateSettings({ reducedMotion: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-gray-700">動きを減らす</span>
            </label>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.lowStimulation}
                onChange={(e) => updateSettings({ lowStimulation: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-gray-700">低刺激モード</span>
            </label>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.focusMode}
                onChange={(e) => updateSettings({ focusMode: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-gray-700">フォーカスモード</span>
            </label>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">彩度: {Math.round(settings.saturationLevel * 100)}%</label>
            <input
              type="range"
              min="0.3"
              max="1.5"
              step="0.1"
              value={settings.saturationLevel}
              onChange={(e) => updateSettings({ saturationLevel: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">音量: {Math.round(settings.soundVolume * 100)}%</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.soundVolume}
              onChange={(e) => updateSettings({ soundVolume: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={presets.reset}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            リセット
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}; 