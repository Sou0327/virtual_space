import React from 'react';
import { Link } from 'react-router-dom';

export const SimpleHomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold">FanVerse</h1>
          <p className="text-blue-100">バーチャル空間プラットフォーム</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            あなただけのバーチャル空間を作ろう
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            インフルエンサー向けパーソナルバーチャル空間プラットフォーム
          </p>

          <div className="space-x-4">
            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors inline-block"
            >
              今すぐ始める
            </Link>
            <Link
              to="/login"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-3 rounded-lg font-medium transition-colors inline-block"
            >
              ログイン
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">3D空間作成</h3>
            <p className="text-gray-600">美しいテンプレートから選んで、あなただけの3D空間を作成</p>
          </div>

          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">ファン交流</h3>
            <p className="text-gray-600">リアルタイムチャットでファンとの距離を縮める</p>
          </div>

          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">収益化</h3>
            <p className="text-gray-600">様々な方法でコンテンツを収益化</p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">サイトを探索</h3>
          <div className="space-x-4">
            <Link to="/test" className="text-blue-600 hover:text-blue-800 underline">
              テストページ
            </Link>
            <Link to="/explore" className="text-blue-600 hover:text-blue-800 underline">
              空間を探索
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}; 