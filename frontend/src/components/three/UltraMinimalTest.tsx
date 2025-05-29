import React, { useEffect, useRef, useState } from 'react';

export const UltraMinimalTest: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<string>('初期化中...');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    addLog('🔧 UltraMinimalTest starting...');

    if (!canvasRef.current) {
      addLog('❌ Canvas ref not available');
      setStatus('Canvas参照エラー');
      return;
    }

    const canvas = canvasRef.current;
    addLog('✅ Canvas element obtained');

    // WebGL context取得
    let gl: WebGLRenderingContext | null = null;

    try {
      gl = canvas.getContext('webgl') as WebGLRenderingContext;
      if (!gl) {
        gl = canvas.getContext('experimental-webgl') as WebGLRenderingContext;
      }

      if (!gl) {
        addLog('❌ WebGL context creation failed');
        setStatus('WebGL未対応');
        return;
      }

      addLog('✅ WebGL context created successfully');

      // WebGL情報取得
      const info = {
        version: gl.getParameter(gl.VERSION),
        vendor: gl.getParameter(gl.VENDOR),
        renderer: gl.getParameter(gl.RENDERER),
        shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION)
      };

      addLog(`📊 WebGL Info: ${JSON.stringify(info)}`);

      // 簡単な描画テスト
      gl.clearColor(0.2, 0.4, 0.8, 1.0); // 青色
      gl.clear(gl.COLOR_BUFFER_BIT);

      addLog('✅ Basic WebGL drawing test completed');
      setStatus('WebGL動作確認完了');

      // Three.jsライブラリの確認
      import('three').then((THREE) => {
        addLog(`✅ Three.js loaded successfully - version: ${THREE.REVISION}`);
      }).catch((err) => {
        addLog(`❌ Three.js loading failed: ${err}`);
      });

    } catch (error) {
      addLog(`❌ WebGL test error: ${error}`);
      setStatus(`エラー: ${error}`);
    }
  }, []);

  return (
    <div className="w-full h-screen bg-gray-100 flex">
      {/* Canvas */}
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="w-full h-full border border-gray-300"
          style={{ background: 'white' }}
        />

        <div className="absolute top-4 left-4 bg-white p-4 rounded shadow">
          <h3 className="font-bold text-lg mb-2">🔬 超最小テスト</h3>
          <p className="text-sm">ステータス: <span className="font-mono">{status}</span></p>
          <p className="text-xs text-gray-600 mt-2">
            青い画面が表示されればWebGL動作中
          </p>
        </div>
      </div>

      {/* ログ表示 */}
      <div className="w-80 bg-black text-green-400 p-4 overflow-y-auto font-mono text-xs">
        <h3 className="text-white font-bold mb-2">🔍 リアルタイムログ</h3>
        {logs.map((log, index) => (
          <div key={index} className="mb-1 break-words">
            {log}
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-gray-500">ログ待機中...</div>
        )}
      </div>
    </div>
  );
}; 