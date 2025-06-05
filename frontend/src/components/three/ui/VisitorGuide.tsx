import React from 'react';
import type { ViewMode } from '../../../types/room';

interface VisitorGuideProps {
  viewMode: ViewMode;
  isPointerLocked: boolean;
  onViewModeChange: (mode: ViewMode) => void;
}

export const VisitorGuide: React.FC<VisitorGuideProps> = ({
  viewMode,
  isPointerLocked,
  onViewModeChange
}) => {
  // ビジターモード案内UI
  if (viewMode === 'visitor' && !isPointerLocked) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 pointer-events-auto">
        <div className="bg-black/90 backdrop-blur-sm rounded-lg p-6 text-white text-center">
          <h3 className="text-xl font-bold mb-4">🎮 ビジターモード</h3>
          <p className="mb-4">画面をクリックして歩行モードを開始してください</p>
          <div className="text-sm text-gray-300">
            <p>W/A/S/D: 移動</p>
            <p>Shift: 走る</p>
            <p>ESC: マウスロック解除</p>
          </div>
        </div>
      </div>
    );
  }

  // ビジターモード用の簡単な視点切り替え
  if (viewMode === 'visitor' && isPointerLocked) {
    return (
      <div className="fixed top-1/2 right-4 transform -translate-y-1/2 z-40">
        <button
          onClick={() => onViewModeChange('creator')}
          className="bg-black/90 backdrop-blur-sm rounded-lg p-3 text-white hover:bg-gray-800 transition-colors"
          title="クリエイターモードに戻る"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    );
  }

  return null;
}; 