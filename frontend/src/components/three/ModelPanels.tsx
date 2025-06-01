import React from 'react';

interface UploadedModel {
  id: string;
  filename: string;
  taskId: string;
  size: number;
  sizeFormatted: string;
  createdAt: string;
  modifiedAt: string;
  url: string;
  devUrl: string;
}

interface GeneratedModel {
  id: string;
  name: string;
  prompt?: string;
  type?: string;
  modelUrl: string;
  textureUrl?: string;
  createdAt: Date | string;
  aiService?: string;
  taskId?: string;
}

interface ModelPanelsProps {
  isFullscreen: boolean;
  uploadedModels: UploadedModel[];
  generatedModels: GeneratedModel[];
  onFetchUploadedModels: () => void;
  onUseUploadedModel: (model: UploadedModel) => void;
  onReuseGeneratedModel: (model: GeneratedModel) => void;
  onClearGeneratedModels: () => void;
}

export const ModelPanels: React.FC<ModelPanelsProps> = ({
  isFullscreen,
  uploadedModels,
  generatedModels,
  onFetchUploadedModels,
  onUseUploadedModel,
  onReuseGeneratedModel,
  onClearGeneratedModels
}) => {
  return (
    <>
      {/* Generated Models Panel (開発用) - 最優先表示 */}
      {!isFullscreen && false && generatedModels.length > 0 && (
        <div className="fixed top-4 right-4 bg-black/90 backdrop-blur-sm rounded-lg p-4 text-white max-w-xs z-50">
          <h3 className="font-bold mb-3 text-sm">🗃️ 生成済みモデル ({generatedModels.length})</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {generatedModels.map((model) => (
              <div key={model.id} className="bg-gray-800 rounded p-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-green-400">{model.name}</span>
                  <span className="text-xs text-gray-400">{model.type}</span>
                </div>
                <div className="text-xs text-gray-500 mb-1">
                  {new Date(model.createdAt).toLocaleString('ja-JP', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                {/* URL情報表示 */}
                <div className="text-xs text-blue-400 mb-2 truncate" title={model.modelUrl}>
                  {model.modelUrl.includes('/api/ai/proxy-model/') ? (
                    <span>🔄 Proxy: {model.taskId?.slice(-8) || 'N/A'}...</span>
                  ) : model.modelUrl.includes('/uploads/') ? (
                    <span>📁 Upload: {model.modelUrl.split('/').pop()?.slice(0, 12)}...</span>
                  ) : (
                    <span>🌐 URL: {model.modelUrl.slice(0, 20)}...</span>
                  )}
                </div>
                <button
                  onClick={() => onReuseGeneratedModel(model)}
                  className="w-full px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 flex items-center justify-center"
                >
                  ♻️ 再配置
                </button>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-600">
            <button
              onClick={onClearGeneratedModels}
              className="w-full px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
            >
              🗑️ キャッシュクリア
            </button>
            <div className="mt-2 text-xs text-gray-400">
              💡 保存場所: LocalStorage + Meshyサーバー (プロキシ経由)
            </div>
          </div>
        </div>
      )}

      {/* Uploaded Models Panel (開発者向け) - 全件表示対応、表示復活 */}
      {!isFullscreen && uploadedModels.length > 0 && (
        <div className="fixed top-4 bg-black/90 backdrop-blur-sm rounded-lg p-3 text-white max-w-xs z-40" style={{
          right: generatedModels.length > 0 ? '360px' : '16px'
        }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm">📁 過去のオブジェクト ({uploadedModels.length})</h3>
            <button
              onClick={onFetchUploadedModels}
              className="px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-500"
              title="再読み込み"
            >
              🔄
            </button>
          </div>

          {/* 全件表示対応のスクロール可能エリア */}
          <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            {uploadedModels
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) // 最新順
              .map((model, index) => (
                <div key={model.id} className="bg-gray-800 rounded p-2 hover:bg-gray-750 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-blue-400">#{index + 1}</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-gray-400">{model.sizeFormatted}</span>
                      {new Date(model.createdAt).getTime() > Date.now() - 3600000 && (
                        <span className="text-xs bg-green-600 text-white px-1 rounded" title="1時間以内に作成">NEW</span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-300 mb-2 truncate" title={model.filename}>
                    {model.filename.replace('meshy_', '').replace('.glb', '')}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    {new Date(model.createdAt).toLocaleString('ja-JP', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <button
                    onClick={() => onUseUploadedModel(model)}
                    className="w-full px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700"
                    title="このオブジェクトを部屋に配置"
                  >
                    📦 配置
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </>
  );
};

export default ModelPanels; 