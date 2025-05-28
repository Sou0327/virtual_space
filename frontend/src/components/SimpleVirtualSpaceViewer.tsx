import React, { useState } from 'react';
import type { VirtualSpace } from '../types';

interface SimpleVirtualSpaceViewerProps {
  space: VirtualSpace;
  onEnterSpace?: () => void;
}

export const SimpleVirtualSpaceViewer: React.FC<SimpleVirtualSpaceViewerProps> = ({
  space,
  onEnterSpace
}) => {
  const [isEntered, setIsEntered] = useState(false);

  const handleEnterSpace = () => {
    setIsEntered(true);
    onEnterSpace?.();
  };

  const getBackgroundGradient = (type: string) => {
    switch (type) {
      case 'room': return 'from-amber-400 to-orange-600';
      case 'stage': return 'from-purple-500 to-pink-600';
      case 'gallery': return 'from-gray-300 to-gray-500';
      case 'outdoor': return 'from-green-400 to-blue-500';
      case 'futuristic': return 'from-blue-600 to-purple-800';
      case 'social': return 'from-yellow-400 to-red-500';
      default: return 'from-blue-400 to-purple-600';
    }
  };

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      {/* Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getBackgroundGradient(space.template.type)}`}>
        {/* Template preview image overlay */}
        {space.template.preview && (
          <div className="absolute inset-0 opacity-30">
            <img
              src={space.template.preview}
              alt={space.template.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12 animate-pulse"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center h-full">
        {!isEntered ? (
          <div className="text-center">
            <div className="w-24 h-24 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center backdrop-blur-sm">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{space.title}</h3>
            <p className="text-white/80 mb-4">
              {space.template.name} - {space.template.type}
            </p>
            <p className="text-white/70 mb-6 text-sm">
              シンプルモード（3D機能なし）
            </p>
            <button
              onClick={handleEnterSpace}
              className="bg-white/20 hover:bg-white/30 text-white px-8 py-3 rounded-lg font-medium transition-colors backdrop-blur-sm border border-white/30"
            >
              空間に入る
            </button>
          </div>
        ) : (
          <div className="text-center">
            <h3 className="text-3xl font-bold text-white mb-4">
              {space.template.name}へようこそ！
            </h3>
            <p className="text-white/80 mb-6">
              {space.description || 'この美しい空間でリラックスしてください'}
            </p>

            {/* Template features */}
            {space.template.features && space.template.features.length > 0 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
                <h4 className="text-white font-medium mb-2">空間の特徴</h4>
                <div className="flex flex-wrap gap-2 justify-center">
                  {space.template.features.map((feature, index) => (
                    <span
                      key={index}
                      className="bg-white/20 text-white px-3 py-1 rounded-full text-sm"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="text-white/60 text-sm mb-6">
              <p>🎮 3D機能は開発中です</p>
              <p>💬 チャット機能は今後実装予定</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => alert('インフォメーション機能')}
                className="bg-blue-500/80 hover:bg-blue-600/80 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                ℹ️ インフォメーション
              </button>
              <button
                onClick={() => alert('メディアギャラリー機能')}
                className="bg-red-500/80 hover:bg-red-600/80 text-white px-6 py-2 rounded-lg font-medium transition-colors ml-4"
              >
                🎬 メディアギャラリー
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info overlay */}
      {isEntered && (
        <div className="absolute bottom-4 left-4">
          <div className="bg-black/50 text-white px-3 py-2 rounded-lg text-sm backdrop-blur-sm">
            訪問者数: {space.visitCount}
          </div>
        </div>
      )}
    </div>
  );
}; 