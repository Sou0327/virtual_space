import React, { useState, useEffect } from 'react';
import { MinimalTest } from '../components/three/MinimalTest';
import { SimpleProceduralScene } from '../components/three/SimpleProceduralScene';
import { AdvancedProceduralScene } from '../components/three/AdvancedProceduralScene';
import { AIEnhanced3DShowroom } from '../components/three/AIEnhancedShowroom';

interface TestMode {
  id: string;
  name: string;
  description: string;
  component: React.ComponentType<any>;
  icon: string;
  difficulty: 'basic' | 'intermediate' | 'advanced' | 'experimental';
  features: string[];
}

const TEST_MODES: TestMode[] = [
  {
    id: 'minimal',
    name: '最小テスト',
    description: '基本的な3D表示とWebGL対応確認',
    component: MinimalTest,
    icon: '🔧',
    difficulty: 'basic',
    features: ['WebGL確認', '基本3Dオブジェクト', 'エラーハンドリング']
  },
  {
    id: 'simple-procedural',
    name: 'シンプル',
    description: 'シンプルなプロシージャル生成',
    component: SimpleProceduralScene,
    icon: '🌱',
    difficulty: 'intermediate',
    features: ['基本的な地形生成', 'チェックボックス操作', '軽量化']
  },
  {
    id: 'advanced-procedural',
    name: '高度プロシージャル',
    description: '複雑なプロシージャル生成システム',
    component: AdvancedProceduralScene,
    icon: '🌍',
    difficulty: 'advanced',
    features: ['高度な地形生成', 'バイオーム', '都市生成', 'WebGPU']
  },
  {
    id: 'ai-enhanced',
    name: 'AI強化',
    description: 'AI技術統合による3D品質向上',
    component: AIEnhanced3DShowroom,
    icon: '🤖',
    difficulty: 'experimental',
    features: ['AI テクスチャ生成', 'AI 3Dモデル', 'DALL-E 3', 'Meshy AI']
  }
];

export const TestPage: React.FC = () => {
  const [selectedMode, setSelectedMode] = useState<string>('minimal');
  const [apiStatus, setApiStatus] = useState<any>(null);

  const currentMode = TEST_MODES.find(mode => mode.id === selectedMode) || TEST_MODES[0];
  const CurrentComponent = currentMode.component;

  // API状態チェック
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/health');
        const data = await response.json();
        setApiStatus(data);
      } catch (error) {
        console.error('API status check failed:', error);
        setApiStatus({ status: 'ERROR', message: 'API接続に失敗しました' });
      }
    };

    checkApiStatus();
    const interval = setInterval(checkApiStatus, 30000); // 30秒ごとにチェック
    return () => clearInterval(interval);
  }, []);

  const getDifficultyColor = (difficulty: TestMode['difficulty']) => {
    switch (difficulty) {
      case 'basic': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-orange-100 text-orange-800';
      case 'experimental': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: TestMode['difficulty']) => {
    switch (difficulty) {
      case 'basic': return '基本';
      case 'intermediate': return '中級';
      case 'advanced': return '上級';
      case 'experimental': return '実験的';
      default: return '不明';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">FanVerse 3D テストシステム</h1>
              <span className="ml-3 text-sm text-gray-500">v2.0 - AI統合版</span>
            </div>

            {/* API状態表示 */}
            <div className="flex items-center space-x-4">
              {apiStatus && (
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${apiStatus.status === 'OK'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
                  }`}>
                  API: {apiStatus.status}
                </div>
              )}
              <div className="text-sm text-gray-600">
                テストモード: {TEST_MODES.length}種類
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* サイドバー：テストモード選択 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">テストモード選択</h2>

              <div className="space-y-3">
                {TEST_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${selectedMode === mode.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{mode.icon}</span>
                        <span className="font-medium text-gray-900">{mode.name}</span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(mode.difficulty)}`}>
                        {getDifficultyLabel(mode.difficulty)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">{mode.description}</p>

                    <div className="flex flex-wrap gap-1">
                      {mode.features.slice(0, 2).map((feature) => (
                        <span key={feature} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {feature}
                        </span>
                      ))}
                      {mode.features.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          +{mode.features.length - 2}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* 新機能ハイライト */}
              <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <span className="text-lg mr-2">🤖</span>
                  <span className="font-medium text-purple-800">AI統合機能</span>
                </div>
                <p className="text-sm text-purple-700 mb-2">
                  最新のAI技術で3D品質を向上
                </p>
                <ul className="text-xs text-purple-600 space-y-1">
                  <li>• DALL-E 3 テクスチャ生成</li>
                  <li>• Meshy AI 3Dモデル生成</li>
                  <li>• リアルタイム品質向上</li>
                  <li>• 有料API対応済み</li>
                </ul>
              </div>
            </div>
          </div>

          {/* メインコンテンツ：3Dシーン */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
              {/* 現在のモード情報 */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-3xl mr-4">{currentMode.icon}</span>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{currentMode.name}</h3>
                      <p className="text-gray-600">{currentMode.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(currentMode.difficulty)}`}>
                      {getDifficultyLabel(currentMode.difficulty)}
                    </span>
                    {currentMode.id === 'ai-enhanced' && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                        NEW
                      </span>
                    )}
                  </div>
                </div>

                {/* 機能一覧 */}
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {currentMode.features.map((feature) => (
                      <span key={feature} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3Dシーン表示エリア */}
              <div className="h-[600px] bg-gray-900 rounded-b-lg overflow-hidden">
                <CurrentComponent />
              </div>
            </div>

            {/* 操作ガイド */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">操作ガイド</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
                <div>
                  <strong>🖱️ マウス操作:</strong>
                  <ul className="mt-1 space-y-1 text-blue-700">
                    <li>• ドラッグ: 視点回転</li>
                    <li>• ホイール: ズーム</li>
                    <li>• 右クリック+ドラッグ: パン</li>
                  </ul>
                </div>
                <div>
                  <strong>⌨️ キーボード:</strong>
                  <ul className="mt-1 space-y-1 text-blue-700">
                    <li>• F12: 開発者ツール</li>
                    <li>• Console: ログ確認</li>
                  </ul>
                </div>
                <div>
                  <strong>🤖 AI機能:</strong>
                  <ul className="mt-1 space-y-1 text-blue-700">
                    <li>• APIキー設定が必要</li>
                    <li>• プロンプト入力で生成</li>
                    <li>• リアルタイム適用</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage; 