export interface User {
  id: number;
  email: string;
  username: string;
  displayName: string;
  userType: 'influencer' | 'fan';
  avatar?: string;
  bio?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    youtube?: string;
    website?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface VirtualSpace {
  id: number;
  userId: number;
  title: string;
  description?: string;
  template: SpaceTemplate;
  customization: SpaceCustomization;
  isPublic: boolean;
  visitCount: number;
  username?: string;
  displayName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SpaceTemplate {
  id: string;
  name: string;
  type: 'room' | 'stage' | 'gallery' | 'outdoor' | 'futuristic' | 'social' | 'custom';
  description?: string;
  preview: string;
  features?: string[];
}

export interface SpaceCustomization {
  wallTexture?: string;
  floorTexture?: string;
  lighting?: {
    ambientColor: string;
    directionalColor: string;
    intensity: number;
  };
  objects: SpaceObject[];
  content: SpaceContent[];
}

export interface SpaceObject {
  id: string;
  type: 'furniture' | 'decoration' | 'interactive';
  name: string;
  model: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
  };
  scale: {
    x: number;
    y: number;
    z: number;
  };
}

export interface SpaceContent {
  id: string;
  type: 'image' | 'text' | 'link' | 'video';
  title?: string;
  content: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
  };
  isVisible: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: Date;
  spaceId: string;
} 