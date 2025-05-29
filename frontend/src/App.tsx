import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SimpleHomePage } from './pages/SimpleHomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { React19TestPage } from './pages/React19TestPage';
import { useAuthStore } from './stores/authStore';
import { AIEnhanced3DShowroom } from './components/three/AIEnhancedShowroom';
import { TextTo3DGenerator } from './components/three/TextTo3DGenerator';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  return isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/login" replace />
  );
};

type SceneType =
  | 'ai-enhanced'
  | 'text-to-3d'
  | 'dashboard';

const App: React.FC = () => {
  const [currentScene, setCurrentScene] = useState<SceneType>('text-to-3d');

  const scenes = {
    'ai-enhanced': {
      name: '🤖 AI強化',
      description: 'AIテクスチャ・3Dモデル生成統合',
      component: <AIEnhanced3DShowroom />
    },
    'text-to-3d': {
      name: '🎯 Text-to-3D',
      description: 'テキストから3Dモデル生成特化システム',
      component: <TextTo3DGenerator />
    },
    'dashboard': {
      name: '📊 FanVerse App',
      description: '通常のFanVerseアプリケーション',
      component: (
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<SimpleHomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/react19test" element={<React19TestPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      )
    }
  };

  // 3Dシーンの場合はRouterを使わない
  if (currentScene !== 'dashboard') {
    return (
      <div className="w-full h-screen bg-gray-900 text-white relative">
        {/* シーン選択メニュー */}
        <div className="fixed top-4 left-4 z-50 bg-black bg-opacity-90 p-4 rounded-lg">
          <h2 className="text-lg font-bold mb-3">🎬 FanVerse 3D Systems</h2>
          <div className="space-y-2">
            {Object.entries(scenes).map(([key, scene]) => (
              <button
                key={key}
                onClick={() => setCurrentScene(key as SceneType)}
                className={`w-full text-left px-3 py-2 rounded transition-all ${currentScene === key
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
              >
                <div className="font-medium">{scene.name}</div>
                <div className="text-xs text-gray-400">{scene.description}</div>
              </button>
            ))}
          </div>

          {/* 現在のシーン情報 */}
          <div className="mt-4 p-3 bg-gray-800 rounded">
            <div className="text-sm font-medium text-blue-300">現在のシステム:</div>
            <div className="text-lg font-bold">{scenes[currentScene].name}</div>
            <div className="text-xs text-gray-400">{scenes[currentScene].description}</div>
          </div>
        </div>

        {/* 現在のシーンを表示 */}
        {scenes[currentScene].component}
      </div>
    );
  }

  // 通常のFanVerseアプリ
  return scenes[currentScene].component;
};

export default App;
