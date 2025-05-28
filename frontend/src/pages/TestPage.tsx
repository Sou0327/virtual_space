import React from 'react';

export const TestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-4xl font-bold text-black mb-4">テストページ</h1>
      <p className="text-lg text-gray-700 mb-4">
        このページが表示されていれば、基本的なReactアプリは動作しています。
      </p>

      <div className="bg-blue-100 p-4 rounded-lg mb-4">
        <h2 className="text-xl font-bold text-blue-800 mb-2">システム情報</h2>
        <ul className="text-blue-700">
          <li>React: 動作中</li>
          <li>Tailwind CSS: 動作中</li>
          <li>TypeScript: 動作中</li>
        </ul>
      </div>

      <div className="bg-green-100 p-4 rounded-lg">
        <h2 className="text-xl font-bold text-green-800 mb-2">次のステップ</h2>
        <p className="text-green-700">
          このページが正常に表示されたら、メインアプリケーションの問題を特定できます。
        </p>
      </div>
    </div>
  );
}; 