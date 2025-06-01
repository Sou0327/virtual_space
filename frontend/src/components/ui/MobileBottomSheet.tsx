import React, { useState, useRef, useEffect } from 'react';

interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxHeight?: string;
}

const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxHeight = '80vh'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  // タッチイベントハンドラー
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const y = e.touches[0].clientY;
    setCurrentY(y);

    // ドラッグで下に移動している場合のみ変形
    if (y > startY) {
      const diff = y - startY;
      if (sheetRef.current) {
        sheetRef.current.style.transform = `translateY(${Math.min(diff, 200)}px)`;
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    setIsDragging(false);

    // ドラッグした距離が一定以上なら閉じる
    const diff = currentY - startY;
    if (diff > 100) {
      onClose();
    } else if (sheetRef.current) {
      // 元の位置に戻す
      sheetRef.current.style.transform = 'translateY(0)';
    }
  };

  // ESCキーで閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      {/* オーバーレイ */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* ボトムシート */}
      <div
        ref={sheetRef}
        className="relative w-full bg-gray-900 rounded-t-xl border-t border-white/20 shadow-2xl transform transition-transform duration-300 ease-out"
        style={{ maxHeight }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* ドラッグハンドル */}
        <div className="flex justify-center py-3 border-b border-gray-700">
          <div className="w-12 h-1 bg-gray-500 rounded-full"></div>
        </div>

        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 120px)' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default MobileBottomSheet; 