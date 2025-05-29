import React, { useEffect, useState, useCallback, createContext, useContext } from 'react';
import * as THREE from 'three';

// WebGPU型定義（TypeScript対応）
declare global {
  interface Navigator {
    gpu?: GPU;
  }

  interface GPU {
    requestAdapter(options?: GPURequestAdapterOptions): Promise<GPUAdapter | null>;
  }

  interface GPURequestAdapterOptions {
    powerPreference?: 'low-power' | 'high-performance';
  }

  interface GPUAdapter {
    features: Set<string>;
    limits: Record<string, number>;
    requestDevice(options?: GPUDeviceDescriptor): Promise<GPUDevice>;
  }

  interface GPUDeviceDescriptor {
    requiredFeatures?: string[];
    requiredLimits?: Record<string, number>;
  }

  interface GPUDevice {
    // WebGPUデバイスの基本プロパティ
  }
}

// WebGPU対応状況の型定義
interface WebGPUCapabilities {
  isSupported: boolean;
  isEnabled: boolean;
  adapter: GPUAdapter | null;
  device: GPUDevice | null;
  features: string[];
  limits: Record<string, number>;
  fallbackReason?: string;
}

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  drawCalls: number;
  triangles: number;
  memoryUsage: number;
  isThrottled: boolean;
}

interface OptimizationSettings {
  adaptiveQuality: boolean;
  dynamicLOD: boolean;
  frustumCulling: boolean;
  occlusionCulling: boolean;
  instancedRendering: boolean;
  compressionEnabled: boolean;
  shadowQuality: 'low' | 'medium' | 'high' | 'ultra';
  textureQuality: 'low' | 'medium' | 'high' | 'ultra';
  maxDrawCalls: number;
  targetFPS: number;
}

const defaultOptimizationSettings: OptimizationSettings = {
  adaptiveQuality: true,
  dynamicLOD: true,
  frustumCulling: true,
  occlusionCulling: false,
  instancedRendering: true,
  compressionEnabled: true,
  shadowQuality: 'medium',
  textureQuality: 'medium',
  maxDrawCalls: 1000,
  targetFPS: 60
};

// WebGPUコンテキスト
const WebGPUContext = createContext<{
  capabilities: WebGPUCapabilities;
  metrics: PerformanceMetrics;
  settings: OptimizationSettings;
  updateSettings: (updates: Partial<OptimizationSettings>) => void;
  renderer: THREE.WebGLRenderer | null;
  setRenderer: (renderer: THREE.WebGLRenderer) => void;
}>({
  capabilities: {
    isSupported: false,
    isEnabled: false,
    adapter: null,
    device: null,
    features: [],
    limits: {}
  },
  metrics: {
    fps: 0,
    frameTime: 0,
    drawCalls: 0,
    triangles: 0,
    memoryUsage: 0,
    isThrottled: false
  },
  settings: defaultOptimizationSettings,
  updateSettings: () => { },
  renderer: null,
  setRenderer: () => { }
});

export const useWebGPU = () => useContext(WebGPUContext);

// WebGPU検出とセットアップ
const detectWebGPUCapabilities = async (): Promise<WebGPUCapabilities> => {
  try {
    // WebGPU対応チェック
    if (!navigator.gpu) {
      console.log('🚀 WebGPU: ブラウザでサポートされていません');
      return {
        isSupported: false,
        isEnabled: false,
        adapter: null,
        device: null,
        features: [],
        limits: {},
        fallbackReason: 'WebGPU not supported in this browser'
      };
    }

    console.log('🚀 WebGPU: ブラウザでサポートされています');

    // アダプター取得
    const adapter = await navigator.gpu.requestAdapter({
      powerPreference: 'high-performance'
    });

    if (!adapter) {
      console.log('🚀 WebGPU: 適切なGPUアダプターが見つかりません');
      return {
        isSupported: true,
        isEnabled: false,
        adapter: null,
        device: null,
        features: [],
        limits: {},
        fallbackReason: 'No suitable GPU adapter found'
      };
    }

    console.log('🚀 WebGPU: アダプター取得成功');

    // デバイス取得
    const device = await adapter.requestDevice({
      requiredFeatures: [],
      requiredLimits: {}
    });

    console.log('🚀 WebGPU: デバイス取得成功');

    return {
      isSupported: true,
      isEnabled: true,
      adapter,
      device,
      features: Array.from(adapter.features),
      limits: Object.fromEntries(
        Object.entries(adapter.limits).map(([key, value]) => [key, Number(value)])
      )
    };
  } catch (error) {
    console.warn('🚀 WebGPU: 検出に失敗しました:', error);
    return {
      isSupported: false,
      isEnabled: false,
      adapter: null,
      device: null,
      features: [],
      limits: {},
      fallbackReason: `WebGPU initialization error: ${error}`
    };
  }
};

// パフォーマンスモニタリング
class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private frameTimeHistory: number[] = [];
  private maxHistoryLength = 60;

  public metrics: PerformanceMetrics = {
    fps: 0,
    frameTime: 0,
    drawCalls: 0,
    triangles: 0,
    memoryUsage: 0,
    isThrottled: false
  };

  update(renderer?: THREE.WebGLRenderer) {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;

    this.frameTimeHistory.push(deltaTime);
    if (this.frameTimeHistory.length > this.maxHistoryLength) {
      this.frameTimeHistory.shift();
    }

    this.frameCount++;

    // FPS計算（毎秒更新）
    if (deltaTime >= 1000) {
      this.metrics.fps = Math.round((this.frameCount * 1000) / deltaTime);
      this.frameCount = 0;
      this.lastTime = currentTime;
    }

    // 平均フレーム時間
    this.metrics.frameTime = this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length;

    // レンダラー統計情報
    if (renderer) {
      const info = renderer.info;
      this.metrics.drawCalls = info.render.calls;
      this.metrics.triangles = info.render.triangles;
      this.metrics.memoryUsage = info.memory.geometries + info.memory.textures;
    }

    // パフォーマンス低下検出
    this.metrics.isThrottled = this.metrics.fps < 30 || this.metrics.frameTime > 33;
  }

  getAverageFPS(seconds = 5): number {
    const targetFrames = Math.min(seconds * 60, this.frameTimeHistory.length);
    if (targetFrames === 0) return 0;

    const recentFrames = this.frameTimeHistory.slice(-targetFrames);
    const averageFrameTime = recentFrames.reduce((a, b) => a + b, 0) / recentFrames.length;
    return Math.round(1000 / averageFrameTime);
  }
}

// 適応的品質調整システム
class AdaptiveQualityController {
  private settings: OptimizationSettings;
  private monitor: PerformanceMonitor;
  private adjustmentCooldown = 0;
  private adjustmentInterval = 2000; // 2秒
  private lastAdjustment = 0;

  constructor(settings: OptimizationSettings, monitor: PerformanceMonitor) {
    this.settings = settings;
    this.monitor = monitor;
  }

  update(currentTime: number): Partial<OptimizationSettings> | null {
    if (!this.settings.adaptiveQuality) return null;
    if (currentTime - this.lastAdjustment < this.adjustmentInterval) return null;

    const averageFPS = this.monitor.getAverageFPS();
    const targetFPS = this.settings.targetFPS;
    const performance = averageFPS / targetFPS;

    let adjustments: Partial<OptimizationSettings> = {};

    // パフォーマンスが目標を下回る場合は品質を下げる
    if (performance < 0.8) {
      if (this.settings.shadowQuality === 'ultra') {
        adjustments.shadowQuality = 'high';
      } else if (this.settings.shadowQuality === 'high') {
        adjustments.shadowQuality = 'medium';
      } else if (this.settings.shadowQuality === 'medium') {
        adjustments.shadowQuality = 'low';
      }

      if (this.settings.textureQuality === 'ultra') {
        adjustments.textureQuality = 'high';
      } else if (this.settings.textureQuality === 'high') {
        adjustments.textureQuality = 'medium';
      }

      adjustments.maxDrawCalls = Math.max(100, this.settings.maxDrawCalls * 0.8);
    }
    // パフォーマンスに余裕がある場合は品質を上げる
    else if (performance > 1.2) {
      if (this.settings.shadowQuality === 'low') {
        adjustments.shadowQuality = 'medium';
      } else if (this.settings.shadowQuality === 'medium') {
        adjustments.shadowQuality = 'high';
      } else if (this.settings.shadowQuality === 'high') {
        adjustments.shadowQuality = 'ultra';
      }

      if (this.settings.textureQuality === 'medium') {
        adjustments.textureQuality = 'high';
      } else if (this.settings.textureQuality === 'high') {
        adjustments.textureQuality = 'ultra';
      }

      adjustments.maxDrawCalls = Math.min(2000, this.settings.maxDrawCalls * 1.2);
    }

    if (Object.keys(adjustments).length > 0) {
      this.lastAdjustment = currentTime;
      console.log('🎮 Adaptive quality adjustment:', adjustments, 'Current FPS:', averageFPS);
      return adjustments;
    }

    return null;
  }
}

// WebGPUプロバイダー
export const WebGPUProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [capabilities, setCapabilities] = useState<WebGPUCapabilities>({
    isSupported: false,
    isEnabled: false,
    adapter: null,
    device: null,
    features: [],
    limits: {}
  });

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    frameTime: 0,
    drawCalls: 0,
    triangles: 0,
    memoryUsage: 0,
    isThrottled: false
  });

  const [settings, setSettings] = useState<OptimizationSettings>(() => {
    const saved = localStorage.getItem('fanverse-webgpu-settings');
    return saved ? { ...defaultOptimizationSettings, ...JSON.parse(saved) } : defaultOptimizationSettings;
  });

  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);
  const [monitor] = useState(() => new PerformanceMonitor());
  const [qualityController] = useState(() => new AdaptiveQualityController(settings, monitor));

  // WebGPU初期化
  useEffect(() => {
    detectWebGPUCapabilities().then(setCapabilities);
  }, []);

  // パフォーマンスモニタリング
  useEffect(() => {
    const interval = setInterval(() => {
      monitor.update(renderer || undefined);
      setMetrics({ ...monitor.metrics });

      // 適応的品質調整
      const adjustments = qualityController.update(performance.now());
      if (adjustments) {
        updateSettings(adjustments);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [renderer]);

  const updateSettings = useCallback((updates: Partial<OptimizationSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    localStorage.setItem('fanverse-webgpu-settings', JSON.stringify(newSettings));
  }, [settings]);

  const setRendererHandler = useCallback((newRenderer: THREE.WebGLRenderer) => {
    setRenderer(newRenderer);

    // WebGPUレンダラーの設定（実験的）
    if (capabilities.isEnabled && capabilities.device) {
      try {
        // 実際のWebGPUレンダラーの実装はThree.jsの進展に依存
        console.log('🚀 WebGPU ready, but Three.js WebGPURenderer is experimental');
      } catch (error) {
        console.warn('WebGPU renderer setup failed:', error);
      }
    }
  }, [capabilities]);

  return (
    <WebGPUContext.Provider
      value={{
        capabilities,
        metrics,
        settings,
        updateSettings,
        renderer,
        setRenderer: setRendererHandler
      }}
    >
      {children}
    </WebGPUContext.Provider>
  );
};

// レンダラー最適化フック
export const useOptimizedRenderer = () => {
  const { capabilities, settings, setRenderer } = useWebGPU();

  const createOptimizedRenderer = useCallback((canvas?: HTMLCanvasElement) => {
    const rendererParams: THREE.WebGLRendererParameters = {
      canvas,
      antialias: settings.shadowQuality !== 'low',
      alpha: false,
      powerPreference: capabilities.isSupported ? 'high-performance' : 'default',
      stencil: false,
      depth: true,
      logarithmicDepthBuffer: false,
      preserveDrawingBuffer: false,
      precision: settings.textureQuality === 'low' ? 'mediump' : 'highp',
    };

    const renderer = new THREE.WebGLRenderer(rendererParams);

    // 基本設定
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, settings.textureQuality === 'ultra' ? 2 : 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    // シャドウ設定
    if (settings.shadowQuality !== 'low') {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = settings.shadowQuality === 'ultra' ?
        THREE.PCFSoftShadowMap : THREE.PCFShadowMap;

      const shadowMapSize = {
        low: 512,
        medium: 1024,
        high: 2048,
        ultra: 4096
      }[settings.shadowQuality];

      renderer.shadowMap.needsUpdate = true;
    }

    // 最適化設定
    renderer.info.autoReset = false;

    // フラストラムカリング
    if (settings.frustumCulling) {
      renderer.localClippingEnabled = true;
    }

    setRenderer(renderer);
    return renderer;
  }, [capabilities, settings, setRenderer]);

  return { createOptimizedRenderer };
};

// パフォーマンス統計表示
export const PerformanceStats: React.FC<{
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  visible?: boolean;
}> = ({ position = 'top-left', visible = true }) => {
  const { metrics, capabilities, settings } = useWebGPU();

  if (!visible) return null;

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right': return 'top-4 right-4';
      case 'bottom-left': return 'bottom-4 left-4';
      case 'bottom-right': return 'bottom-4 right-4';
      default: return 'top-4 left-4';
    }
  };

  const getFPSColor = () => {
    if (metrics.fps >= 50) return 'text-green-400';
    if (metrics.fps >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className={`fixed ${getPositionClasses()} z-50 bg-black bg-opacity-80 text-white p-3 rounded-lg text-xs font-mono`}>
      <div className="space-y-1">
        <div className={`${getFPSColor()} font-bold`}>
          FPS: {metrics.fps} ({metrics.frameTime.toFixed(1)}ms)
        </div>
        <div>Draw Calls: {metrics.drawCalls}</div>
        <div>Triangles: {metrics.triangles.toLocaleString()}</div>
        <div>Memory: {(metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB</div>
        {metrics.isThrottled && (
          <div className="text-red-400">⚠️ Performance throttled</div>
        )}
        <div className="border-t border-gray-600 pt-1 mt-2">
          <div>WebGPU: {capabilities.isEnabled ? '✅' : '❌'}</div>
          <div>Quality: {settings.shadowQuality}/{settings.textureQuality}</div>
        </div>
      </div>
    </div>
  );
};

// WebGPU設定パネル
export const WebGPUSettingsPanel: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { capabilities, settings, updateSettings } = useWebGPU();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-96 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-800">🚀 WebGPU・パフォーマンス設定</h2>

        {/* WebGPU情報 */}
        <div className="mb-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-medium mb-2 text-gray-700">WebGPU対応状況</h3>
          <div className="text-sm space-y-1">
            <div>対応: {capabilities.isSupported ? '✅' : '❌'}</div>
            <div>有効: {capabilities.isEnabled ? '✅' : '❌'}</div>
            {capabilities.fallbackReason && (
              <div className="text-red-600">{capabilities.fallbackReason}</div>
            )}
            {capabilities.features.length > 0 && (
              <div>機能: {capabilities.features.slice(0, 3).join(', ')}...</div>
            )}
          </div>
        </div>

        {/* 設定項目 */}
        <div className="space-y-4">
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.adaptiveQuality}
                onChange={(e) => updateSettings({ adaptiveQuality: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-gray-700">適応的品質調整</span>
            </label>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">シャドウ品質</label>
            <select
              value={settings.shadowQuality}
              onChange={(e) => updateSettings({ shadowQuality: e.target.value as any })}
              className="w-full p-2 border rounded"
            >
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
              <option value="ultra">最高</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">テクスチャ品質</label>
            <select
              value={settings.textureQuality}
              onChange={(e) => updateSettings({ textureQuality: e.target.value as any })}
              className="w-full p-2 border rounded"
            >
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
              <option value="ultra">最高</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">
              目標FPS: {settings.targetFPS}
            </label>
            <input
              type="range"
              min="30"
              max="120"
              step="10"
              value={settings.targetFPS}
              onChange={(e) => updateSettings({ targetFPS: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.instancedRendering}
                onChange={(e) => updateSettings({ instancedRendering: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-gray-700">インスタンス描画</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end mt-6">
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