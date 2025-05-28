import React, { useState, useEffect } from 'react';
import { VirtualSpaceViewer } from '../components/VirtualSpaceViewer';
import { SimpleVirtualSpaceViewer } from '../components/SimpleVirtualSpaceViewer';
import { AdvancedThreeScene } from '../components/AdvancedThreeScene';
import { FantasyScene } from '../components/FantasyScene';
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
  const [testMode, setTestMode] = useState<'basic' | 'advanced' | 'fantasy'>('basic');
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [apiUrl, setApiUrl] = useState('');

  useEffect(() => {
    // API接続状態をチェック
    const checkConnection = async () => {
      try {
        const hostname = window.location.hostname;
        const baseUrl = hostname !== 'localhost' && hostname !== '127.0.0.1'
          ? `http://${hostname}:3001/api`
          : 'http://localhost:3001/api';

        setApiUrl(baseUrl);

        console.log('🔧 Checking connection to:', baseUrl);

        const response = await fetch(`${baseUrl}/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Connection successful:', data);
          setConnectionStatus('connected');
        } else {
          console.error('❌ Connection failed:', response.status);
          setConnectionStatus('error');
        }
      } catch (error) {
        console.error('❌ Connection error:', error);
        setConnectionStatus('error');
      }
    };

    checkConnection();
  }, []);

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
            onClick={() => setTestMode('basic')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${testMode === 'basic'
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
          <button
            onClick={() => setTestMode('fantasy')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${testMode === 'fantasy'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
              : 'bg-gray-500 text-white hover:bg-gray-600'
              }`}
          >
            🧙‍♂️ AI魔法3D
          </button>
        </div>

        <div className="w-full h-full">
          {testMode === 'basic' && <SimpleVirtualSpaceViewer space={testSpace} />}
          {testMode === 'advanced' && <AdvancedThreeScene space={testSpace} />}
          {testMode === 'fantasy' && <FantasyScene space={{
            ...testSpace,
            description: "古い魔法学校の大広間。高いアーチ天井、石の柱、松明の温かい光が踊る神秘的な空間"
          }} />}
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

      {/* 接続状態表示 */}
      <div className={`p-4 rounded-lg mb-4 ${connectionStatus === 'connected' ? 'bg-green-100' :
        connectionStatus === 'error' ? 'bg-red-100' : 'bg-yellow-100'
        }`}>
        <h2 className={`text-xl font-bold mb-2 ${connectionStatus === 'connected' ? 'text-green-800' :
          connectionStatus === 'error' ? 'text-red-800' : 'text-yellow-800'
          }`}>
          {connectionStatus === 'connected' ? '✅ バックエンド接続状態' :
            connectionStatus === 'error' ? '❌ バックエンド接続エラー' : '🔄 バックエンド接続確認中'}
        </h2>
        <ul className={`${connectionStatus === 'connected' ? 'text-green-700' :
          connectionStatus === 'error' ? 'text-red-700' : 'text-yellow-700'
          }`}>
          <li>API URL: {apiUrl}</li>
          <li>ホスト名: {window.location.hostname}</li>
          <li>プロトコル: {window.location.protocol}</li>
          <li>ポート: {window.location.port || '(デフォルト)'}</li>
          {connectionStatus === 'connected' && <li>✅ ログイン・登録機能が利用可能です</li>}
          {connectionStatus === 'error' && (
            <>
              <li>❌ バックエンドサーバーに接続できません</li>
              <li>🔧 バックエンドサーバーが起動しているか確認してください</li>
            </>
          )}
        </ul>
      </div>

      <div className="bg-blue-100 p-4 rounded-lg mb-4">
        <h2 className="text-xl font-bold text-blue-800 mb-2">システム情報</h2>
        <ul className="text-blue-700">
          <li>✅ React: 動作中</li>
          <li>✅ Tailwind CSS: 動作中</li>
          <li>✅ TypeScript: 動作中</li>
          <li>✅ Three.js: インストール済み</li>
          <li>🚀 高度な3D機能: 実装完了</li>
          <li>🛡️ エラーハンドリング: 追加済み</li>
        </ul>
      </div>

      <div className="bg-green-100 p-4 rounded-lg mb-4">
        <h2 className="text-xl font-bold text-green-800 mb-2">🎨 3D機能テスト</h2>
        <p className="text-green-700 mb-4">
          3つのモードで3D機能をテストできます：
        </p>
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-medium mb-2">🎮 3Dテストモード</h4>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setTestMode('basic')}
                className={`p-4 rounded-lg border text-center transition-colors ${testMode === 'basic'
                  ? 'bg-blue-500 text-white border-blue-600'
                  : 'bg-gray-100 hover:bg-gray-200 border-gray-300'
                  }`}
              >
                <div className="text-2xl mb-2">🎯</div>
                <div className="font-medium">基本3D</div>
                <div className="text-sm opacity-70">シンプルな3D空間</div>
              </button>

              <button
                onClick={() => setTestMode('advanced')}
                className={`p-4 rounded-lg border text-center transition-colors ${testMode === 'advanced'
                  ? 'bg-purple-500 text-white border-purple-600'
                  : 'bg-gray-100 hover:bg-gray-200 border-gray-300'
                  }`}
              >
                <div className="text-2xl mb-2">🚀</div>
                <div className="font-medium">高度3D</div>
                <div className="text-sm opacity-70">高度なエフェクト</div>
              </button>

              <button
                onClick={() => setTestMode('fantasy')}
                className={`p-4 rounded-lg border text-center transition-colors ${testMode === 'fantasy'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-600'
                  : 'bg-gray-100 hover:bg-gray-200 border-gray-300'
                  }`}
              >
                <div className="text-2xl mb-2">🧙‍♂️</div>
                <div className="font-medium">AI魔法3D</div>
                <div className="text-sm opacity-70">テキスト生成</div>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-green-200 rounded-lg">
          <h3 className="font-semibold mb-2 text-green-800">🔍 3D問題の調査</h3>
          <ul className="text-sm space-y-1 text-green-700">
            <li>• コンソール（F12）でエラーメッセージを確認してください</li>
            <li>• 「真っ白」になる場合は、3Dライブラリの読み込み問題の可能性</li>
            <li>• スマホでは「シンプルモード」を試してください</li>
            <li>• 問題があれば具体的なエラーメッセージを教えてください</li>
          </ul>
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

      <div className="bg-purple-100 p-4 rounded-lg mb-4">
        <h2 className="text-xl font-bold text-purple-800 mb-2">🔐 認証機能テスト</h2>
        <p className="text-purple-700 mb-4">
          ユーザー登録とログイン機能をテストします：
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={async () => {
              try {
                console.log('🧪 Testing registration...');
                const response = await fetch(`${apiUrl}/auth/register`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    email: `test${Date.now()}@example.com`,
                    username: `user${Date.now()}`,
                    displayName: 'テストユーザー',
                    password: 'password123',
                    userType: 'fan',
                  }),
                });
                const data = await response.json();
                console.log('🔐 Registration test result:', data);
                alert(data.success ? '✅ 登録テスト成功!' : '❌ 登録テスト失敗: ' + data.message);
              } catch (error) {
                console.error('❌ Registration test error:', error);
                alert('❌ 登録テストエラー: ' + error);
              }
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg font-medium transition-colors"
          >
            <div className="text-lg mb-2">🔐 ユーザー登録テスト</div>
            <div className="text-sm opacity-90">新しいユーザーで登録テスト</div>
          </button>
          <button
            onClick={() => {
              window.location.href = '/register';
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-lg font-medium transition-colors"
          >
            <div className="text-lg mb-2">📝 登録ページへ</div>
            <div className="text-sm opacity-90">実際の登録フォーム</div>
          </button>
        </div>
      </div>

      <div className="bg-yellow-100 p-4 rounded-lg">
        <h2 className="text-xl font-bold text-yellow-800 mb-2">🔧 アクセス方法</h2>
        <div className="text-yellow-700 space-y-2">
          <div>
            <strong>PC:</strong> <code className="bg-yellow-200 px-2 py-1 rounded">http://localhost:5174/test</code>
          </div>
          <div>
            <strong>スマホ:</strong> <code className="bg-yellow-200 px-2 py-1 rounded">http://{window.location.hostname}:5174/test</code>
          </div>
        </div>

        <div className="mt-4 p-3 bg-yellow-200 rounded-lg">
          <h3 className="font-semibold mb-2 text-yellow-800">📱 スマホ使用時の注意</h3>
          <ul className="text-sm space-y-1 text-yellow-700">
            <li>• パフォーマンス向上のため軽量モードで動作します</li>
            <li>• シャドウやエフェクトが簡素化されます</li>
            <li>• エラーが発生した場合は「シンプル表示」をお試しください</li>
            <li>• WiFi環境での使用を推奨します</li>
          </ul>
        </div>

        <div className="text-yellow-700 mt-4 text-sm space-y-1">
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

      {/* 3D表示エリア */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
        <div className="h-full relative">
          {(() => {
            try {
              switch (testMode) {
                case 'basic':
                  return (
                    <SimpleVirtualSpaceViewer space={testSpace} />
                  );
                case 'advanced':
                  return (
                    <AdvancedThreeScene
                      space={testSpace}
                      onUserMove={(position) => {
                        console.log('Advanced 3D - Player moved to:', position);
                      }}
                    />
                  );
                case 'fantasy':
                  return (
                    <FantasyScene
                      space={{
                        ...testSpace,
                        description: "古い魔法学校の大広間。高いアーチ天井、石の柱、松明の温かい光が踊る神秘的な空間"
                      }}
                      onUserMove={(position) => {
                        console.log('Fantasy AI 3D - Player moved to:', position);
                      }}
                    />
                  );
                default:
                  return <div className="flex items-center justify-center h-full text-gray-500">3Dシーンを選択してください</div>;
              }
            } catch (error) {
              console.error('3D Scene Error:', error);
              return (
                <div className="flex items-center justify-center h-full text-red-500">
                  <div className="text-center">
                    <div className="text-4xl mb-4">❌</div>
                    <div className="text-lg font-medium mb-2">3D表示エラー</div>
                    <div className="text-sm">
                      {testMode === 'fantasy' ? 'AI魔法3D機能で問題が発生しました' :
                        testMode === 'advanced' ? '高度3D機能で問題が発生しました' :
                          '基本3D機能で問題が発生しました'}
                    </div>
                    <button
                      onClick={() => setTestMode('basic')}
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      基本3Dに戻る
                    </button>
                  </div>
                </div>
              );
            }
          })()}
        </div>
      </div>
    </div>
  );
}; 