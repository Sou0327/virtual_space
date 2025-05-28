import React from 'react';

export const BasicTestPage: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f0f0f0',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#333', fontSize: '32px', marginBottom: '20px' }}>
        基本テストページ
      </h1>

      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h2 style={{ color: '#666', fontSize: '24px', marginBottom: '10px' }}>
          ✅ React動作確認
        </h2>
        <p style={{ color: '#888', fontSize: '16px' }}>
          このページが表示されていれば、Reactは正常に動作しています。
        </p>
      </div>

      <div style={{
        backgroundColor: '#e8f5e8',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #4caf50',
        marginBottom: '20px'
      }}>
        <h3 style={{ color: '#2e7d32', fontSize: '20px', marginBottom: '10px' }}>
          システム情報
        </h3>
        <ul style={{ color: '#388e3c', fontSize: '14px', margin: 0, paddingLeft: '20px' }}>
          <li>React: 動作中</li>
          <li>TypeScript: 動作中</li>
          <li>Vite: 動作中</li>
          <li>ポート: 5174</li>
        </ul>
      </div>

      <button
        onClick={() => alert('ボタンクリックが動作しています！')}
        style={{
          backgroundColor: '#2196f3',
          color: 'white',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
          cursor: 'pointer'
        }}
      >
        クリックテスト
      </button>
    </div>
  );
}; 