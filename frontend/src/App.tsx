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
import { InfluencerRoomBuilder } from './components/three/InfluencerRoomBuilder';

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
  | 'dashboard'
  | 'room-builder';

const App: React.FC = () => {
  const [currentScene, setCurrentScene] = useState<SceneType>('text-to-3d');
  const [showSceneMenu, setShowSceneMenu] = useState(false);

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
    },
    'room-builder': {
      name: '🏠 ルームビルダー',
      description: 'Influencer Room Builder',
      component: <InfluencerRoomBuilder />
    }
  };

  // 3Dシーンの場合はRouterを使わない
  if (currentScene !== 'dashboard') {
    return (
      <div className="w-full h-screen bg-gray-900 text-white relative">
        {/* シーン切り替えボタン（小さなトリガー） */}
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={() => setShowSceneMenu(!showSceneMenu)}
            onMouseEnter={() => setShowSceneMenu(true)}
            className="bg-black bg-opacity-80 hover:bg-opacity-100 text-white p-2 rounded-lg transition-all duration-200 shadow-lg border border-gray-600"
          >
            <div className="flex items-center space-x-2">
              <span className="text-lg">🎬</span>
              <span className="text-xs font-medium">切替</span>
            </div>
          </button>

          {/* シーン選択メニュー（ホバー/クリック時のみ表示） */}
          {showSceneMenu && (
            <div
              className="absolute top-12 left-0 bg-black bg-opacity-95 p-4 rounded-lg shadow-xl border border-gray-600 min-w-80"
              onMouseLeave={() => setShowSceneMenu(false)}
            >
              <h2 className="text-sm font-bold mb-3 text-gray-300">🎬 FanVerse 3D Systems</h2>
              <div className="space-y-2">
                {Object.entries(scenes).map(([key, scene]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setCurrentScene(key as SceneType);
                      setShowSceneMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded transition-all text-sm ${currentScene === key
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
              <div className="mt-3 p-2 bg-gray-800 rounded">
                <div className="text-xs font-medium text-blue-300">現在:</div>
                <div className="text-sm font-bold">{scenes[currentScene].name}</div>
              </div>
            </div>
          )}
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
