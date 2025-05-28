import React, { useState } from 'react';
import { VirtualSpaceViewer } from '../components/VirtualSpaceViewer';
import { SimpleVirtualSpaceViewer } from '../components/SimpleVirtualSpaceViewer';
import { AdvancedThreeScene } from '../components/AdvancedThreeScene';
import type { VirtualSpace } from '../types';

// テスト用のダミーデータ
const testSpace: VirtualSpace = {
  id: 1,
  userId: 1,
  title: '🚀 高度な3D空間',
  description: '最新の3D機能を体験できる空間です',
  template: {
    id: 'cyber-space',
    name: 'サイバー空間',
    type: 'futuristic',
    description: '未来的なデジタル空間',
    preview: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop&crop=center',
    features: ['ネオンライト', 'ホログラム', 'デジタル壁', 'フローティングパネル']
  },
  customization: {
    wallTexture: 'default',
    floorTexture: 'default',
    lighting: {
      ambientColor: '#404040',
      directionalColor: '#ffffff',
      intensity: 1.0
    },
    objects: [],
    content: []
  },
  isPublic: true,
  visitCount: 42,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  username: 'テストユーザー',
  displayName: 'テストユーザー'
};

export const TestPage: React.FC = () => {
  const [showBasicTest, setShowBasicTest] = useState(true);
  const [testMode, setTestMode] = useState<'simple' | '3d' | 'advanced'>('simple');

  if (!showBasicTest) {
    return (
      <div className="fixed inset-0 bg-black">
        <div className="absolute top-4 left-4 z-50 space-x-2">
          <button
            onClick={() => setShowBasicTest(true)}
            className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            ← 基本テストに戻る
          </button>
          <button
            onClick={() => setTestMode('simple')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${testMode === 'simple'
              ? 'bg-green-500 text-white'
              : 'bg-gray-500 text-white hover:bg-gray-600'
              }`}
          >
            シンプル
          </button>
          <button
            onClick={() => setTestMode('3d')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${testMode === '3d'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-500 text-white hover:bg-gray-600'
              }`}
          >
            基本3D
          </button>
          <button
            onClick={() => setTestMode('advanced')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${testMode === 'advanced'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-500 text-white hover:bg-gray-600'
              }`}
          >
            🚀 高度3D
          </button>
        </div>

        <div className="w-full h-full">
          {testMode === 'simple' && <SimpleVirtualSpaceViewer space={testSpace} />}
          {testMode === '3d' && <VirtualSpaceViewer space={testSpace} />}
          {testMode === 'advanced' && <AdvancedThreeScene space={testSpace} />}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-4xl font-bold text-black mb-4">🎮 3D機能テストページ</h1>
      <p className="text-lg text-gray-700 mb-4">
        このページが表示されていれば、基本的なReactアプリは動作しています。
      </p>

      <div className="bg-blue-100 p-4 rounded-lg mb-4">
        <h2 className="text-xl font-bold text-blue-800 mb-2">システム情報</h2>
        <ul className="text-blue-700">
          <li>✅ React: 動作中</li>
          <li>✅ Tailwind CSS: 動作中</li>
          <li>✅ TypeScript: 動作中</li>
          <li>✅ Three.js: インストール済み</li>
          <li>🚀 高度な3D機能: 実装完了</li>
        </ul>
      </div>

      <div className="bg-green-100 p-4 rounded-lg mb-4">
        <h2 className="text-xl font-bold text-green-800 mb-2">🎨 3D機能テスト</h2>
        <p className="text-green-700 mb-4">
          3つのモードで3D機能をテストできます：
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              setTestMode('simple');
              setShowBasicTest(false);
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg font-medium transition-colors"
          >
            <div className="text-lg mb-2">📱 シンプルモード</div>
            <div className="text-sm opacity-90">Three.jsなしの基本表示</div>
          </button>
          <button
            onClick={() => {
              setTestMode('3d');
              setShowBasicTest(false);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg font-medium transition-colors"
          >
            <div className="text-lg mb-2">🎮 基本3Dモード</div>
            <div className="text-sm opacity-90">基本的な3D機能</div>
          </button>
          <button
            onClick={() => {
              setTestMode('advanced');
              setShowBasicTest(false);
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-lg font-medium transition-colors"
          >
            <div className="text-lg mb-2">🚀 高度3Dモード</div>
            <div className="text-sm opacity-90">最新の高度な3D機能</div>
          </button>
        </div>
      </div>

      <div className="bg-purple-100 p-4 rounded-lg mb-4">
        <h2 className="text-xl font-bold text-purple-800 mb-2">🌟 新機能一覧</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-purple-700">
          <div>
            <h3 className="font-semibold mb-2">🎨 ビジュアル機能</h3>
            <ul className="text-sm space-y-1">
              <li>• リアルなマテリアル（木材、大理石、金属、ガラス）</li>
              <li>• 高度なパーティクルシステム（火、魔法、エネルギー）</li>
              <li>• 動的ライティング（時間変化、天候）</li>
              <li>• 特殊エフェクト（雷、オーロラ、爆発）</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">🏗️ 3Dモデル</h3>
            <ul className="text-sm space-y-1">
              <li>• 感情表現付きアバター</li>
              <li>• 未来的な建物とプラットフォーム</li>
              <li>• 季節変化する木々</li>
              <li>• インタラクティブな噴水</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 p-3 bg-purple-200 rounded-lg">
          <h3 className="font-semibold mb-2 text-purple-800">👁️ 新機能: 視点切り替え</h3>
          <ul className="text-sm space-y-1 text-purple-700">
            <li>• 🎮 3人称視点: 全体を見渡せる従来の視点</li>
            <li>• 👁️ 1人称視点: プレイヤーの目線で没入感アップ</li>
            <li>• 右上のボタンで簡単切り替え</li>
            <li>• 各視点に最適化されたカメラ制御</li>
          </ul>
        </div>

        <div className="mt-4 p-3 bg-green-200 rounded-lg">
          <h3 className="font-semibold mb-2 text-green-800">🎮 新機能: プレイヤー移動</h3>
          <ul className="text-sm space-y-1 text-green-700">
            <li>• 🔤 WASD: 前後左右の移動（PC）</li>
            <li>• 🕹️ バーチャルジョイスティック: 移動・視点操作（モバイル）</li>
            <li>• 🚀 Space/黄色ボタン: ジャンプ</li>
            <li>• ⚡ Shift: 走る（2倍速）</li>
            <li>• 🖱️ マウス: 視点回転（PC・1人称時は画面クリックでロック）</li>
            <li>• 👆 タッチ: オブジェクト詳細表示（モバイル）</li>
            <li>• 🏃 リアルタイムで移動状態を表示</li>
            <li>• 🌍 広大な空間を自由に探索可能</li>
          </ul>
        </div>

        <div className="mt-4 p-3 bg-blue-200 rounded-lg">
          <h3 className="font-semibold mb-2 text-blue-800">📱 モバイル対応</h3>
          <ul className="text-sm space-y-1 text-blue-700">
            <li>• 🕹️ 左ジョイスティック: プレイヤー移動</li>
            <li>• 🎯 右ジョイスティック: カメラ視点操作</li>
            <li>• 🚀 ジャンプボタン: タッチでジャンプ</li>
            <li>• 👆 タッチインタラクション: オブジェクトをタッチして詳細表示</li>
            <li>• 👁️ 1人称視点がデフォルト（没入感重視）</li>
            <li>• 📱 自動モバイル検出とUI切り替え</li>
          </ul>
        </div>
      </div>

      <div className="bg-yellow-100 p-4 rounded-lg">
        <h2 className="text-xl font-bold text-yellow-800 mb-2">🔧 アクセス方法</h2>
        <p className="text-yellow-700">
          URL: <code className="bg-yellow-200 px-2 py-1 rounded">http://localhost:5173/test</code>
        </p>
        <div className="text-yellow-700 mt-2 text-sm space-y-1">
          <div>💡 <strong>操作方法:</strong></div>
          <div>• 🔤 WASD: プレイヤー移動（PC）</div>
          <div>• 🕹️ バーチャルジョイスティック: 移動・視点（モバイル）</div>
          <div>• 🚀 Space/黄色ボタン: ジャンプ</div>
          <div>• ⚡ Shift: 走る</div>
          <div>• 🖱️ マウス: 視点回転（PC）</div>
          <div>• 👆 タッチ: オブジェクト詳細（モバイル）</div>
          <div>• 👁️ 右上ボタン: 1人称/3人称視点切り替え（PC）</div>
          <div>• 🎮 1人称視点がデフォルト（没入感重視）</div>
          <div>• 🌍 広大な3D空間を自由に探索してください！</div>
          <div>• 📱 スマホでも快適に操作できます！</div>
        </div>
      </div>
    </div>
  );
}; 