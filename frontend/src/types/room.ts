// Room関連の型定義
export interface RoomConfig {
  wallMaterial: string;
  floorMaterial: string;
  wallTexture?: string;
  floorTexture?: string;
  objects: RoomObject[];
}

export interface RoomObject {
  id: string;
  type: string;
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  modelUrl?: string;
  generated?: boolean;
}

export interface UploadedModel {
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

export interface GeneratedModel {
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

export type ViewMode = 'creator' | 'visitor';
export type EditMode = 'translate' | 'rotate' | 'scale';

export interface GenerateProgress {
  percentage: number;
  stage: 'idle' | 'analyze' | 'generate' | 'process' | 'refine' | 'completed';
  message: string;
} 