import React from 'react';
import type { ViewMode, EditMode, RoomObject } from '../../../types/room';

interface ControlPanelProps {
  viewMode: ViewMode;
  selectedObjectId: string | null;
  roomObjects: RoomObject[];
  editMode: EditMode;
  showGrid: boolean;
  wallMaterial: string;
  floorMaterial: string;
  onViewModeChange: (mode: ViewMode) => void;
  onEditModeChange: (mode: EditMode) => void;
  onShowGridToggle: () => void;
  onObjectManagerOpen: () => void;
  onDeleteObject: (id: string) => void;
  onWallMaterialChange: (material: string) => void;
  onFloorMaterialChange: (material: string) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  viewMode,
  selectedObjectId,
  roomObjects,
  editMode,
  showGrid,
  wallMaterial,
  floorMaterial,
  onViewModeChange,
  onEditModeChange,
  onShowGridToggle,
  onObjectManagerOpen,
  onDeleteObject,
  onWallMaterialChange,
  onFloorMaterialChange
}) => {
  const selectedObject = selectedObjectId
    ? roomObjects.find(obj => obj.id === selectedObjectId)
    : null;

  return (
    <div className="fixed bottom-6 left-6 z-40 bg-black/90 backdrop-blur-sm rounded-lg p-4 text-white max-w-xs">
      <h3 className="text-sm font-bold mb-3 text-blue-400">🎮 操作パネル</h3>

      {/* View Mode Toggle */}
      <div className="mb-3">
        <label className="block text-xs text-gray-300 mb-2">🎥 視点モード</label>
        <div className="flex space-x-2">
          <button
            onClick={() => onViewModeChange('creator')}
            className={`px-3 py-1 rounded text-xs transition-colors ${viewMode === 'creator'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-600 text-gray-300'
              }`}
          >
            🏗️ クリエイター
          </button>
          <button
            onClick={() => onViewModeChange('visitor')}
            className={`px-3 py-1 rounded text-xs transition-colors ${viewMode === 'visitor'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-600 text-gray-300'
              }`}
          >
            👤 ビジター
          </button>
        </div>
      </div>

      {/* Selected Object Info */}
      {selectedObject && (
        <div className="mb-3 p-2 bg-green-600/20 rounded border border-green-500/30">
          <div className="text-xs text-green-400">
            選択中: {selectedObject.name}
          </div>
        </div>
      )}

  {/* Object Count */}
  <div className="mb-3 text-xs text-gray-300">
    配置済み: {roomObjects.length} 個
  </div>

  {/* Environment Settings */}
  <div className="mb-3 space-y-2">
    <div>
      <label className="block text-xs text-gray-300 mb-1">🧱 壁素材</label>
      <select
        value={wallMaterial}
        onChange={(e) => onWallMaterialChange(e.target.value)}
        className="w-full bg-gray-700 rounded text-xs px-2 py-1"
      >
        <option value="concrete">コンクリート</option>
        <option value="brick">レンガ</option>
        <option value="wood">木材</option>
      </select>
    </div>
    <div>
      <label className="block text-xs text-gray-300 mb-1">🪵 床素材</label>
      <select
        value={floorMaterial}
        onChange={(e) => onFloorMaterialChange(e.target.value)}
        className="w-full bg-gray-700 rounded text-xs px-2 py-1"
      >
        <option value="wood">木材</option>
        <option value="tile">タイル</option>
        <option value="concrete">コンクリート</option>
      </select>
    </div>
  </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <button
          onClick={onShowGridToggle}
          className={`px-2 py-1 rounded text-xs transition-colors ${showGrid ? 'bg-green-600' : 'bg-gray-600'
            }`}
        >
          🔲 グリッド
        </button>
        <button
          onClick={onObjectManagerOpen}
          className="px-2 py-1 bg-purple-600 rounded text-xs hover:bg-purple-700 transition-colors"
        >
          📦 管理
        </button>

        {selectedObjectId && (
          <>
            <button
              onClick={() => onEditModeChange('translate')}
              className={`px-2 py-1 rounded text-xs transition-colors ${editMode === 'translate' ? 'bg-blue-600' : 'bg-gray-600'
                }`}
            >
              📍 移動
            </button>
            <button
              onClick={() => onEditModeChange('rotate')}
              className={`px-2 py-1 rounded text-xs transition-colors ${editMode === 'rotate' ? 'bg-blue-600' : 'bg-gray-600'
                }`}
            >
              🔄 回転
            </button>
            <button
              onClick={() => onEditModeChange('scale')}
              className={`px-2 py-1 rounded text-xs transition-colors ${editMode === 'scale' ? 'bg-blue-600' : 'bg-gray-600'
                }`}
            >
              📏 拡縮
            </button>
            <button
              onClick={() => {
                if (confirm('このオブジェクトを削除しますか？')) {
                  onDeleteObject(selectedObjectId);
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
  );
}; 