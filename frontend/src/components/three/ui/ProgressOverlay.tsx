import React from 'react';
import type { GenerateProgress } from '../../../types/room';

interface ProgressOverlayProps {
  progress: GenerateProgress;
  visible: boolean;
}

export const ProgressOverlay: React.FC<ProgressOverlayProps> = ({
  progress,
  visible
}) => {
  if (!visible || progress.percentage <= 0) return null;

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/90 backdrop-blur-sm rounded-lg p-6 text-white max-w-md w-full mx-4 z-50">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold">
          {progress.stage === 'completed' ? '✅ 生成完了！' : '🤖 AI生成中...'}
        </h3>
        <p className="text-sm text-gray-300 mt-1">{progress.message}</p>
      </div>

      <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
        <div
          className={`h-3 rounded-full transition-all duration-300 ${progress.stage === 'completed' ? 'bg-green-500' : 'bg-blue-500'
            }`}
          style={{ width: `${progress.percentage}%` }}
        />
      </div>

      <div className="text-center text-xs text-gray-400">
        {progress.percentage}% - {progress.stage}
      </div>
    </div>
  );
}; 