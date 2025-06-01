import React, { useState } from 'react';

interface MobileActionButtonProps {
  onCreateObject: () => void;
  onManageObjects: () => void;
  onToggleGrid: () => void;
  onToggleViewMode: () => void;
  viewMode: 'creator' | 'visitor';
  showGrid: boolean;
  isGenerating?: boolean;
  objectCount: number;
}

const MobileActionButton: React.FC<MobileActionButtonProps> = ({
  onCreateObject,
  onManageObjects,
  onToggleGrid,
  onToggleViewMode,
  viewMode,
  showGrid,
  isGenerating = false,
  objectCount
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleMainButtonClick = () => {
    if (viewMode === 'visitor') {
      onToggleViewMode();
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  const handleActionClick = (action: () => void) => {
    action();
    setIsExpanded(false);
  };

  if (viewMode === 'visitor') {
    return (
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={handleMainButtonClick}
          className="w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 flex items-center justify-center"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end space-y-3">
      {/* アクションボタン群 */}
      {isExpanded && (
        <div className="flex flex-col space-y-3 animate-in slide-in-from-bottom-5 duration-300">
          {/* オブジェクト管理 */}
          <button
            onClick={() => handleActionClick(onManageObjects)}
            className="w-12 h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 flex items-center justify-center relative"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7l2 2-2 2m2-2H9m10 8l2 2-2 2m2-2H9" />
            </svg>
            {objectCount > 0 && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {objectCount > 99 ? '99+' : objectCount}
              </div>
            )}
          </button>

          {/* グリッド切り替え */}
          <button
            onClick={() => handleActionClick(onToggleGrid)}
            className={`w-12 h-12 ${showGrid ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'} text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 flex items-center justify-center`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>

          {/* 視点切り替え */}
          <button
            onClick={() => handleActionClick(onToggleViewMode)}
            className="w-12 h-12 bg-orange-600 hover:bg-orange-700 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 flex items-center justify-center"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>
      )}

      {/* メインボタン */}
      <button
        onClick={handleMainButtonClick}
        disabled={isGenerating}
        className="w-16 h-16 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 flex items-center justify-center relative"
      >
        {isGenerating ? (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        ) : isExpanded ? (
          <svg className="w-8 h-8 transform rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        ) : (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        )}
      </button>

      {/* 展開時のオーバーレイ（閉じるため） */}
      {isExpanded && (
        <div
          className="fixed inset-0 -z-10"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* オブジェクト作成ボタン（直接アクセス）*/}
      {isExpanded && (
        <button
          onClick={() => handleActionClick(onCreateObject)}
          className="w-12 h-12 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 flex items-center justify-center absolute -top-16 right-0"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default MobileActionButton; 