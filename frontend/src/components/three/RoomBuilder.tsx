import React, { useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Components
import CameraControls from './CameraControls';
import ObjectCreationPanel from './ObjectCreationPanel';
import { RoomEnvironment } from './RoomEnvironment';
import { ModelPanels } from './ModelPanels';

// UI Components
import { ControlPanel } from './ui/ControlPanel';
import { ProgressOverlay } from './ui/ProgressOverlay';
import { VisitorGuide } from './ui/VisitorGuide';

// Hooks
import { useRoomState } from '../../hooks/useRoomState';
import { useModelManager } from '../../hooks/useModelManager';
import useAIModelGenerator from '../../hooks/useAIModelGenerator';

// Types
import type { RoomConfig } from '../../types/room';

const RoomBuilder: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const spaceId = searchParams.get('spaceId');

  // 状態管理フック
  const roomState = useRoomState();
  const modelManager = useModelManager(
    roomState.getObjectHeight,
    roomState.addObjectToRoom
  );

  // AI生成フック
  const { isGenerating, generateProgress, generateAIObject } = useAIModelGenerator(
    roomState.getObjectHeight,
    roomState.addObjectToRoom,
    modelManager.addGeneratedModel
  );

  // その他の状態
  const [isFullscreen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // スペース保存
  const saveSpace = useCallback(async () => {
    if (!spaceId) return;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/spaces/${spaceId}/room-config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomState.roomConfig)
      });
      if (response.ok) {
        console.log('💾 Room configuration saved');
      }
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  }, [spaceId, roomState.roomConfig]);

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (roomState.isCreatePanelOpen || roomState.isObjectManagerOpen || roomState.isEditPanelOpen) return;

      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      switch (event.key.toLowerCase()) {
        case 'g':
          if (roomState.selectedObjectId) {
            roomState.setEditMode('translate');
            event.preventDefault();
          }
          break;
        case 'r':
          if (roomState.selectedObjectId) {
            roomState.setEditMode('rotate');
            event.preventDefault();
          }
          break;
        case 's':
          if (roomState.selectedObjectId) {
            roomState.setEditMode('scale');
            event.preventDefault();
          }
          break;
        case 'delete':
        case 'backspace':
          if (roomState.selectedObjectId) {
            roomState.deleteObject(roomState.selectedObjectId);
            event.preventDefault();
          }
          break;
        case 'h':
          roomState.setShowGrid(!roomState.showGrid);
          event.preventDefault();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [roomState]);

  return (
    <div className="w-full h-screen bg-gray-900">
      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ fov: 75, position: [0, 1.6, 5] }}
        onPointerMissed={() => {
          if (!roomState.isCreatePanelOpen) {
            roomState.setSelectedObjectId(null);
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
          config={roomState.roomConfig}
          selectedObjectId={roomState.viewMode === 'visitor' ? null : roomState.selectedObjectId}
          onObjectSelect={roomState.viewMode === 'visitor' ? () => { } : roomState.setSelectedObjectId}
          onObjectTransform={(id, position, rotation, scale) => {
            if (roomState.viewMode === 'visitor') return;
            roomState.updateObjectTransform(id, position, rotation, scale);
          }}
          isPointerLocked={false}
          editMode={roomState.editMode}
          showGrid={roomState.showGrid}
          gridSize={0.5}
        />

        {/* Camera Controls */}
        <CameraControls
          viewMode={roomState.viewMode}
          disabled={roomState.isCreatePanelOpen || roomState.isObjectManagerOpen || roomState.isEditPanelOpen}
          onPointerLockChange={roomState.setIsPointerLocked}
        />
      </Canvas>

      {/* UI Components */}
      <VisitorGuide
        viewMode={roomState.viewMode}
        isPointerLocked={roomState.isPointerLocked}
        onViewModeChange={roomState.setViewMode}
      />

      <ProgressOverlay
        progress={generateProgress}
        visible={generateProgress.percentage > 0}
      />

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
      {roomState.viewMode === 'creator' && (
        <button
          onClick={() => roomState.setIsCreatePanelOpen(true)}
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
      )}

      {/* Control Panel - クリエイターモードのみ */}
      {roomState.viewMode === 'creator' && (
        <ControlPanel
          viewMode={roomState.viewMode}
          selectedObjectId={roomState.selectedObjectId}
          roomObjects={roomState.roomConfig.objects}
          editMode={roomState.editMode}
          showGrid={roomState.showGrid}
          onViewModeChange={roomState.setViewMode}
          onEditModeChange={roomState.setEditMode}
          onShowGridToggle={() => roomState.setShowGrid(!roomState.showGrid)}
          onObjectManagerOpen={() => roomState.setIsObjectManagerOpen(true)}
          onDeleteObject={roomState.deleteObject}
        />
      )}

      {/* Model Panels */}
      <ModelPanels
        isFullscreen={isFullscreen}
        uploadedModels={modelManager.uploadedModels}
        generatedModels={modelManager.generatedModels}
        onFetchUploadedModels={modelManager.fetchUploadedModels}
        onUseUploadedModel={modelManager.useUploadedModel}
        onReuseGeneratedModel={modelManager.reuseGeneratedModel}
        onClearGeneratedModels={modelManager.clearGeneratedModels}
      />

      {/* Object Creation Panel */}
      <ObjectCreationPanel
        isOpen={roomState.isCreatePanelOpen}
        onClose={() => roomState.setIsCreatePanelOpen(false)}
        onCreateObject={(prompt: string) => generateAIObject(prompt, 'meshy')}
        isGenerating={isGenerating}
      />

      {/* Object Manager Panel */}
      {roomState.isObjectManagerOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              roomState.setIsObjectManagerOpen(false);
            }
          }}>
          <div className="bg-black/90 backdrop-blur-sm rounded-lg p-6 max-w-2xl w-full max-h-[80vh] mx-4 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}>

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">🎯 配置済みオブジェクト管理</h2>
              <button
                onClick={() => roomState.setIsObjectManagerOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-gray-800 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">📊 合計オブジェクト: <span className="text-white font-bold">{roomState.roomConfig.objects.length}</span></span>
                <span className="text-gray-300">✅ 選択中: <span className="text-green-400">{roomState.selectedObjectId ? roomState.roomConfig.objects.find(obj => obj.id === roomState.selectedObjectId)?.name || 'Unknown' : 'なし'}</span></span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {roomState.roomConfig.objects.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>📭 配置されたオブジェクトがありません</p>
                  <p className="text-sm mt-2">右下のプラスボタンでオブジェクトを作成してみましょう</p>
                </div>
              ) : (
                roomState.roomConfig.objects.map((obj, index) => (
                  <div
                    key={obj.id}
                    className={`bg-gray-800 rounded-lg p-3 border-2 transition-all ${roomState.selectedObjectId === obj.id ? 'border-green-500 bg-gray-750' : 'border-transparent hover:border-gray-600'}`}
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
                          roomState.setSelectedObjectId(obj.id);
                          roomState.setIsObjectManagerOpen(false);
                        }}
                        className="flex-1 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                      >
                        🎯 選択
                      </button>
                      <button
                        onClick={() => {
                          const newName = prompt('新しい名前を入力:', obj.name);
                          if (newName && newName.trim()) {
                            roomState.renameObject(obj.id, newName.trim());
                          }
                        }}
                        className="px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 transition-colors"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => roomState.duplicateObject(obj.id)}
                        className="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors"
                      >
                        📋
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`「${obj.name}」を削除しますか？`)) {
                            roomState.deleteObject(obj.id);
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
                      roomState.setRoomConfig(prev => ({ ...prev, objects: [] }));
                      roomState.setSelectedObjectId(null);
                      roomState.setIsObjectManagerOpen(false);
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                >
                  🗑️ 全削除
                </button>
                <button
                  onClick={() => roomState.setIsObjectManagerOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomBuilder; 