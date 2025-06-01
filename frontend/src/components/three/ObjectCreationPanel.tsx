import React, { useState, useEffect } from 'react';

interface ObjectCreationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateObject: (prompt: string) => void;
  isGenerating: boolean;
}

const ObjectCreationPanel: React.FC<ObjectCreationPanelProps> = ({
  isOpen,
  onClose,
  onCreateObject,
  isGenerating
}) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isGenerating) {
      onCreateObject(prompt.trim());
      setPrompt('');
      onClose();
    }
  };

  // ESCキーでパネルを閉じる
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md">
        <h3 className="text-lg font-semibold mb-4">新しいオブジェクトを作成</h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              どんなオブジェクトを作りたいですか？
            </label>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="例: 魔王の椅子、未来的なテーブル、古代の本棚..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isGenerating}
              autoFocus
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={!prompt.trim() || isGenerating}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isGenerating ? '生成中...' : '作成'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={isGenerating}
            >
              キャンセル
            </button>
          </div>
        </form>

        <div className="mt-4 text-xs text-gray-500">
          <p>• Meshy AIで3Dモデルを生成します</p>
          <p>• 生成には2-4分程度かかります</p>
          <p>• ESCキーでキャンセル可能</p>
        </div>
      </div>
    </div>
  );
};

export default ObjectCreationPanel; 