import { create } from 'zustand';
import type { VirtualSpace, SpaceTemplate } from '../types';
import { spaceAPI } from '../utils/api';

interface SpaceStore {
  spaces: VirtualSpace[];
  currentSpace: VirtualSpace | null;
  templates: SpaceTemplate[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchTemplates: () => Promise<void>;
  fetchMySpaces: () => Promise<void>;
  fetchSpace: (spaceId: string) => Promise<void>;
  createSpace: (spaceData: {
    title: string;
    description?: string;
    templateId: string;
  }) => Promise<number>;
  updateSpace: (spaceId: string, spaceData: any) => Promise<void>;
  deleteSpace: (spaceId: string) => Promise<void>;
  setCurrentSpace: (space: VirtualSpace | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useSpaceStore = create<SpaceStore>((set, get) => ({
  spaces: [],
  currentSpace: null,
  templates: [],
  isLoading: false,
  error: null,

  fetchTemplates: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await spaceAPI.getTemplates();
      set({ templates: response.data.data.templates, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'テンプレートの取得に失敗しました',
        isLoading: false 
      });
    }
  },

  fetchMySpaces: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await spaceAPI.getMySpaces();
      set({ spaces: response.data.data.spaces, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || '空間の取得に失敗しました',
        isLoading: false 
      });
    }
  },

  fetchSpace: async (spaceId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await spaceAPI.getSpace(spaceId);
      set({ currentSpace: response.data.data.space, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || '空間の取得に失敗しました',
        isLoading: false 
      });
    }
  },

  createSpace: async (spaceData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await spaceAPI.createSpace(spaceData);
      const spaceId = response.data.data.spaceId;
      
      // Refresh spaces list
      await get().fetchMySpaces();
      
      set({ isLoading: false });
      return spaceId;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || '空間の作成に失敗しました',
        isLoading: false 
      });
      throw error;
    }
  },

  updateSpace: async (spaceId: string, spaceData: any) => {
    set({ isLoading: true, error: null });
    try {
      await spaceAPI.updateSpace(spaceId, spaceData);
      
      // Update current space if it's the one being updated
      const { currentSpace } = get();
      if (currentSpace && currentSpace.id.toString() === spaceId) {
        set({ currentSpace: { ...currentSpace, ...spaceData } });
      }
      
      // Refresh spaces list
      await get().fetchMySpaces();
      
      set({ isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || '空間の更新に失敗しました',
        isLoading: false 
      });
      throw error;
    }
  },

  deleteSpace: async (spaceId: string) => {
    set({ isLoading: true, error: null });
    try {
      await spaceAPI.deleteSpace(spaceId);
      
      // Remove from spaces list
      const { spaces } = get();
      set({ 
        spaces: spaces.filter(space => space.id.toString() !== spaceId),
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || '空間の削除に失敗しました',
        isLoading: false 
      });
      throw error;
    }
  },

  setCurrentSpace: (space: VirtualSpace | null) => {
    set({ currentSpace: space });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },
})); 