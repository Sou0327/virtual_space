import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthState } from '../types';
import { authAPI } from '../utils/api';

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    username: string;
    displayName: string;
    password: string;
    userType: 'influencer' | 'fan';
  }) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          console.log('🔄 Attempting login...', { email });
          const response = await authAPI.login({ email, password });
          console.log('✅ Login response:', response.data);
          
          const { token, user } = response.data.data;
          
          localStorage.setItem('fanverse_token', token);
          localStorage.setItem('fanverse_user', JSON.stringify(user));
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          console.error('❌ Login error:', error);
          console.error('Error response:', error.response?.data);
          set({ isLoading: false });
          throw new Error(error.response?.data?.message || 'ログインに失敗しました');
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        try {
          console.log('🔄 Attempting registration...', { 
            email: userData.email, 
            username: userData.username,
            userType: userData.userType 
          });
          
          const response = await authAPI.register(userData);
          console.log('✅ Registration response:', response.data);
          
          const { token, user } = response.data.data;
          
          localStorage.setItem('fanverse_token', token);
          localStorage.setItem('fanverse_user', JSON.stringify(user));
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          console.error('❌ Registration error:', error);
          console.error('Error response:', error.response?.data);
          console.error('Error status:', error.response?.status);
          console.error('Error config:', error.config);
          set({ isLoading: false });
          
          let errorMessage = '登録に失敗しました';
          if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          throw new Error(errorMessage);
        }
      },

      logout: () => {
        localStorage.removeItem('fanverse_token');
        localStorage.removeItem('fanverse_user');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setUser: (user: User) => {
        set({ user });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'fanverse-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
); 