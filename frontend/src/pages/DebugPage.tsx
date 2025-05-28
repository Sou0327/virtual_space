import React, { useState } from 'react';

export const DebugPage: React.FC = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          🔍 デバッグページ
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            基本機能テスト
          </h2>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className="text-lg">カウンター: {count}</span>
              <button
                onClick={() => setCount(count + 1)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
              >
                +1
              </button>
              <button
                onClick={() => setCount(0)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
              >
                リセット
              </button>
            </div>
          </div>
        </div>

        <div className="bg-green-100 border border-green-400 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            ✅ 動作確認済み
          </h3>
          <ul className="text-green-700 space-y-1">
            <li>• React コンポーネント</li>
            <li>• useState フック</li>
            <li>• Tailwind CSS</li>
            <li>• イベントハンドリング</li>
          </ul>
        </div>

        <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            ⚠️ 問題の可能性
          </h3>
          <ul className="text-yellow-700 space-y-1">
            <li>• Three.js ライブラリの競合</li>
            <li>• React Three Fiber の互換性</li>
            <li>• TypeScript の型定義</li>
            <li>• Vite の設定</li>
          </ul>
        </div>

        <div className="bg-blue-100 border border-blue-400 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            🔧 次のステップ
          </h3>
          <ol className="text-blue-700 space-y-1 list-decimal list-inside">
            <li>このページが正常に表示されるか確認</li>
            <li>Three.js なしのコンポーネントをテスト</li>
            <li>段階的に Three.js を追加</li>
            <li>エラーの発生箇所を特定</li>
          </ol>
        </div>
      </div>
    </div>
  );
}; 