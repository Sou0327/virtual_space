import { useState, useEffect, useCallback } from 'react';
import type { UploadedModel, GeneratedModel, RoomObject } from '../types/room';

export const useModelManager = (
  getObjectHeight: (type: string) => number,
  addObjectToRoom: (object: RoomObject) => void
) => {
  const [uploadedModels, setUploadedModels] = useState<UploadedModel[]>([]);
  const [generatedModels, setGeneratedModels] = useState<GeneratedModel[]>([]);

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

  // 生成済みモデル追加
  const addGeneratedModel = useCallback((model: GeneratedModel) => {
    setGeneratedModels(prev => {
      const updated = [model, ...prev];
      localStorage.setItem('fanverse-generated-models', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // アップロード済みモデルを部屋に配置
  const useUploadedModel = useCallback((model: UploadedModel, customName?: string) => {
    const objectName = customName || `GLBモデル_${model.taskId.slice(-4)}`;
    const newObject: RoomObject = {
      id: `uploaded-${Date.now()}`,
      type: 'custom',
      name: objectName,
      position: [
        Math.random() * 6 - 3,
        getObjectHeight('custom'),
        Math.random() * 6 - 3
      ],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      modelUrl: model.devUrl,
      generated: false
    };

    addObjectToRoom(newObject);
  }, [getObjectHeight, addObjectToRoom]);

  // 生成済みモデル再利用
  const reuseGeneratedModel = useCallback((model: GeneratedModel) => {
    const newObject: RoomObject = {
      id: `reused-${Date.now()}`,
      type: model.type || 'custom',
      name: model.name,
      position: [
        Math.random() * 6 - 3,
        getObjectHeight(model.type || 'custom'),
        Math.random() * 6 - 3
      ],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      modelUrl: model.modelUrl,
      generated: true
    };

    addObjectToRoom(newObject);
  }, [getObjectHeight, addObjectToRoom]);

  // 生成済みモデル全削除
  const clearGeneratedModels = useCallback(() => {
    localStorage.removeItem('fanverse-generated-models');
    setGeneratedModels([]);
  }, []);

  // 初期化
  useEffect(() => {
    fetchUploadedModels();
    const saved = JSON.parse(localStorage.getItem('fanverse-generated-models') || '[]');
    setGeneratedModels(saved);
  }, [fetchUploadedModels]);

  return {
    uploadedModels,
    generatedModels,
    fetchUploadedModels,
    addGeneratedModel,
    useUploadedModel,
    reuseGeneratedModel,
    clearGeneratedModels
  };
}; 