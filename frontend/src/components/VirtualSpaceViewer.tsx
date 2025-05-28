import React, { useState } from 'react';
import type { VirtualSpace } from '../types';

interface VirtualSpaceViewerProps {
  space: VirtualSpace;
  isVRMode?: boolean;
  onEnterSpace?: () => void;
}

export const VirtualSpaceViewer: React.FC<VirtualSpaceViewerProps> = ({
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
              3D機能は現在開発中です
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

            <div className="text-white/60 text-sm">
              <p>🎮 3D機能は今後のアップデートで追加予定</p>
              <p>💬 チャット機能は右下のボタンから利用可能</p>
            </div>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="absolute top-4 right-4 flex space-x-2">
        <button
          className="bg-gray-700/50 hover:bg-gray-600/50 text-white px-3 py-2 rounded-lg font-medium transition-colors backdrop-blur-sm"
          onClick={() => {
            if (document.fullscreenElement) {
              document.exitFullscreen();
            } else {
              document.documentElement.requestFullscreen();
            }
          }}
          title="フルスクリーン"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
        <button
          className="bg-purple-500/50 hover:bg-purple-600/50 text-white px-4 py-2 rounded-lg font-medium transition-colors backdrop-blur-sm"
          onClick={() => {
            alert('VRモードは今後実装予定です！');
          }}
        >
          VRモード
        </button>
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