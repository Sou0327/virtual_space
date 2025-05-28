import { Request } from 'express';
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
    createdAt: Date;
    updatedAt: Date;
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
    createdAt: Date;
    updatedAt: Date;
}
export interface SpaceTemplate {
    id: string;
    name: string;
    type: 'room' | 'stage' | 'gallery' | 'outdoor' | 'futuristic' | 'social';
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
export interface ChatMessage {
    id: number;
    spaceId: number;
    userId?: number;
    username: string;
    message: string;
    timestamp: Date;
}
export interface Reaction {
    id: number;
    spaceId: number;
    userId?: number;
    type: 'like' | 'love' | 'wow' | 'applause';
    targetType: 'space' | 'content' | 'object';
    targetId: string;
    timestamp: Date;
}
export interface PurchaseItem {
    id: number;
    userId: number;
    type: 'decoration' | 'space_upgrade' | 'support_item';
    itemId: string;
    itemName: string;
    price: number;
    timestamp: Date;
}
export interface AuthRequest extends Request {
    user?: User;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}
//# sourceMappingURL=index.d.ts.map