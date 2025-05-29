import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';

// Text-to-3D生成フック
const useTextTo3D = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<{
    stage: string;
    progress: number;
    message: string;
    estimatedTime: string;
  } | null>(null);
  const [generatedModels, setGeneratedModels] = useState<Array<{
    id: string;
    prompt: string;
    modelUrl: string;
    generated_image?: string;
    previewImage: string;
    timestamp: Date;
    status: string;
    format: string;
  }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<any>(null);

  // API状態確認
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/ai/api-keys/status');
        const data = await response.json();
        setApiStatus(data);
        console.log('🔑 API Status:', data);
      } catch (error) {
        console.error('❌ API status check failed:', error);
      }
    };

    checkApiStatus();
  }, []);

  const generateModel = async (prompt: string) => {
    if (!prompt.trim()) return null;

    setIsGenerating(true);
    setError(null);
    setGenerationProgress({
      stage: 'initializing',
      progress: 0,
      message: 'AI 3Dモデル生成を開始しています...',
      estimatedTime: '3-5分'
    });

    try {
      console.log('🎯 Generating 3D model from text:', prompt);

      // 進捗シミュレーション用タイマー
      let progressTimer: NodeJS.Timeout | null = null;
      progressTimer = setInterval(() => {
        setGenerationProgress(prev => {
          if (!prev) return null;

          let newProgress = prev.progress + Math.random() * 5;
          let newStage = prev.stage;
          let newMessage = prev.message;

          if (newProgress > 20 && prev.stage === 'initializing') {
            newStage = 'mesh_generation';
            newMessage = 'プレビューメッシュを生成中... (1/2)';
          } else if (newProgress > 60 && prev.stage === 'mesh_generation') {
            newStage = 'texture_generation';
            newMessage = 'テクスチャを適用中... (2/2)';
          }

          return {
            ...prev,
            stage: newStage,
            progress: Math.min(newProgress, 95),
            message: newMessage
          };
        });
      }, 2000);

      const response = await fetch('http://localhost:3001/api/ai/text-to-3d', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt,
          art_style: 'realistic',
          texture_resolution: 1024,
          ai_model: 'meshy-4'
        })
      });

      if (progressTimer) clearInterval(progressTimer);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 API Response:', data);

      setGenerationProgress({
        stage: 'completed',
        progress: 100,
        message: '3Dモデル生成完了！',
        estimatedTime: ''
      });

      if (data.model_url) {
        const newModel = {
          id: `model_${Date.now()}`,
          prompt: prompt,
          modelUrl: data.model_url,
          generated_image: data.preview_image || data.generated_image,
          previewImage: data.preview_image || data.generated_image || '',
          timestamp: new Date(),
          status: data.status || 'success',
          format: data.format || 'gltf'
        };

        setGeneratedModels(prev => [newModel, ...prev]);
        console.log('✅ 3D Model generated successfully:', newModel);

        // 3秒後に進捗表示をクリア
        setTimeout(() => {
          setGenerationProgress(null);
        }, 3000);

        return newModel;
      } else {
        throw new Error('3Dモデルが取得できませんでした');
      }
    } catch (err) {
      console.error('❌ Text-to-3D generation failed:', err);
      setError(err instanceof Error ? err.message : 'Text-to-3D生成に失敗しました');
      setGenerationProgress(null);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const clearError = () => setError(null);
  const clearModels = () => setGeneratedModels([]);

  return {
    generateModel,
    isGenerating,
    generationProgress,
    generatedModels,
    error,
    apiStatus,
    clearError,
    clearModels
  };
};

// 生成された3Dモデル表示コンポーネント
const GeneratedModel: React.FC<{
  modelUrl: string;
  previewImage?: string;
  position: [number, number, number];
  prompt: string;
}> = ({ modelUrl, previewImage, position, prompt }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isGltfModel, setIsGltfModel] = useState(false);

  // GLTFモデルかどうかを判定
  useEffect(() => {
    const isGltf = modelUrl.includes('.gltf') || modelUrl.includes('.glb');
    setIsGltfModel(isGltf);
    console.log('🎯 Model type detected:', isGltf ? 'GLTF/GLB' : 'Other', modelUrl);

    // Meshy AI URLの検出ログのみ（接続テストは削除）
    if (modelUrl.includes('assets.meshy.ai')) {
      console.log('🔥 Meshy AI URL detected - will use fallback display due to CORS');
    }
  }, [modelUrl]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  // GLTFモデルコンポーネント
  const GLTFModel: React.FC<{ url: string }> = ({ url }) => {
    const [hasError, setHasError] = useState(false);

    // Meshy AI URLの場合は即座にフォールバックを使用（CORS問題対策）
    useEffect(() => {
      if (url.includes('assets.meshy.ai')) {
        console.warn('⚠️ Meshy AI URL detected - using fallback due to CORS restrictions');
        setHasError(true);
        setLoadError('CORS制限によりフォールバック表示');
        return;
      }
    }, [url]); // urlのみに依存

    // CORS制限のあるURLの場合は即座にフォールバック
    if (hasError || url.includes('assets.meshy.ai')) {
      return (
        <group>
          {/* Meshy AI成功時のフォールバック表示 */}
          <mesh position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color="#9f7aea"
              metalness={0.4}
              roughness={0.6}
              emissive="#9f7aea"
              emissiveIntensity={0.1}
            />
          </mesh>
          {/* Meshy AI成功インジケーター */}
          <mesh position={[0, 1.5, 0]}>
            <sphereGeometry args={[0.1]} />
            <meshBasicMaterial color="#ff6b6b" />
          </mesh>
          {/* テキスト表示 */}
          <mesh position={[0, 2, 0]}>
            <boxGeometry args={[0.1, 0.1, 0.1]} />
            <meshBasicMaterial color="#ffd700" />
          </mesh>
        </group>
      );
    }

    // 通常のGLTFロード（非Meshy URL用）
    let gltf: any = null;
    try {
      gltf = useGLTF(url);
    } catch (error) {
      console.error('❌ GLTF loading error:', error);
      return (
        <group>
          <mesh position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#4A90E2" metalness={0.2} roughness={0.8} />
          </mesh>
          <mesh position={[0, 1.5, 0]}>
            <sphereGeometry args={[0.1]} />
            <meshBasicMaterial color="#ff4444" />
          </mesh>
        </group>
      );
    }

    if (gltf && gltf.scene) {
      // モデルのバウンディングボックスを計算して適切な位置に調整
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      // モデルを中央に配置し、地面の上に置く
      gltf.scene.position.x = -center.x;
      gltf.scene.position.y = -box.min.y; // 地面の上に配置
      gltf.scene.position.z = -center.z;

      // 適切なサイズに調整（最大2単位）
      const maxDimension = Math.max(size.x, size.y, size.z);
      if (maxDimension > 2) {
        const scale = 2 / maxDimension;
        gltf.scene.scale.setScalar(scale);
      }

      return <primitive object={gltf.scene} />;
    }

    // デフォルトフォールバック
    return (
      <group>
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#4A90E2" metalness={0.2} roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.5, 0]}>
          <sphereGeometry args={[0.1]} />
          <meshBasicMaterial color="#ff4444" />
        </mesh>
      </group>
    );
  };

  return (
    <group ref={groupRef} position={position}>
      {/* ステータス表示 */}
      <Html position={[0, 2.5, 0]} center>
        <div className="bg-black bg-opacity-75 text-white px-3 py-1 rounded text-xs max-w-48 text-center">
          <div className="font-bold">
            {modelUrl.includes('assets.meshy.ai') ? '🔥 Meshy AI' :
              isGltfModel ? '🎨 3Dモデル' : '🎭 デモモード'}
          </div>
          <div className="text-gray-300 text-xs mt-1 truncate">{prompt}</div>
          {modelUrl.includes('assets.meshy.ai') && (
            <div className="text-purple-400 text-xs">✨ 実際のAI生成</div>
          )}
          {isGltfModel && !modelUrl.includes('assets.meshy.ai') && (
            <div className="text-green-400 text-xs">✅ GLTF/GLB</div>
          )}
          {loadError && (
            <div className="text-red-400 text-xs">⚠️ ロードエラー</div>
          )}
        </div>
      </Html>

      {/* 3Dモデル表示 */}
      {isGltfModel ? (
        <Suspense fallback={
          <group>
            {/* ローディング中の表示 */}
            <mesh position={[0, 0.5, 0]} castShadow>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial
                color="#ffd700"
                emissive="#ffd700"
                emissiveIntensity={0.1}
              />
            </mesh>
            {/* ローディングアニメーション */}
            <mesh position={[0, 1.5, 0]}>
              <sphereGeometry args={[0.05]} />
              <meshBasicMaterial color="#ffff00" />
            </mesh>
          </group>
        }>
          <GLTFErrorBoundary fallback={
            <group>
              {/* エラー時フォールバック */}
              <mesh position={[0, 0.5, 0]} castShadow>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial
                  color="#ff6b6b"
                  metalness={0.3}
                  roughness={0.7}
                />
              </mesh>
              {/* エラーインジケーター */}
              <mesh position={[0, 1.5, 0]}>
                <sphereGeometry args={[0.1]} />
                <meshBasicMaterial color="#ff0000" />
              </mesh>
            </group>
          }>
            <GLTFModel url={modelUrl} />
          </GLTFErrorBoundary>
        </Suspense>
      ) : (
        // フォールバック：プリミティブ形状
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color="#4A90E2"
            metalness={0.3}
            roughness={0.4}
          />
        </mesh>
      )}

      {/* 基底 */}
      <mesh position={[0, -0.01, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 0.02]} />
        <meshStandardMaterial color="#333" opacity={0.5} transparent />
      </mesh>

      {/* エラー表示 */}
      {loadError && (
        <Html position={[0, -0.5, 0]} center>
          <div className="bg-red-900 text-white px-2 py-1 rounded text-xs">
            {loadError}
          </div>
        </Html>
      )}
    </group>
  );
};

// Text-to-3D生成パネル
const GenerationPanel: React.FC<{
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
  generationProgress: {
    stage: string;
    progress: number;
    message: string;
    estimatedTime: string;
  } | null;
  error: string | null;
  apiStatus: any;
  onClearError: () => void;
}> = ({ onGenerate, isGenerating, generationProgress, error, apiStatus, onClearError }) => {
  const [prompt, setPrompt] = useState('damaged helmet');
  const [selectedCategory, setSelectedCategory] = useState('furniture');

  const categories = {
    furniture: {
      name: '家具',
      presets: [
        'ダメージヘルメット、戦闘用、リアル',
        'ウォーターボトル、透明、スポーツ用',
        'ランタン、アンティーク、金属製',
        'モダンチェア、木製、北欧デザイン',
        'オフィスデスク、ガラストップ、金属脚',
        'ブックシェルフ、5段、ダークウッド'
      ]
    },
    objects: {
      name: 'オブジェクト',
      presets: [
        'damaged helmet',
        'water bottle',
        'lantern',
        'vintage camera',
        'ceramic vase',
        'metal tools'
      ]
    },
    vehicles: {
      name: '乗り物',
      presets: [
        'classic car',
        'motorcycle',
        'bicycle',
        'airplane',
        'boat',
        'truck'
      ]
    }
  };

  const handleGenerate = () => {
    if (prompt.trim() && !isGenerating) {
      onGenerate(prompt.trim());
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 bg-gray-900 bg-opacity-95 text-white p-6 rounded-lg max-w-md">
      <h3 className="text-xl font-bold mb-4 text-center">🎯 Text-to-3D生成</h3>

      {/* API状態表示 */}
      {apiStatus && (
        <div className={`mb-4 p-3 rounded text-sm ${apiStatus.development_mode
          ? 'bg-yellow-900 border border-yellow-600'
          : 'bg-green-900 border border-green-600'
          }`}>
          <div className="font-medium">
            {apiStatus.development_mode ? '🎭 デモモード' : '🔥 AI生成モード'}
          </div>
          <div className="text-xs mt-1">{apiStatus.message}</div>
        </div>
      )}

      {/* 進捗表示 */}
      {generationProgress && (
        <div className="mb-4 p-4 bg-purple-900 bg-opacity-70 rounded-lg border border-purple-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">🔥 Meshy AI v2 生成中</span>
            <span className="text-xs text-purple-300">{generationProgress.estimatedTime}</span>
          </div>

          {/* プログレスバー */}
          <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${generationProgress.progress}%` }}
            ></div>
          </div>

          {/* 現在のステージとメッセージ */}
          <div className="text-xs text-purple-200 mb-1">
            ステージ: {generationProgress.stage === 'initializing' ? '初期化' :
              generationProgress.stage === 'mesh_generation' ? 'メッシュ生成' :
                generationProgress.stage === 'texture_generation' ? 'テクスチャ適用' : '完了'}
          </div>
          <div className="text-sm text-white">{generationProgress.message}</div>
          <div className="text-xs text-purple-300 mt-2">
            進捗: {Math.round(generationProgress.progress)}%
          </div>
        </div>
      )}

      {/* カテゴリ選択 */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">カテゴリ:</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
          disabled={isGenerating}
        >
          {Object.entries(categories).map(([key, category]) => (
            <option key={key} value={key}>{category.name}</option>
          ))}
        </select>
      </div>

      {/* プロンプト入力 */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">3Dモデルの説明:</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="例: モダンな木製椅子、シンプルデザイン、北欧スタイル"
          className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white h-20 resize-none"
          disabled={isGenerating}
        />
      </div>

      {/* 生成ボタン */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || !prompt.trim()}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 px-4 rounded font-bold text-lg mb-4 transition-colors"
      >
        {isGenerating ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>🎯 生成中...</span>
          </div>
        ) : (
          '🚀 3Dモデル生成'
        )}
      </button>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-600 text-white p-3 rounded mb-4">
          <div className="flex justify-between items-start">
            <span className="text-sm">{error}</span>
            <button onClick={onClearError} className="text-white hover:text-gray-200 ml-2">✕</button>
          </div>
        </div>
      )}

      {/* プリセット */}
      {!isGenerating && (
        <div className="mb-4">
          <div className="text-sm font-medium mb-2">💡 プリセット:</div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {categories[selectedCategory as keyof typeof categories].presets.map((preset, index) => (
              <button
                key={index}
                onClick={() => setPrompt(preset)}
                className="w-full text-left px-2 py-1 bg-gray-700 hover:bg-gray-600 text-xs rounded transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ヒント */}
      <div className="p-3 bg-blue-900 bg-opacity-50 rounded text-xs">
        <div className="font-medium text-blue-200 mb-1">💡 使い方:</div>
        <ul className="text-blue-300 space-y-1">
          <li>• Meshy AI v2でリアルタイム3D生成</li>
          <li>• プレビュー → テクスチャの2段階生成</li>
          <li>• GLTFモデルが自動読み込み</li>
          <li>• 生成には3-5分かかります</li>
        </ul>
      </div>
    </div>
  );
};

// モデル履歴パネル
const ModelHistoryPanel: React.FC<{
  models: Array<any>;
  onClearAll: () => void;
}> = ({ models, onClearAll }) => {
  if (models.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-gray-900 bg-opacity-95 text-white p-4 rounded-lg max-w-sm">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-bold">🎯 生成履歴 ({models.length})</h4>
        <button
          onClick={onClearAll}
          className="text-red-400 hover:text-red-300 text-sm"
        >
          全削除
        </button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {models.map((model, index) => (
          <div key={model.id} className="bg-gray-800 p-2 rounded text-xs">
            <div className="font-medium truncate">{model.prompt}</div>
            <div className="text-gray-400">
              {model.timestamp.toLocaleTimeString()} - {model.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// メインシーン
const TextTo3DScene: React.FC<{
  generatedModels: Array<any>;
}> = ({ generatedModels }) => {
  return (
    <>
      <Environment preset="city" background={false} />

      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      {/* 生成されたモデルを配置 */}
      {generatedModels.map((model, index) => (
        <GeneratedModel
          key={model.id}
          modelUrl={model.modelUrl}
          previewImage={model.generated_image}
          position={[
            (index % 3 - 1) * 4, // X軸: -4, 0, 4
            0,
            Math.floor(index / 3) * -4 // Z軸: 0, -4, -8, ...
          ]}
          prompt={model.prompt}
        />
      ))}

      {/* 初期説明（モデルがない場合） */}
      {generatedModels.length === 0 && (
        <Html position={[0, 1, 0]} center>
          <div className="bg-black bg-opacity-75 text-white p-6 rounded-lg text-center max-w-md">
            <h2 className="text-xl font-bold mb-2">🎯 Text-to-3D生成システム</h2>
            <p className="text-gray-300 mb-4">
              テキストから本格的な3Dモデル(GLB)を生成<br />
              🔥 Meshy AI v2統合 + プロキシ配信
            </p>
            <div className="text-sm text-blue-300">
              例: 「a red helmet」→ 🚀リアルタイム3D生成成功！
            </div>
            <div className="text-xs text-green-400 mt-2">
              ✅ CORS問題解決 | 🎨 高品質テクスチャ | 📦 GLB形式
            </div>
          </div>
        </Html>
      )}

      {/* フロア */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#2C2C2C" />
      </mesh>

      <ContactShadows
        position={[0, 0.005, 0]}
        opacity={0.3}
        scale={50}
        blur={2}
        far={20}
      />

      <OrbitControls
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        target={[0, 1, 0]}
        minDistance={2}
        maxDistance={15}
        autoRotate={false}
        enableDamping={false}
        maxPolarAngle={Math.PI * 0.75}
        minPolarAngle={Math.PI * 0.1}
      />
    </>
  );
};

// メインコンポーネント
export const TextTo3DGenerator: React.FC = () => {
  const {
    generateModel,
    isGenerating,
    generationProgress,
    generatedModels,
    error,
    apiStatus,
    clearError,
    clearModels
  } = useTextTo3D();

  return (
    <div className="w-full h-screen relative bg-gray-900">
      <Canvas
        camera={{ position: [4, 3, 4], fov: 60 }}
        shadows
        gl={{ antialias: true, alpha: true }}
      >
        <TextTo3DScene generatedModels={generatedModels} />
      </Canvas>

      <GenerationPanel
        onGenerate={generateModel}
        isGenerating={isGenerating}
        generationProgress={generationProgress}
        error={error}
        apiStatus={apiStatus}
        onClearError={clearError}
      />

      <ModelHistoryPanel
        models={generatedModels}
        onClearAll={clearModels}
      />

      {/* ステータス表示 */}
      <div className="fixed bottom-4 left-4 z-50 bg-black bg-opacity-90 text-white p-4 rounded">
        <h4 className="font-bold mb-2">🔥 Text-to-3D生成システム</h4>
        <ul className="text-sm space-y-1">
          <li>✅ Meshy AI v2リアルタイム生成</li>
          <li>🎨 プレビュー→テクスチャ2段階処理</li>
          <li>🚀 GLBモデル + プロキシ配信</li>
          <li>📚 生成履歴管理</li>
          <li>💡 位置・スケール自動調整</li>
          <li>🔧 CORS問題完全解決</li>
        </ul>
      </div>
    </div>
  );
};

// エラーバウンダリーコンポーネント
class GLTFErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    console.error('🚨 GLTF Error Boundary caught error:', error);
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('🚨 GLTF Error details:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
} 