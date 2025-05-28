import React from 'react';

export const React19TestPage: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f0f8ff',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#333', fontSize: '32px', marginBottom: '20px' }}>
        🚀 React 19 テストページ
      </h1>

      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h2 style={{ color: '#666', fontSize: '24px', marginBottom: '10px' }}>
          ✅ React 19 動作確認
        </h2>
        <p style={{ color: '#888', fontSize: '16px' }}>
          このページが表示されていれば、React 19 は正常に動作しています。
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
          アップグレード情報
        </h3>
        <ul style={{ color: '#388e3c', fontSize: '14px', margin: 0, paddingLeft: '20px' }}>
          <li>React: 19.x</li>
          <li>React DOM: 19.x</li>
          <li>Three.js: 最新版</li>
          <li>React Three Fiber: React 19 対応版</li>
        </ul>
      </div>

      <div style={{
        backgroundColor: '#fff3cd',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #ffc107',
      }}>
        <h3 style={{ color: '#856404', fontSize: '20px', marginBottom: '10px' }}>
          次のテスト
        </h3>
        <p style={{ color: '#856404', fontSize: '14px' }}>
          このページが正常に表示されたら、Three.js 機能をテストしてください。
        </p>
      </div>
    </div>
  );
}; 