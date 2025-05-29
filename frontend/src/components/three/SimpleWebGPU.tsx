import React, { useEffect, useState } from 'react';

// WebGPU基本情報
interface WebGPUInfo {
  supported: boolean;
  enabled: boolean;
  adapter: GPUAdapter | null;
  adapterInfo: any;
  error?: string;
}

// WebGPU検出フック
export const useSimpleWebGPU = () => {
  const [info, setInfo] = useState<WebGPUInfo>({
    supported: false,
    enabled: false,
    adapter: null,
    adapterInfo: null
  });

  const [isChecking, setIsChecking] = useState(false);

  const checkWebGPU = async () => {
    setIsChecking(true);
    console.log('🚀 WebGPU検出開始...');

    try {
      // Step 1: ブラウザサポート確認
      if (!navigator.gpu) {
        setInfo({
          supported: false,
          enabled: false,
          adapter: null,
          adapterInfo: null,
          error: 'navigator.gpu が利用できません（ブラウザがWebGPUに対応していません）'
        });
        console.log('❌ WebGPU: ブラウザ未対応');
        return;
      }

      console.log('✅ WebGPU: ブラウザ対応確認');

      // Step 2: アダプター要求
      const adapter = await navigator.gpu.requestAdapter({
        powerPreference: 'high-performance'
      });

      if (!adapter) {
        setInfo({
          supported: true,
          enabled: false,
          adapter: null,
          adapterInfo: null,
          error: 'GPUアダプターが取得できませんでした'
        });
        console.log('❌ WebGPU: アダプター取得失敗');
        return;
      }

      console.log('✅ WebGPU: アダプター取得成功');

      // Step 3: アダプター情報取得
      let adapterInfo: any = {};
      try {
        adapterInfo = {
          features: Array.from(adapter.features),
          limits: Object.fromEntries(
            Object.entries(adapter.limits).map(([key, value]) => [key, Number(value)])
          )
        };
      } catch (e) {
        console.warn('アダプター情報取得で警告:', e);
      }

      console.log('📊 WebGPU アダプター情報:', adapterInfo);

      setInfo({
        supported: true,
        enabled: true,
        adapter,
        adapterInfo,
      });

      console.log('✅ WebGPU: 完全対応');

    } catch (error) {
      console.error('❌ WebGPU検出エラー:', error);
      setInfo({
        supported: false,
        enabled: false,
        adapter: null,
        adapterInfo: null,
        error: `WebGPU検出エラー: ${error}`
      });
    } finally {
      setIsChecking(false);
    }
  };

  return { info, isChecking, checkWebGPU };
};

// WebGPU情報表示コンポーネント
export const SimpleWebGPUDisplay: React.FC = () => {
  const { info, isChecking, checkWebGPU } = useSimpleWebGPU();

  useEffect(() => {
    // 初回自動チェック
    checkWebGPU();
  }, []);

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">🚀 WebGPU 状態チェック</h3>
        <button
          onClick={checkWebGPU}
          disabled={isChecking}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {isChecking ? '確認中...' : '再チェック'}
        </button>
      </div>

      <div className="space-y-3">
        {/* 基本ステータス */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">ブラウザ対応:</span>
          <span className={`px-2 py-1 rounded text-sm ${info.supported ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {info.supported ? '✅ 対応' : '❌ 未対応'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">WebGPU有効:</span>
          <span className={`px-2 py-1 rounded text-sm ${info.enabled ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {info.enabled ? '✅ 有効' : '⚠️ 無効'}
          </span>
        </div>

        {/* エラー表示 */}
        {info.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-sm text-red-800">
              <strong>エラー:</strong> {info.error}
            </p>
          </div>
        )}

        {/* 詳細情報 */}
        {info.enabled && info.adapterInfo && (
          <div className="mt-4 p-3 bg-gray-50 rounded">
            <h4 className="font-medium mb-2">📊 アダプター詳細</h4>

            {/* 機能 */}
            {info.adapterInfo.features && info.adapterInfo.features.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-medium mb-1">対応機能 ({info.adapterInfo.features.length}個):</p>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {info.adapterInfo.features.slice(0, 6).map((feature: string, index: number) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {feature}
                    </span>
                  ))}
                  {info.adapterInfo.features.length > 6 && (
                    <span className="text-gray-500 px-2 py-1">
                      +{info.adapterInfo.features.length - 6}個
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* 制限値 */}
            {info.adapterInfo.limits && (
              <div>
                <p className="text-sm font-medium mb-1">主要制限値:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>最大テクスチャサイズ: {info.adapterInfo.limits.maxTextureDimension2D || 'N/A'}</div>
                  <div>最大バインドグループ: {info.adapterInfo.limits.maxBindGroups || 'N/A'}</div>
                  <div>最大バッファサイズ: {Math.round((info.adapterInfo.limits.maxBufferSize || 0) / 1024 / 1024)}MB</div>
                  <div>最大計算ワークグループ: {info.adapterInfo.limits.maxComputeWorkgroupSizeX || 'N/A'}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 推奨アクション */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <h4 className="font-medium mb-2">💡 推奨事項</h4>
          <ul className="text-sm space-y-1">
            {!info.supported && (
              <li>• Chrome Canary、Firefox Nightly、またはEdge Devをお試しください</li>
            )}
            {info.supported && !info.enabled && (
              <li>• ブラウザでWebGPUフラグを有効にしてください</li>
            )}
            {info.enabled && (
              <li>• ✅ WebGPUが利用可能です！高性能な3D描画が期待できます</li>
            )}
            <li>• WebGPUは実験的機能のため、予期しない動作が発生する可能性があります</li>
          </ul>
        </div>
      </div>
    </div>
  );
}; 