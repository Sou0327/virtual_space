import { useState, useCallback } from 'react';
import type { RoomConfig, RoomObject, ViewMode, EditMode } from '../types/room';

export const useRoomState = () => {
  // 基本状態管理
  const [roomConfig, setRoomConfig] = useState<RoomConfig>({
    wallMaterial: 'concrete',
    floorMaterial: 'wood',
    objects: []
  });

  // UI状態管理
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<EditMode>('translate');
  const [showGrid, setShowGrid] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('creator');
  const [isPointerLocked, setIsPointerLocked] = useState(false);

  // パネル状態管理
  const [isCreatePanelOpen, setIsCreatePanelOpen] = useState(false);
  const [isObjectManagerOpen, setIsObjectManagerOpen] = useState(false);
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);

  // オブジェクト管理関数
  const addObjectToRoom = useCallback((object: RoomObject) => {
    setRoomConfig(prev => ({
      ...prev,
      objects: [...prev.objects, object]
    }));
  }, []);

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

    const newObject: RoomObject = {
      ...objectToDuplicate,
      id: `${objectToDuplicate.type}-${Date.now()}`,
      name: `${objectToDuplicate.name} (コピー)`,
      position: [
        objectToDuplicate.position[0] + 1,
        objectToDuplicate.position[1],
        objectToDuplicate.position[2] + 1
      ]
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

  const updateObjectTransform = useCallback((
    id: string, 
    position: [number, number, number], 
    rotation: [number, number, number], 
    scale: [number, number, number]
  ) => {
    setRoomConfig(prev => ({
      ...prev,
      objects: prev.objects.map(obj =>
        obj.id === id ? { ...obj, position, rotation, scale } : obj
      )
    }));
  }, []);

  // オブジェクト高さ取得
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

  return {
    // 状態
    roomConfig,
    selectedObjectId,
    editMode,
    showGrid,
    viewMode,
    isPointerLocked,
    isCreatePanelOpen,
    isObjectManagerOpen,
    isEditPanelOpen,

    // セッター
    setRoomConfig,
    setSelectedObjectId,
    setEditMode,
    setShowGrid,
    setViewMode,
    setIsPointerLocked,
    setIsCreatePanelOpen,
    setIsObjectManagerOpen,
    setIsEditPanelOpen,

    // オブジェクト操作
    addObjectToRoom,
    deleteObject,
    duplicateObject,
    renameObject,
    updateObjectTransform,
    getObjectHeight
  };
}; 