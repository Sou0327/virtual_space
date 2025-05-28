import React, { useState, useRef, useEffect } from 'react';

interface TouchInteractionProps {
  onObjectTouch?: (object: any, position: { x: number; y: number }) => void;
}

interface ObjectInfo {
  name: string;
  description: string;
  type: string;
  position: { x: number; y: number };
}

export const TouchInteraction: React.FC<TouchInteractionProps> = ({ onObjectTouch }) => {
  const [selectedObject, setSelectedObject] = useState<ObjectInfo | null>(null);
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 });

  const getObjectInfo = (touch: Touch): ObjectInfo => {
    // タッチ位置に基づいて仮想的なオブジェクト情報を生成
    const rect = document.querySelector('canvas')?.getBoundingClientRect();
    if (!rect) {
      return {
        name: '3Dオブジェクト',
        description: 'バーチャル空間内のオブジェクトです。',
        type: 'unknown',
        position: { x: touch.clientX, y: touch.clientY }
      };
    }

    const relativeX = (touch.clientX - rect.left) / rect.width;
    const relativeY = (touch.clientY - rect.top) / rect.height;

    // 画面位置に基づいてオブジェクトタイプを決定
    if (relativeX < 0.3 && relativeY > 0.5) {
      return {
        name: 'バーチャルアバター',
        description: '他のユーザーのアバターです。プロフィールを確認できます。',
        type: 'avatar',
        position: { x: touch.clientX, y: touch.clientY }
      };
    } else if (relativeX > 0.7 && relativeY > 0.5) {
      return {
        name: 'インタラクティブオブジェクト',
        description: 'タッチして詳細情報を表示できます。',
        type: 'interactive',
        position: { x: touch.clientX, y: touch.clientY }
      };
    } else if (relativeY < 0.3) {
      return {
        name: '装飾オブジェクト',
        description: '空間を彩る装飾品です。美しいデザインが特徴です。',
        type: 'decoration',
        position: { x: touch.clientX, y: touch.clientY }
      };
    } else {
      return {
        name: '環境オブジェクト',
        description: '空間の環境を構成する要素です。',
        type: 'environment',
        position: { x: touch.clientX, y: touch.clientY }
      };
    }
  };

  const handleTouch = (event: TouchEvent) => {
    event.preventDefault();

    if (event.touches.length === 1) {
      const touch = event.touches[0];
      const canvas = document.querySelector('canvas');

      if (canvas && canvas.contains(event.target as Node)) {
        const objectInfo = getObjectInfo(touch);
        setTouchPosition({
          x: touch.clientX,
          y: touch.clientY
        });
        setSelectedObject(objectInfo);

        if (onObjectTouch) {
          onObjectTouch(objectInfo, { x: touch.clientX, y: touch.clientY });
        }

        // 3秒後に自動的に閉じる
        setTimeout(() => {
          setSelectedObject(null);
        }, 3000);
      }
    }
  };

  useEffect(() => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('touchstart', handleTouch, { passive: false });

      return () => {
        canvas.removeEventListener('touchstart', handleTouch);
      };
    }
  }, []);

  return (
    <>
      {selectedObject && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: `${Math.min(selectedObject.position.x, window.innerWidth - 250)}px`,
            top: `${Math.max(selectedObject.position.y - 100, 10)}px`,
          }}
        >
          <div className="bg-black bg-opacity-80 backdrop-blur-sm text-white p-4 rounded-lg shadow-lg max-w-xs transition-all duration-300 ease-out transform scale-100 opacity-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg">{selectedObject.name}</h3>
              <button
                className="text-gray-400 hover:text-white pointer-events-auto"
                onClick={() => setSelectedObject(null)}
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-300 mb-2">{selectedObject.description}</p>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-blue-500 bg-opacity-50 rounded text-xs">
                {selectedObject.type}
              </span>
              <span className="text-xs text-gray-400">
                タッチで詳細表示
              </span>
            </div>
          </div>

          {/* 矢印 */}
          <div
            className="absolute w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-black border-opacity-80"
            style={{
              left: '20px',
              top: '100%'
            }}
          />
        </div>
      )}

      {/* タッチ操作のヒント */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
        <div className="bg-black bg-opacity-50 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm">
          💡 オブジェクトをタッチして詳細を表示
        </div>
      </div>
    </>
  );
}; 