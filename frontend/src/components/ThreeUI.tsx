import React from 'react';

interface ThreeUIProps {
  userPosition: { x: number; y: number; z: number };
  selectedObject: string | null;
  onToggleHelp: () => void;
  showHelp: boolean;
}

export const ThreeUI: React.FC<ThreeUIProps> = ({
  userPosition,
  selectedObject,
  onToggleHelp,
  showHelp
}) => {
  return (
    <>
      {/* ミニマップ */}
      <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
        <h4 className="font-medium mb-2">ミニマップ</h4>
        <div className="w-24 h-24 bg-gray-800 rounded relative border border-gray-600">
          {/* ユーザー位置 */}
          <div
            className="absolute w-2 h-2 bg-red-500 rounded-full transform -translate-x-1 -translate-y-1"
            style={{
              left: `${((userPosition.x + 10) / 20) * 100}%`,
              top: `${((userPosition.z + 10) / 20) * 100}%`,
            }}
          />
          {/* インタラクティブオブジェクトの位置 */}
          <div className="absolute w-1 h-1 bg-blue-400 rounded-full" style={{ left: '75%', top: '40%' }} />
          <div className="absolute w-1 h-1 bg-red-400 rounded-full" style={{ left: '25%', top: '40%' }} />
          <div className="absolute w-1 h-1 bg-green-400 rounded-full" style={{ left: '50%', top: '20%' }} />
          <div className="absolute w-1 h-1 bg-purple-400 rounded-full" style={{ left: '85%', top: '70%' }} />
        </div>
        <div className="mt-2 text-xs text-gray-300">
          X: {userPosition.x.toFixed(1)} Z: {userPosition.z.toFixed(1)}
        </div>
      </div>

      {/* 選択されたオブジェクト情報 */}
      {selectedObject && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white text-center">
          <h3 className="text-lg font-medium mb-2">{selectedObject}</h3>
          <p className="text-sm text-gray-300 mb-4">
            このオブジェクトと相互作用できます
          </p>
          <button
            onClick={() => { }}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-sm transition-colors"
          >
            閉じる
          </button>
        </div>
      )}

      {/* ヘルプボタン */}
      <button
        onClick={onToggleHelp}
        className="absolute bottom-4 right-4 bg-gray-700/80 hover:bg-gray-600/80 text-white p-3 rounded-full transition-colors backdrop-blur-sm"
        title="ヘルプ"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {/* ヘルプパネル */}
      {showHelp && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg p-6 max-w-md text-white">
            <h3 className="text-xl font-bold mb-4">3D空間の操作方法</h3>
            <div className="space-y-3 text-sm">
              <div>
                <strong>マウス操作:</strong>
                <ul className="ml-4 mt-1 space-y-1">
                  <li>• 左クリック + ドラッグ: 視点回転</li>
                  <li>• 右クリック + ドラッグ: 移動</li>
                  <li>• スクロール: ズーム</li>
                  <li>• オブジェクトクリック: 相互作用</li>
                </ul>
              </div>
              <div>
                <strong>キーボード操作:</strong>
                <ul className="ml-4 mt-1 space-y-1">
                  <li>• WASD: 移動</li>
                  <li>• Shift: 高速移動</li>
                  <li>• Space: 上昇</li>
                  <li>• Ctrl: 下降</li>
                </ul>
              </div>
              <div>
                <strong>オブジェクト:</strong>
                <ul className="ml-4 mt-1 space-y-1">
                  <li>• 🔵 青: インフォメーション</li>
                  <li>• 🔴 赤: メディアギャラリー</li>
                  <li>• 🟢 緑: ショップ</li>
                  <li>• 🟣 紫: ソーシャル</li>
                </ul>
              </div>
            </div>
            <button
              onClick={onToggleHelp}
              className="mt-4 w-full bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* パフォーマンス情報 */}
      <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded px-2 py-1 text-white text-xs">
        3D Mode Active
      </div>
    </>
  );
}; 