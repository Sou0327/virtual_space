import React from 'react';

export const SimpleTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
          🎉 動作確認
        </h1>
        <div className="space-y-4">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <strong>✅ React:</strong> 正常動作
          </div>
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
            <strong>✅ TypeScript:</strong> 正常動作
          </div>
          <div className="bg-purple-100 border border-purple-400 text-purple-700 px-4 py-3 rounded">
            <strong>✅ Tailwind CSS:</strong> 正常動作
          </div>
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <strong>⚠️ Three.js:</strong> テスト準備中
          </div>
        </div>
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            このページが表示されていれば、基本的なフロントエンド環境は正常です。
          </p>
        </div>
      </div>
    </div>
  );
}; 