import React, { useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CameraControls from './CameraControls';
import ObjectCreationPanel from './ObjectCreationPanel';
import { RoomEnvironment } from './RoomEnvironment';
import { ModelPanels } from './ModelPanels';
import useAIModelGenerator from '../../hooks/useAIModelGenerator';

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

const RoomBuilder: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const spaceId = searchParams.get('spaceId');

  // 基本状態管理
  const [roomConfig, setRoomConfig] = useState<RoomConfig>({
    wallMaterial: 'concrete',
    floorMaterial: 'wood',
    objects: []
  });

  // UI状態管理
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<'translate' | 'rotate' | 'scale'>('translate');
  const [showGrid, setShowGrid] = useState(false);
  const [viewMode, setViewMode] = useState<'creator' | 'visitor'>('creator');
  const [isSaving, setIsSaving] = useState(false);

  // パネル状態管理
  const [isCreatePanelOpen, setIsCreatePanelOpen] = useState(false);
  const [isObjectManagerOpen, setIsObjectManagerOpen] = useState(false);
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);

  // モデル管理
  const [uploadedModels, setUploadedModels] = useState<UploadedModel[]>([]);
  const [generatedModels, setGeneratedModels] = useState<GeneratedModel[]>([]);

  // オブジェクトの高さ取得
  const getObjectHeight = useCallback((type: string): number => {
    switch (type) {
      case 'chair': return 1.0;
      case 'table': return 1.2;
      case 'lamp': return 1.5;
      case 'bookshelf': return 2.0;
      case 'custom': return 1.0;
      default: return 1.0;
    }
  }, []);

  // オブジェクト管理関数
  const addObjectToRoom = useCallback((object: any) => {
    setRoomConfig(prev => ({
      ...prev,
      objects: [...prev.objects, object]
    }));
  }, []);

  const addGeneratedModel = useCallback((model: GeneratedModel) => {
    setGeneratedModels(prev => {
      const updated = [model, ...prev];
      localStorage.setItem('fanverse-generated-models', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // AI生成フック
  const { isGenerating, generateProgress, generateAIObject } = useAIModelGenerator(
    getObjectHeight,
    addObjectToRoom,
    addGeneratedModel
  );

  // アップロード済みモデル取得
  const fetchUploadedModels = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3001/api/ai/dev/uploaded-models');
      if (response.ok) {
        const data = await response.json();
        const models = data.models || data;
        setUploadedModels(models);
      }
    } catch (error) {
      console.error('❌ アップロードモデル取得エラー:', error);
    }
  }, []);

  // アップロード済みモデルを部屋に配置
  const useUploadedModel = useCallback((model: UploadedModel, customName?: string) => {
    const objectName = customName || `GLBモデル_${model.taskId.slice(-4)}`;
    const newObject = {
      id: `uploaded-${Date.now()}`,
      type: 'custom',
      name: objectName,
      position: [
        Math.random() * 6 - 3,
        getObjectHeight('custom'),
        Math.random() * 6 - 3
      ] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      scale: [1, 1, 1] as [number, number, number],
      modelUrl: model.devUrl,
      generated: false
    };

    addObjectToRoom(newObject);
  }, [getObjectHeight, addObjectToRoom]);

  // 生成済みモデル再利用
  const reuseGeneratedModel = useCallback((model: GeneratedModel) => {
    const newObject = {
      id: `reused-${Date.now()}`,
      type: model.type || 'custom',
      name: model.name,
      position: [
        Math.random() * 6 - 3,
        getObjectHeight(model.type || 'custom'),
        Math.random() * 6 - 3
      ] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      scale: [1, 1, 1] as [number, number, number],
      modelUrl: model.modelUrl,
      generated: true
    };

    addObjectToRoom(newObject);
  }, [getObjectHeight, addObjectToRoom]);

  // オブジェクト編集関数
  const deleteObject = useCallback((objectId: string) => {
    setRoomConfig(prev => ({
      ...prev,
      objects: prev.objects.filter(obj => obj.id !== objectId)
    }));
    if (selectedObjectId === objectId) {
      setSelectedObjectId(null);
    }
  }, [selectedObjectId]);

  const duplicateObject = useCallback((objectId: string) => {
    const objectToDuplicate = roomConfig.objects.find(obj => obj.id === objectId);
    if (!objectToDuplicate) return;

    const newObject = {
      ...objectToDuplicate,
      id: `${objectToDuplicate.type}-${Date.now()}`,
      name: `${objectToDuplicate.name} (コピー)`,
      position: [
        objectToDuplicate.position[0] + 1,
        objectToDuplicate.position[1],
        objectToDuplicate.position[2] + 1
      ] as [number, number, number]
    };

    addObjectToRoom(newObject);
  }, [roomConfig.objects, addObjectToRoom]);

  const renameObject = useCallback((objectId: string, newName: string) => {
    setRoomConfig(prev => ({
      ...prev,
      objects: prev.objects.map(obj =>
        obj.id === objectId ? { ...obj, name: newName } : obj
      )
    }));
  }, []);

  // スペース保存
  const saveSpace = useCallback(async () => {
    if (!spaceId) return;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/spaces/${spaceId}/room-config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomConfig)
      });
      if (response.ok) {
        console.log('💾 Room configuration saved');
      }
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  }, [spaceId, roomConfig]);

  // 初期化
  useEffect(() => {
    fetchUploadedModels();
    const saved = JSON.parse(localStorage.getItem('fanverse-generated-models') || '[]');
    setGeneratedModels(saved);
  }, [fetchUploadedModels]);

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isCreatePanelOpen || isObjectManagerOpen || isEditPanelOpen) return;

      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      switch (event.key.toLowerCase()) {
        case 'g':
          if (selectedObjectId) {
            setEditMode('translate');
            event.preventDefault();
          }
          break;
        case 'r':
          if (selectedObjectId) {
            setEditMode('rotate');
            event.preventDefault();
          }
          break;
        case 's':
          if (selectedObjectId) {
            setEditMode('scale');
            event.preventDefault();
          }
          break;
        case 'delete':
        case 'backspace':
          if (selectedObjectId) {
            deleteObject(selectedObjectId);
            event.preventDefault();
          }
          break;
        case 'h':
          setShowGrid(!showGrid);
          event.preventDefault();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedObjectId, showGrid, isCreatePanelOpen, isObjectManagerOpen, isEditPanelOpen, deleteObject]);

  return (
    <div className="w-full h-screen bg-gray-900">
      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ fov: 75, position: [0, 1.6, 5] }}
        onPointerMissed={() => {
          if (!isCreatePanelOpen) {
            setSelectedObjectId(null);
          }
        }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[0, 3, 0]} intensity={0.5} />

        {/* Room Environment */}
        <RoomEnvironment
          config={roomConfig}
          selectedObjectId={selectedObjectId}
          onObjectSelect={setSelectedObjectId}
          onObjectTransform={(id, position, rotation, scale) => {
            setRoomConfig(prev => ({
              ...prev,
              objects: prev.objects.map(obj =>
                obj.id === id ? { ...obj, position, rotation, scale } : obj
              )
            }));
          }}
          isPointerLocked={false}
          editMode={editMode}
          showGrid={showGrid}
          gridSize={0.5}
        />

        {/* Camera Controls */}
        <CameraControls
          viewMode={viewMode}
          disabled={isCreatePanelOpen || isObjectManagerOpen || isEditPanelOpen}
        />
      </Canvas>

      {/* Navigation Header */}
      {!isFullscreen && (
        <div className="fixed top-4 left-4 z-50 bg-black/80 backdrop-blur-sm rounded-lg p-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-white hover:text-blue-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-sm">ダッシュボード</span>
            </button>
            {spaceId && (
              <>
                <div className="w-px h-4 bg-gray-600"></div>
                <button
                  onClick={saveSpace}
                  disabled={isSaving}
                  className="flex items-center space-x-2 text-white hover:text-green-400 transition-colors disabled:opacity-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-sm">{isSaving ? '保存中...' : '保存'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Object Creation Button */}
      <button
        onClick={() => setIsCreatePanelOpen(true)}
        disabled={isGenerating}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 flex items-center justify-center"
      >
        {isGenerating ? (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        ) : (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        )}
      </button>

      {/* Control Panel */}
      <div className="fixed bottom-6 left-6 z-40 bg-black/90 backdrop-blur-sm rounded-lg p-4 text-white max-w-xs">
        <h3 className="text-sm font-bold mb-3 text-blue-400">🎮 操作パネル</h3>

        {/* View Mode Toggle */}
        <div className="mb-3">
          <label className="block text-xs text-gray-300 mb-2">🎥 視点モード</label>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('creator')}
              className={`px-3 py-1 rounded text-xs transition-colors ${viewMode === 'creator' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'}`}
            >
              🏗️ クリエイター
            </button>
            <button
              onClick={() => setViewMode('visitor')}
              className={`px-3 py-1 rounded text-xs transition-colors ${viewMode === 'visitor' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'}`}
            >
              👤 ビジター
            </button>
          </div>
        </div>

        {/* Selected Object Info */}
        {selectedObjectId && (
          <div className="mb-3 p-2 bg-green-600/20 rounded border border-green-500/30">
            <div className="text-xs text-green-400">
              選択中: {roomConfig.objects.find(obj => obj.id === selectedObjectId)?.name || 'Unknown'}
            </div>
          </div>
        )}

        {/* Object Count */}
        <div className="mb-3 text-xs text-gray-300">
          配置済み: {roomConfig.objects.length} 個
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`px-2 py-1 rounded text-xs transition-colors ${showGrid ? 'bg-green-600' : 'bg-gray-600'}`}
          >
            🔲 グリッド
          </button>
          <button
            onClick={() => setIsObjectManagerOpen(true)}
            className="px-2 py-1 bg-purple-600 rounded text-xs hover:bg-purple-700 transition-colors"
          >
            📦 管理
          </button>
          {selectedObjectId && (
            <>
              <button
                onClick={() => setEditMode('translate')}
                className={`px-2 py-1 rounded text-xs transition-colors ${editMode === 'translate' ? 'bg-blue-600' : 'bg-gray-600'}`}
              >
                📍 移動
              </button>
              <button
                onClick={() => setEditMode('rotate')}
                className={`px-2 py-1 rounded text-xs transition-colors ${editMode === 'rotate' ? 'bg-blue-600' : 'bg-gray-600'}`}
              >
                🔄 回転
              </button>
              <button
                onClick={() => setEditMode('scale')}
                className={`px-2 py-1 rounded text-xs transition-colors ${editMode === 'scale' ? 'bg-blue-600' : 'bg-gray-600'}`}
              >
                📏 拡縮
              </button>
              <button
                onClick={() => {
                  if (confirm('このオブジェクトを削除しますか？')) {
                    deleteObject(selectedObjectId);
                  }
                }}
                className="px-2 py-1 bg-red-600 rounded text-xs hover:bg-red-700 transition-colors"
              >
                🗑️ 削除
              </button>
            </>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {generateProgress.percentage > 0 && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/90 backdrop-blur-sm rounded-lg p-6 text-white max-w-md w-full mx-4 z-50">
          <div className="text-center mb-4">
            <h3 className="text-lg font-bold">{generateProgress.stage === 'completed' ? '✅ 生成完了！' : '🤖 AI生成中...'}</h3>
            <p className="text-sm text-gray-300 mt-1">{generateProgress.message}</p>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${generateProgress.stage === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`}
              style={{ width: `${generateProgress.percentage}%` }}
            ></div>
          </div>
          <div className="text-center text-xs text-gray-400">
            {generateProgress.percentage}% - {generateProgress.stage}
          </div>
        </div>
      )}

      {/* Model Panels */}
      <ModelPanels
        isFullscreen={isFullscreen}
        uploadedModels={uploadedModels}
        generatedModels={generatedModels}
        onFetchUploadedModels={fetchUploadedModels}
        onUseUploadedModel={useUploadedModel}
        onReuseGeneratedModel={reuseGeneratedModel}
        onClearGeneratedModels={() => {
          localStorage.removeItem('fanverse-generated-models');
          setGeneratedModels([]);
        }}
      />

      {/* Object Creation Panel */}
      <ObjectCreationPanel
        isOpen={isCreatePanelOpen}
        onClose={() => setIsCreatePanelOpen(false)}
        onCreateObject={(prompt: string) => generateAIObject(prompt, 'meshy')}
        isGenerating={isGenerating}
      />

      {/* Object Manager Panel */}
      {isObjectManagerOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsObjectManagerOpen(false);
            }
          }}>
          <div className="bg-black/90 backdrop-blur-sm rounded-lg p-6 max-w-2xl w-full max-h-[80vh] mx-4 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}>

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">🎯 配置済みオブジェクト管理</h2>
              <button
                onClick={() => setIsObjectManagerOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-gray-800 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">📊 合計オブジェクト: <span className="text-white font-bold">{roomConfig.objects.length}</span></span>
                <span className="text-gray-300">✅ 選択中: <span className="text-green-400">{selectedObjectId ? roomConfig.objects.find(obj => obj.id === selectedObjectId)?.name || 'Unknown' : 'なし'}</span></span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {roomConfig.objects.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>📭 配置されたオブジェクトがありません</p>
                  <p className="text-sm mt-2">右下のプラスボタンでオブジェクトを作成してみましょう</p>
                </div>
              ) : (
                roomConfig.objects.map((obj, index) => (
                  <div
                    key={obj.id}
                    className={`bg-gray-800 rounded-lg p-3 border-2 transition-all ${selectedObjectId === obj.id ? 'border-green-500 bg-gray-750' : 'border-transparent hover:border-gray-600'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">#{index + 1}</span>
                        <span className="text-sm font-medium text-white">{obj.name}</span>
                        <span className="text-xs text-gray-400">({obj.type})</span>
                        {obj.generated && <span className="text-xs bg-blue-600 text-white px-1 rounded">AI</span>}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedObjectId(obj.id);
                          setIsObjectManagerOpen(false);
                        }}
                        className="flex-1 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                      >
                        🎯 選択
                      </button>
                      <button
                        onClick={() => {
                          const newName = prompt('新しい名前を入力:', obj.name);
                          if (newName && newName.trim()) {
                            renameObject(obj.id, newName.trim());
                          }
                        }}
                        className="px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 transition-colors"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => duplicateObject(obj.id)}
                        className="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors"
                      >
                        📋
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`「${obj.name}」を削除しますか？`)) {
                            deleteObject(obj.id);
                          }
                        }}
                        className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-600">
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    if (confirm('全てのオブジェクトを削除しますか？')) {
                      setRoomConfig(prev => ({ ...prev, objects: [] }));
                      setSelectedObjectId(null);
                      setIsObjectManagerOpen(false);
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                >
                  🗑️ 全削除
                </button>
                <button
                  onClick={() => setIsObjectManagerOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Object Edit Panel */}
      {isEditPanelOpen && selectedObjectId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsEditPanelOpen(false);
            }
          }}>
          <div className="bg-black/90 backdrop-blur-sm rounded-lg p-6 max-w-md w-full mx-4 border border-white/20"
            onClick={(e) => e.stopPropagation()}>

            {(() => {
              const selectedObject = roomConfig.objects.find(obj => obj.id === selectedObjectId);
              if (!selectedObject) {
                return (
                  <div className="text-center text-white">
                    <p>⚠️ オブジェクトが見つかりません</p>
                    <button
                      onClick={() => setIsEditPanelOpen(false)}
                      className="mt-4 px-4 py-2 bg-gray-600 text-white rounded"
                    >
                      閉じる
                    </button>
                  </div>
                );
              }

              return (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">🔧 オブジェクト編集</h2>
                    <button
                      onClick={() => setIsEditPanelOpen(false)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-3 mb-4">
                    <div className="text-sm text-gray-300 mb-2">
                      <span className="font-medium text-white">{selectedObject.name}</span>
                      <span className="text-gray-400 ml-2">({selectedObject.type})</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">編集モード</label>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditMode('translate')}
                        className={`px-3 py-2 rounded text-sm transition-colors ${editMode === 'translate' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                      >
                        📍 移動
                      </button>
                      <button
                        onClick={() => setEditMode('rotate')}
                        className={`px-3 py-2 rounded text-sm transition-colors ${editMode === 'rotate' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                      >
                        🔄 回転
                      </button>
                      <button
                        onClick={() => setEditMode('scale')}
                        className={`px-3 py-2 rounded text-sm transition-colors ${editMode === 'scale' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                      >
                        📏 スケール
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">名前</label>
                    <input
                      type="text"
                      value={selectedObject.name}
                      onChange={(e) => renameObject(selectedObjectId, e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => duplicateObject(selectedObjectId)}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                    >
                      📋 複製
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`「${selectedObject.name}」を削除しますか？`)) {
                          deleteObject(selectedObjectId);
                          setIsEditPanelOpen(false);
                        }
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      🗑️ 削除
                    </button>
                    <button
                      onClick={() => setIsEditPanelOpen(false)}
                      className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                    >
                      閉じる
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomBuilder; 