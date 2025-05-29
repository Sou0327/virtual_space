import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, useGLTF, Html, TransformControls } from '@react-three/drei';
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
    scale?: number;
    aiModel: string;
    isPremium: boolean;
    quality: string;
    features: string[];
  }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<any>(null);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [modelRefs, setModelRefs] = useState<Map<string, React.RefObject<THREE.Group>>>(new Map());

  // ローカルストレージから履歴を読み込み
  useEffect(() => {
    const loadHistory = () => {
      const savedModels = localStorage.getItem('text_to_3d_history');
      if (savedModels) {
        try {
          const history = JSON.parse(savedModels);
          // timestampをDateオブジェクトに変換し、重複を除去
          const modelsWithDates = history.map((model: any) => ({
            ...model,
            timestamp: new Date(model.timestamp),
            scale: model.scale || 1.0
          }));

          // URLベースで重複を除去
          const uniqueModels = modelsWithDates.filter((model: any, index: number, self: any[]) =>
            self.findIndex(m => m.modelUrl === model.modelUrl) === index
          );

          setGeneratedModels(uniqueModels);
          console.log('✅ Text-to-3D履歴を読み込み:', uniqueModels.length, '件（重複除去済み）');
        } catch (error) {
          console.error('❌ Text-to-3D履歴の読み込みに失敗:', error);
        }
      }
    };

    loadHistory();
  }, []);

  // 履歴をローカルストレージに保存
  const saveToHistory = (models: typeof generatedModels) => {
    const modelsToSave = models.slice(0, 20); // 最大20件保存
    localStorage.setItem('text_to_3d_history', JSON.stringify(modelsToSave));
  };

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

  const generateModel = async (prompt: string, aiModel: string = 'meshy-4', isPremium: boolean = false) => {
    if (!prompt.trim()) return null;

    setIsGenerating(true);
    setError(null);

    // プレミアムモデルに応じた設定
    const isPremiumModel = aiModel === 'meshy-5';
    const estimatedTime = isPremiumModel ? '4-6分' : '3-5分';

    setGenerationProgress({
      stage: 'initializing',
      progress: 0,
      message: `${isPremiumModel ? 'Meshy AI v5' : 'Meshy AI v4'} 3Dモデル生成を開始しています...`,
      estimatedTime: estimatedTime
    });

    try {
      console.log('🎯 Generating 3D model from text:', prompt, 'Model:', aiModel, 'Premium:', isPremium);

      // 進捗シミュレーション用タイマー（プレミアムモデルは少し長め）
      let progressTimer: NodeJS.Timeout | null = null;
      const progressInterval = isPremiumModel ? 3000 : 2000;

      progressTimer = setInterval(() => {
        setGenerationProgress(prev => {
          if (!prev) return null;

          let newProgress = prev.progress + Math.random() * (isPremiumModel ? 3 : 5);
          let newStage = prev.stage;
          let newMessage = prev.message;

          if (newProgress > 20 && prev.stage === 'initializing') {
            newStage = 'mesh_generation';
            newMessage = isPremiumModel
              ? '高品質メッシュを生成中... (1/2)'
              : 'プレビューメッシュを生成中... (1/2)';
          } else if (newProgress > 60 && prev.stage === 'mesh_generation') {
            newStage = 'texture_generation';
            newMessage = isPremiumModel
              ? '高品質テクスチャを適用中... (2/2)'
              : 'テクスチャを適用中... (2/2)';
          }

          return {
            ...prev,
            stage: newStage,
            progress: Math.min(newProgress, 95),
            message: newMessage
          };
        });
      }, progressInterval);

      // プレミアムモデル用の高品質設定
      const textureResolution = isPremiumModel ? 2048 : 1024;
      const targetPolycount = isPremiumModel ? 60000 : 30000;

      const response = await fetch('http://localhost:3001/api/ai/text-to-3d', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt,
          art_style: 'realistic',
          texture_resolution: textureResolution,
          ai_model: aiModel,
          target_polycount: targetPolycount,
          enable_pbr: isPremiumModel, // プレミアムモデルはPBR有効
          quality_mode: isPremiumModel ? 'ultra' : 'standard',
          is_premium: isPremium
        })
      });

      if (progressTimer) clearInterval(progressTimer);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 API Response received');

      setGenerationProgress({
        stage: 'completed',
        progress: 100,
        message: `${isPremiumModel ? '💎 プレミアム' : '✅ 標準'}3Dモデル生成完了！`,
        estimatedTime: ''
      });

      if (data.model_url) {
        // 重複チェック：同じURLのモデルが既に存在する場合はスキップ
        const existingModel = generatedModels.find(model => model.modelUrl === data.model_url);
        if (existingModel) {
          console.log('⚠️ Model already exists, skipping duplicate');
          setGenerationProgress(null);
          return existingModel;
        }

        const newModel = {
          id: `model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // より一意なID
          prompt: prompt,
          modelUrl: data.model_url,
          generated_image: data.preview_image || data.generated_image,
          previewImage: data.preview_image || data.generated_image || '',
          timestamp: new Date(),
          status: data.status || 'success',
          format: data.format || 'gltf',
          scale: 1.0,
          aiModel: aiModel,
          isPremium: isPremium,
          quality: isPremiumModel ? 'premium' : 'standard',
          features: isPremiumModel ? ['高品質テクスチャ', '高解像度', 'PBRマテリアル'] : ['標準テクスチャ', '標準解像度']
        };

        const updatedModels = [newModel, ...generatedModels];
        setGeneratedModels(updatedModels);
        saveToHistory(updatedModels); // 履歴保存
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
  const clearModels = () => {
    setGeneratedModels([]);
    localStorage.removeItem('text_to_3d_history');
  };

  const deleteModel = (modelId: string) => {
    const updatedModels = generatedModels.filter(model => model.id !== modelId);
    setGeneratedModels(updatedModels);
    saveToHistory(updatedModels);
  };

  const saveModelsToHistory = (name: string) => {
    if (generatedModels.length === 0) return;

    const savedCollections = JSON.parse(localStorage.getItem('text_to_3d_collections') || '[]');
    const newCollection = {
      id: `collection_${Date.now()}`,
      name: name || `Collection ${new Date().toLocaleString()}`,
      models: [...generatedModels],
      createdAt: new Date().toISOString(),
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=150&fit=crop'
    };

    const updatedCollections = [newCollection, ...savedCollections].slice(0, 10);
    localStorage.setItem('text_to_3d_collections', JSON.stringify(updatedCollections));
    console.log('✅ コレクションを保存:', name);
  };

  const loadCollectionFromHistory = (collectionId: string) => {
    const savedCollections = JSON.parse(localStorage.getItem('text_to_3d_collections') || '[]');
    const collection = savedCollections.find((c: any) => c.id === collectionId);
    if (collection) {
      const modelsWithDates = collection.models.map((model: any) => ({
        ...model,
        timestamp: new Date(model.timestamp)
      }));

      // URLベースで重複を除去
      const uniqueModels = modelsWithDates.filter((model: any, index: number, self: any[]) =>
        self.findIndex(m => m.modelUrl === model.modelUrl) === index
      );

      setGeneratedModels(uniqueModels);
      saveToHistory(uniqueModels);
      console.log('✅ コレクションを読み込み:', collection.name, `(${uniqueModels.length}件)`);
    }
  };

  const deleteCollectionFromHistory = (collectionId: string) => {
    const savedCollections = JSON.parse(localStorage.getItem('text_to_3d_collections') || '[]');
    const updatedCollections = savedCollections.filter((c: any) => c.id !== collectionId);
    localStorage.setItem('text_to_3d_collections', JSON.stringify(updatedCollections));
  };

  const getCollections = () => {
    return JSON.parse(localStorage.getItem('text_to_3d_collections') || '[]');
  };

  const updateModelScale = (modelId: string, newScale: number) => {
    const updatedModels = generatedModels.map(model =>
      model.id === modelId ? { ...model, scale: newScale } : model
    );
    setGeneratedModels(updatedModels);
    saveToHistory(updatedModels);
  };

  const selectModel = (modelId: string | null) => {
    setSelectedModelId(modelId);
  };

  // モデルrefを登録
  const registerModelRef = (modelId: string, ref: React.RefObject<THREE.Group>) => {
    setModelRefs(prev => new Map(prev.set(modelId, ref)));
  };

  // モデルrefを取得
  const getModelRef = (modelId: string) => {
    return modelRefs.get(modelId);
  };

  return {
    generateModel,
    isGenerating,
    generationProgress,
    generatedModels,
    error,
    apiStatus,
    clearError,
    clearModels,
    deleteModel,
    saveModelsToHistory,
    loadCollectionFromHistory,
    deleteCollectionFromHistory,
    getCollections,
    selectedModelId,
    setSelectedModelId,
    updateModelScale,
    selectModel,
    registerModelRef,
    getModelRef
  };
};

// 生成された3Dモデル表示コンポーネント
const GeneratedModel: React.FC<{
  modelUrl: string;
  previewImage?: string;
  position: [number, number, number];
  prompt: string;
  modelId: string;
  scale: number;
  isSelected: boolean;
  onSelect: (modelId: string) => void;
  onScaleChange: (modelId: string, scale: number) => void;
  onRegisterRef: (modelId: string, ref: React.RefObject<THREE.Group>) => void;
  isTransforming: boolean;
}> = ({ modelUrl, previewImage, position, prompt, modelId, scale, isSelected, onSelect, onScaleChange, onRegisterRef, isTransforming }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isGltfModel, setIsGltfModel] = useState(false);
  const [basePosition] = useState<[number, number, number]>(position); // 基本位置を固定

  // refを登録
  useEffect(() => {
    onRegisterRef(modelId, groupRef);
  }, [modelId, onRegisterRef]);

  // 位置を基本位置に設定（初期設定のみ）
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(basePosition[0], basePosition[1], basePosition[2]);
    }
  }, [basePosition]);

  // スケール値が変更された時にgroupRefのスケールを更新（TransformControls使用中は除く）
  useEffect(() => {
    if (groupRef.current && !isTransforming) {
      groupRef.current.scale.setScalar(scale);
    }
  }, [scale, isTransforming]);

  // GLTFモデルかどうかを判定とURL検証
  useEffect(() => {
    const isGltf = modelUrl.includes('.gltf') || modelUrl.includes('.glb');
    console.log('🎯 Model type detected:', isGltf ? 'GLTF/GLB' : 'Other', modelUrl);

    // 無効なURLパターンを検出（ThreeJSサンプルのみ）
    const invalidUrlPatterns = [
      'threejs.org/examples/models/gltf/DamagedHelmet', // 無効なThreeJSサンプル
    ];

    const isInvalidUrl = invalidUrlPatterns.some(pattern => modelUrl.includes(pattern));

    if (modelUrl.includes('assets.meshy.ai')) {
      console.warn('⚠️ Meshy AI URL detected - using fallback due to CORS restrictions');
      setIsGltfModel(false);
      setLoadError('履歴モデル: AI生成済み');
      return;
    }

    if (isInvalidUrl) {
      console.warn('⚠️ Invalid ThreeJS sample URL detected:', modelUrl);
      setIsGltfModel(false);
      setLoadError('無効なモデルURL - フォールバック表示');
      return;
    }

    // URLが無効な場合もGLTFロードを無効化
    if (!modelUrl || modelUrl === '') {
      setIsGltfModel(false);
      setLoadError('空のURL');
      return;
    }

    // 有効なURLの場合はGLTFロードを有効化
    if (isGltf) {
      console.log('✅ Valid GLTF URL detected:', modelUrl);
      setIsGltfModel(true);
      setLoadError(null);
    } else {
      setIsGltfModel(false);
    }
  }, [modelUrl]);

  // 自動回転は一時的に無効化（高速回転問題対策）
  // useFrame((state) => {
  //   if (groupRef.current && !isSelected && !isTransforming) {
  //     // 自動回転のみ適用（位置リセットは削除）
  //     groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
  //   }
  // });

  const handleClick = (event: any) => {
    event.stopPropagation();
    onSelect(modelId);
  };

  // GLTFモデルコンポーネント
  const GLTFModel: React.FC<{ url: string }> = ({ url }) => {
    const [hasError, setHasError] = useState(false);
    const [shouldLoadGLTF, setShouldLoadGLTF] = useState(true);
    const [isLoaded, setIsLoaded] = useState(false);

    // URL検証（依存配列を適切に管理）
    useEffect(() => {
      const invalidUrlPatterns = [
        'threejs.org/examples',
        'DamagedHelmet.gltf',
        'example.com',
        'localhost/dummy',
        'placeholder'
      ];

      const isInvalidUrl = invalidUrlPatterns.some(pattern => url.includes(pattern));

      if (url.includes('assets.meshy.ai') || isInvalidUrl || !url) {
        setShouldLoadGLTF(false);
        setHasError(true);
        setIsLoaded(false);
        return;
      }

      setShouldLoadGLTF(true);
      setHasError(false);
      setIsLoaded(false);
    }, [url]); // URLが変更された時のみ実行

    // 成功時にエラー状態をクリア
    useEffect(() => {
      if (isLoaded && shouldLoadGLTF) {
        setLoadError(null);
      }
    }, [isLoaded, shouldLoadGLTF]);

    // プロンプトに基づくインテリジェントフォールバック
    const createIntelligentFallback = () => {
      const lowerPrompt = prompt.toLowerCase();

      // 色を決定
      let color = '#9f7aea'; // デフォルト紫
      if (lowerPrompt.includes('red') || lowerPrompt.includes('helmet')) color = '#ff6b6b';
      else if (lowerPrompt.includes('blue') || lowerPrompt.includes('water')) color = '#4A90E2';
      else if (lowerPrompt.includes('green') || lowerPrompt.includes('plant')) color = '#48bb78';
      else if (lowerPrompt.includes('yellow') || lowerPrompt.includes('gold') || lowerPrompt.includes('黄金') || lowerPrompt.includes('golden')) color = '#ffd700';
      else if (lowerPrompt.includes('chair') || lowerPrompt.includes('furniture')) color = '#8b4513';
      else if (lowerPrompt.includes('metal') || lowerPrompt.includes('tool') || lowerPrompt.includes('robot') || lowerPrompt.includes('ロボ')) color = '#c0c0c0';

      // 形状を決定
      let shape = 'box'; // デフォルト
      if (lowerPrompt.includes('bottle') || lowerPrompt.includes('cylinder')) shape = 'cylinder';
      else if (lowerPrompt.includes('sphere') || lowerPrompt.includes('ball')) shape = 'sphere';
      else if (lowerPrompt.includes('helmet') || lowerPrompt.includes('head')) shape = 'sphere';
      else if (lowerPrompt.includes('chair') || lowerPrompt.includes('seat')) shape = 'chair';
      else if (lowerPrompt.includes('car') || lowerPrompt.includes('vehicle')) shape = 'vehicle';
      else if (lowerPrompt.includes('house') || lowerPrompt.includes('building')) shape = 'house';
      else if (lowerPrompt.includes('robot') || lowerPrompt.includes('ロボ')) shape = 'robot';

      const renderShape = () => {
        switch (shape) {
          case 'cylinder':
            return <cylinderGeometry args={[0.4, 0.4, 1.2]} />;
          case 'sphere':
            return <sphereGeometry args={[0.6]} />;
          case 'chair':
            return (
              <group>
                {/* 座面 */}
                <mesh position={[0, 0.5, 0]}>
                  <boxGeometry args={[0.8, 0.1, 0.8]} />
                  <meshStandardMaterial color={color} />
                </mesh>
                {/* 背もたれ */}
                <mesh position={[0, 0.95, -0.35]}>
                  <boxGeometry args={[0.8, 0.8, 0.1]} />
                  <meshStandardMaterial color={color} />
                </mesh>
                {/* 脚 */}
                {[[-0.3, -0.3], [0.3, -0.3], [-0.3, 0.3], [0.3, 0.3]].map((pos, i) => (
                  <mesh key={i} position={[pos[0], 0.25, pos[1]]}>
                    <cylinderGeometry args={[0.05, 0.05, 0.5]} />
                    <meshStandardMaterial color={color} />
                  </mesh>
                ))}
              </group>
            );
          case 'vehicle':
            return (
              <group>
                {/* 車体 */}
                <mesh position={[0, 0.3, 0]}>
                  <boxGeometry args={[1.5, 0.4, 0.7]} />
                  <meshStandardMaterial color={color} />
                </mesh>
                {/* 屋根 */}
                <mesh position={[0, 0.65, 0]}>
                  <boxGeometry args={[0.8, 0.3, 0.6]} />
                  <meshStandardMaterial color={color} />
                </mesh>
                {/* タイヤ */}
                {[[-0.5, 0.4], [0.5, 0.4], [-0.5, -0.4], [0.5, -0.4]].map((pos, i) => (
                  <mesh key={i} position={[pos[0], 0.15, pos[1]]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.15, 0.15, 0.1]} />
                    <meshStandardMaterial color="#333" />
                  </mesh>
                ))}
              </group>
            );
          case 'house':
            return (
              <group>
                {/* 建物本体 */}
                <mesh position={[0, 0.5, 0]}>
                  <boxGeometry args={[1.2, 1, 1]} />
                  <meshStandardMaterial color={color} />
                </mesh>
                {/* 屋根 */}
                <mesh position={[0, 1.2, 0]} rotation={[0, Math.PI / 4, 0]}>
                  <coneGeometry args={[0.8, 0.6, 4]} />
                  <meshStandardMaterial color="#8b4513" />
                </mesh>
              </group>
            );
          case 'robot':
            return (
              <group>
                {/* 胴体 */}
                <mesh position={[0, 0.8, 0]}>
                  <boxGeometry args={[0.6, 0.8, 0.4]} />
                  <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
                </mesh>
                {/* 頭部 */}
                <mesh position={[0, 1.4, 0]}>
                  <boxGeometry args={[0.4, 0.4, 0.4]} />
                  <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
                </mesh>
                {/* 腕 */}
                <mesh position={[-0.5, 0.9, 0]}>
                  <boxGeometry args={[0.2, 0.6, 0.2]} />
                  <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
                </mesh>
                <mesh position={[0.5, 0.9, 0]}>
                  <boxGeometry args={[0.2, 0.6, 0.2]} />
                  <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
                </mesh>
                {/* 脚 */}
                <mesh position={[-0.2, 0.25, 0]}>
                  <boxGeometry args={[0.2, 0.5, 0.2]} />
                  <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
                </mesh>
                <mesh position={[0.2, 0.25, 0]}>
                  <boxGeometry args={[0.2, 0.5, 0.2]} />
                  <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
                </mesh>
                {/* 背負った剣 */}
                <mesh position={[0, 1.2, -0.3]} rotation={[0.2, 0, 0]}>
                  <boxGeometry args={[0.05, 1.0, 0.1]} />
                  <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
                </mesh>
                {/* 剣の柄 */}
                <mesh position={[0, 0.6, -0.25]} rotation={[0.2, 0, 0]}>
                  <boxGeometry args={[0.08, 0.3, 0.08]} />
                  <meshStandardMaterial color="#8b4513" />
                </mesh>
              </group>
            );
          default:
            return <boxGeometry args={[1, 1, 1]} />;
        }
      };

      return (
        <group>
          {/* メインオブジェクト */}
          <mesh position={[0, shape === 'sphere' || shape === 'cylinder' ? 0.6 : 0.5, 0]} castShadow>
            {renderShape()}
            {shape === 'chair' || shape === 'vehicle' || shape === 'house' ? null : (
              <meshStandardMaterial
                color={color}
                metalness={0.4}
                roughness={0.6}
                emissive={color}
                emissiveIntensity={0.05}
              />
            )}
          </mesh>

          {/* AI生成済みインジケーター */}
          <mesh position={[0, 2.2, 0]}>
            <sphereGeometry args={[0.08]} />
            <meshBasicMaterial color="#00ff88" />
          </mesh>

          {/* キラキラエフェクト */}
          {[...Array(3)].map((_, i) => (
            <mesh
              key={i}
              position={[
                Math.sin(i * 2.1) * 0.8,
                1.5 + Math.cos(i * 1.7) * 0.3,
                Math.cos(i * 2.3) * 0.8
              ]}
            >
              <sphereGeometry args={[0.03]} />
              <meshBasicMaterial color="#ffd700" />
            </mesh>
          ))}
        </group>
      );
    };

    // エラーまたは制限されたURLの場合は即座にフォールバック
    if (hasError || !shouldLoadGLTF) {
      return createIntelligentFallback();
    }

    // GLTF読み込み用コンポーネント（位置調整を外部groupで実行）
    const GLTFContent = () => {
      let gltf;

      try {
        gltf = useGLTF(url);

        if (!gltf || !gltf.scene) {
          // レンダリング中の状態更新を避けるため、エラー時は単純にフォールバックを返す
          return createIntelligentFallback();
        }
      } catch (error) {
        // エラー時もレンダリング中の状態更新を避ける
        return createIntelligentFallback();
      }

      // 成功時のマーキング（レンダリング後に実行）
      useEffect(() => {
        if (gltf && gltf.scene) {
          setIsLoaded(true);
        }
      }, [gltf]);

      // バウンディングボックスを計算（位置調整用）
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      // 調整値を計算（シーンを直接変更しない）
      const offsetX = -center.x;
      const offsetY = -box.min.y + 0.1;
      const offsetZ = -center.z;

      // スケール調整
      const maxDimension = Math.max(size.x, size.y, size.z);
      const modelScale = maxDimension > 2 ? 2 / maxDimension : 1;

      return (
        <group position={[offsetX, offsetY, offsetZ]} scale={[modelScale, modelScale, modelScale]}>
          <primitive object={gltf.scene} />
        </group>
      );
    };

    return <GLTFContent />;
  };

  return (
    <group ref={groupRef} position={position} onClick={handleClick}>
      {/* ステータス表示 */}
      <Html position={[0, 2.5, 0]} center>
        <div className={`bg-black bg-opacity-75 text-white px-3 py-1 rounded text-xs max-w-48 text-center ${isSelected ? 'border-2 border-yellow-400' : ''
          }`}>
          <div className="font-bold">
            {modelUrl.includes('assets.meshy.ai') ? '🔥 AI生成済み' :
              isGltfModel ? '🎨 3Dモデル' : '🎭 デモモード'}
            {isSelected && ' [選択中]'}
          </div>
          <div className="text-gray-300 text-xs mt-1 truncate">{prompt}</div>
          {isSelected && (
            <div className="text-yellow-400 text-xs">拡大縮小: {(scale * 100).toFixed(0)}%</div>
          )}
          {modelUrl.includes('assets.meshy.ai') && (
            <div className="text-green-400 text-xs">✅ 履歴から復元</div>
          )}
          {isGltfModel && !modelUrl.includes('assets.meshy.ai') && (
            <div className="text-green-400 text-xs">✅ GLTF/GLB</div>
          )}
          {loadError && (
            <div className="text-orange-400 text-xs">⚠️ フォールバック表示</div>
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
          <GLTFErrorBoundary
            fallback={
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
            }
            onError={(error) => {
              console.error('🚨 GLTF Error caught by boundary:', error);
              // レンダリング後に状態更新
              setTimeout(() => setLoadError('GLTFエラー: フォールバック表示'), 0);
            }}
          >
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

      {/* 選択時の境界線 */}
      {isSelected && (
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[2.2, 2.2, 2.2]} />
          <meshBasicMaterial
            color="#ffff00"
            wireframe={true}
            transparent={true}
            opacity={0.8}
          />
        </mesh>
      )}

      {/* 基底 */}
      <mesh position={[0, -0.01, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 0.02]} />
        <meshStandardMaterial
          color={isSelected ? "#444" : "#333"}
          opacity={0.5}
          transparent
        />
      </mesh>
    </group>
  );
};

// Text-to-3D生成パネル
const GenerationPanel: React.FC<{
  onGenerate: (prompt: string, aiModel?: string, isPremium?: boolean) => void;
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
  const [prompt, setPrompt] = useState('high quality damaged military helmet, weathered metal surface, realistic textures');
  const [selectedCategory, setSelectedCategory] = useState('furniture');
  const [selectedAIModel, setSelectedAIModel] = useState('meshy-4');
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);

  const aiModels = [
    {
      id: 'meshy-4',
      name: 'Meshy AI v4',
      tier: 'standard',
      speed: '3-5分',
      quality: '⭐⭐⭐',
      description: '標準品質・PBR対応',
      features: ['基本テクスチャ', '標準解像度', '30k ポリゴン', 'PBRマテリアル対応']
    },
    {
      id: 'meshy-5',
      name: 'Meshy AI v5',
      tier: 'premium',
      speed: '4-6分',
      quality: '⭐⭐⭐⭐',
      description: '高品質・最新モデル（PBR制限あり）',
      features: ['高品質テクスチャ', '2K解像度', '60k ポリゴン', '改良されたAI', '※PBR非対応']
    }
  ];

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

  const selectedModel = aiModels.find(model => model.id === selectedAIModel);
  const isPremiumModel = selectedModel?.tier === 'premium';

  const handleGenerate = () => {
    if (prompt.trim() && !isGenerating) {
      if (isPremiumModel) {
        setShowPremiumDialog(true);
      } else {
        onGenerate(prompt.trim(), selectedAIModel, false);
      }
    }
  };

  const confirmPremiumGenerate = () => {
    onGenerate(prompt.trim(), selectedAIModel, true);
    setShowPremiumDialog(false);
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
            {apiStatus.development_mode ? '🔥 デモモード' : '🔥 AI生成モード'}
          </div>
          <div className="text-xs mt-1">{apiStatus.message}</div>
        </div>
      )}

      {/* AIモデル選択 */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">AIモデル:</label>
        <select
          value={selectedAIModel}
          onChange={(e) => setSelectedAIModel(e.target.value)}
          className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
          disabled={isGenerating}
        >
          {aiModels.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>

        {/* 選択されたモデルの詳細 */}
        {selectedModel && (
          <div className={`mt-2 p-3 rounded text-xs ${isPremiumModel
            ? 'bg-purple-900 border border-purple-500'
            : 'bg-blue-900 border border-blue-500'
            }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium">{selectedModel.name}</span>
              <span className={`px-2 py-1 rounded text-xs font-bold ${isPremiumModel ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'
                }`}>
                {isPremiumModel ? '💎 プレミアム' : '🆓 標準'}
              </span>
            </div>
            <div className="text-gray-300 mb-2">{selectedModel.description}</div>
            <div className="text-xs space-y-1">
              <div>⏱️ 生成時間: {selectedModel.speed}</div>
              <div>✨ 品質: {selectedModel.quality}</div>
            </div>
            <div className="mt-2">
              <div className="text-xs text-gray-400 mb-1">特徴:</div>
              <div className="flex flex-wrap gap-1">
                {selectedModel.features.map((feature, index) => (
                  <span key={index} className="bg-gray-700 px-2 py-1 rounded text-xs">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 進捗表示 */}
      {generationProgress && (
        <div className="mb-4 p-4 bg-purple-900 bg-opacity-70 rounded-lg border border-purple-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              🔥 {selectedModel?.name} 生成中
            </span>
            <span className="text-xs text-purple-300">{generationProgress.estimatedTime}</span>
          </div>

          {/* プログレスバー */}
          <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
            <div
              className={`h-2 rounded-full transition-all duration-500 ease-out ${isPremiumModel
                ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                }`}
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
        className={`w-full text-white py-3 px-4 rounded font-bold text-lg mb-4 transition-colors ${isPremiumModel
          ? 'bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600'
          : 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600'
          }`}
      >
        {isGenerating ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>🎯 生成中...</span>
          </div>
        ) : (
          <span>
            {isPremiumModel ? '💎 プレミアム生成' : '🚀 3Dモデル生成'}
          </span>
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
          <li>• 💎 プレミアムモデルで最高品質生成</li>
          <li>• 🆓 標準モデルで手軽に試作</li>
          <li>• プレビュー → テクスチャの2段階生成</li>
          <li>• GLTFモデルが自動読み込み</li>
        </ul>
      </div>

      {/* プレミアム確認ダイアログ */}
      {showPremiumDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-gray-900 p-6 rounded-lg border border-purple-500 w-96">
            <h3 className="text-lg font-bold text-purple-400 mb-4">💎 プレミアム生成の確認</h3>
            <div className="mb-4">
              <div className="text-white mb-2">選択されたモデル: <span className="text-purple-400">{selectedModel?.name}</span></div>
              <div className="text-gray-300 text-sm mb-3">{selectedModel?.description}</div>
              <div className="bg-purple-900 p-3 rounded border border-purple-600">
                <div className="text-sm text-purple-200 mb-2">💎 プレミアム特典:</div>
                <ul className="text-xs text-purple-300 space-y-1">
                  {selectedModel?.features.map((feature, index) => (
                    <li key={index}>• {feature}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={confirmPremiumGenerate}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded"
              >
                💎 生成開始
              </button>
              <button
                onClick={() => setShowPremiumDialog(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// TransformControlsコンポーネント
const ModelTransformControls: React.FC<{
  selectedModelId: string | null;
  getModelRef: (modelId: string) => React.RefObject<THREE.Group> | undefined;
  onScaleChange: (modelId: string, scale: number) => void;
  onTransformStart: () => void;
  onTransformEnd: () => void;
}> = ({ selectedModelId, getModelRef, onScaleChange, onTransformStart, onTransformEnd }) => {
  const transformRef = useRef<any>(null);
  const lastScaleRef = useRef<number>(1);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // クリーンアップ - 常に呼び出されるようにする（Hooks のルール準拠）
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // 条件チェック（親コンポーネントで行うため、ここでは簡略化）
  const modelRef = getModelRef(selectedModelId!); // selectedModelIdは親で確認済み

  const handleObjectChange = () => {
    try {
      if (transformRef.current && modelRef?.current && selectedModelId) {
        const currentScale = transformRef.current.object.scale.x;

        // スケールを0.1〜5.0の範囲に制限
        const clampedScale = Math.max(0.1, Math.min(5.0, currentScale));

        // 無効な値をチェック
        if (isNaN(clampedScale) || !isFinite(clampedScale)) {
          return;
        }

        // 変化が十分大きい場合のみ更新
        if (Math.abs(clampedScale - lastScaleRef.current) > 0.02) {
          lastScaleRef.current = clampedScale;

          // デバウンス処理で頻繁な更新を制限
          if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
          }

          debounceTimeoutRef.current = setTimeout(() => {
            try {
              onScaleChange(selectedModelId, clampedScale);
            } catch (error) {
              console.warn('Scale change error:', error);
            }
          }, 50); // 50ms デバウンス
        }
      }
    } catch (error) {
      console.warn('Transform control error:', error);
    }
  };

  const handleDragStart = () => {
    try {
      onTransformStart();
    } catch (error) {
      console.warn('Transform start error:', error);
    }
  };

  const handleDragEnd = () => {
    try {
      // デバウンスタイマーをクリア
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
      onTransformEnd();
    } catch (error) {
      console.warn('Transform end error:', error);
    }
  };

  // modelRefが無い場合は何も表示しない
  if (!modelRef?.current) {
    return null;
  }

  return (
    <TransformControls
      ref={transformRef}
      object={modelRef.current}
      mode="scale"
      showX={true}
      showY={true}
      showZ={true}
      size={0.8}
      space="local"
      onObjectChange={handleObjectChange}
      onMouseDown={handleDragStart}
      onMouseUp={handleDragEnd}
    />
  );
};

// メインシーン
const TextTo3DScene: React.FC<{
  generatedModels: Array<any>;
  selectedModelId: string | null;
  onSelectModel: (modelId: string) => void;
  onScaleChange: (modelId: string, scale: number) => void;
  registerModelRef: (modelId: string, ref: React.RefObject<THREE.Group>) => void;
  getModelRef: (modelId: string) => React.RefObject<THREE.Group> | undefined;
}> = ({ generatedModels, selectedModelId, onSelectModel, onScaleChange, registerModelRef, getModelRef }) => {
  const [isTransforming, setIsTransforming] = useState(false);

  const handleBackgroundClick = () => {
    onSelectModel(''); // 空文字で選択解除
  };

  const handleTransformStart = () => {
    setIsTransforming(true);
  };

  const handleTransformEnd = () => {
    setIsTransforming(false);
  };

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
          modelId={model.id}
          scale={model.scale || 1.0}
          isSelected={model.id === selectedModelId}
          onSelect={onSelectModel}
          onScaleChange={onScaleChange}
          onRegisterRef={registerModelRef}
          isTransforming={isTransforming}
        />
      ))}

      {/* Transform Controls */}
      {selectedModelId && (() => {
        const modelRef = getModelRef(selectedModelId);
        return modelRef && modelRef.current ? (
          <ModelTransformControls
            selectedModelId={selectedModelId}
            getModelRef={getModelRef}
            onScaleChange={onScaleChange}
            onTransformStart={handleTransformStart}
            onTransformEnd={handleTransformEnd}
          />
        ) : null;
      })()}

      {/* フロア（クリックで選択解除） */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow onClick={handleBackgroundClick}>
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
        minDistance={1}
        maxDistance={20}
        autoRotate={false}
        enableDamping={true}
        dampingFactor={0.05}
        maxPolarAngle={Math.PI * 0.8}
        minPolarAngle={Math.PI * 0.1}
        zoomSpeed={1.5}
        panSpeed={1.0}
        rotateSpeed={1.0}
        makeDefault
      />
    </>
  );
};

// コレクション履歴パネル
const CollectionHistoryPanel: React.FC<{
  onSaveCollection: (name: string) => void;
  onLoadCollection: (collectionId: string) => void;
  onDeleteCollection: (collectionId: string) => void;
  onClearAll: () => void;
  getCollections: () => any[];
  currentModelsCount: number;
}> = ({ onSaveCollection, onLoadCollection, onDeleteCollection, onClearAll, getCollections, currentModelsCount }) => {
  const [showHistory, setShowHistory] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [collectionName, setCollectionName] = useState('');
  const [collections, setCollections] = useState<any[]>([]);

  // コレクション一覧を定期更新
  useEffect(() => {
    const updateCollections = () => {
      setCollections(getCollections());
    };
    updateCollections();
    const interval = setInterval(updateCollections, 1000);
    return () => clearInterval(interval);
  }, [getCollections]);

  const handleSaveCollection = () => {
    if (currentModelsCount === 0) {
      alert('保存するモデルがありません');
      return;
    }
    setShowSaveDialog(true);
  };

  const confirmSave = () => {
    const name = collectionName.trim() || `Collection ${new Date().toLocaleString()}`;
    onSaveCollection(name);
    setCollectionName('');
    setShowSaveDialog(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed top-4 right-80 z-50">
      {/* 履歴トリガーボタン */}
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition-all duration-200 shadow-lg"
      >
        <div className="flex items-center space-x-2">
          <span className="text-lg">💾</span>
          <span className="text-xs font-medium">コレクション</span>
          {collections.length > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-1 min-w-4 h-4 flex items-center justify-center">
              {collections.length}
            </span>
          )}
        </div>
      </button>

      {/* 履歴パネル */}
      {showHistory && (
        <div className="absolute top-12 right-0 bg-gray-900 bg-opacity-95 p-4 rounded-lg shadow-xl border border-gray-600 w-80 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white">💾 コレクション履歴</h3>
            <button
              onClick={() => setShowHistory(false)}
              className="text-gray-400 hover:text-white text-lg"
            >
              ✕
            </button>
          </div>

          {/* 現在のコレクション操作 */}
          <div className="mb-4 p-3 bg-gray-800 rounded border">
            <div className="text-xs text-gray-400 mb-2">現在のコレクション ({currentModelsCount} モデル)</div>
            <div className="flex space-x-2">
              <button
                onClick={handleSaveCollection}
                disabled={currentModelsCount === 0}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-xs py-2 px-3 rounded"
              >
                💾 保存
              </button>
              <button
                onClick={onClearAll}
                disabled={currentModelsCount === 0}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white text-xs py-2 px-3 rounded"
              >
                🗑️ クリア
              </button>
            </div>
          </div>

          {/* コレクション一覧 */}
          {collections.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <div className="text-2xl mb-2">📭</div>
              <div className="text-sm">保存されたコレクションがありません</div>
            </div>
          ) : (
            <div className="space-y-2">
              {collections.map((collection) => (
                <div key={collection.id} className="bg-gray-800 p-3 rounded border border-gray-700 hover:border-purple-500 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-white text-sm truncate">{collection.name}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {collection.models.length} モデル
                      </div>
                      <div className="text-xs text-gray-500">{formatDate(collection.createdAt)}</div>
                    </div>
                    {collection.thumbnail && (
                      <img
                        src={collection.thumbnail}
                        alt={collection.name}
                        className="w-12 h-9 object-cover rounded ml-2"
                      />
                    )}
                  </div>
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => {
                        onLoadCollection(collection.id);
                        setShowHistory(false);
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded"
                    >
                      📂 読込
                    </button>
                    <button
                      onClick={() => onDeleteCollection(collection.id)}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs py-1 px-2 rounded"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 保存ダイアログ */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-600 w-96">
            <h3 className="text-lg font-bold text-white mb-4">💾 コレクションを保存</h3>
            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-2">コレクション名:</label>
              <input
                type="text"
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                placeholder={`Collection ${new Date().toLocaleString()}`}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                autoFocus
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={confirmSave}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
              >
                💾 保存
              </button>
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setCollectionName('');
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// スケール操作パネル
const ScaleControlPanel: React.FC<{
  selectedModelId: string | null;
  generatedModels: Array<any>;
  onScaleChange: (modelId: string, scale: number) => void;
}> = ({ selectedModelId, generatedModels, onScaleChange }) => {
  const selectedModel = generatedModels.find(model => model.id === selectedModelId);

  if (!selectedModelId || !selectedModel) {
    return null;
  }

  const currentScale = selectedModel.scale || 1.0;

  const handleScaleSlider = (value: number) => {
    onScaleChange(selectedModelId, value);
  };

  const handleScaleInput = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0.1 && numValue <= 5.0) {
      onScaleChange(selectedModelId, numValue);
    }
  };

  const resetScale = () => {
    onScaleChange(selectedModelId, 1.0);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-gray-900 bg-opacity-95 text-white p-4 rounded-lg border border-yellow-400">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-yellow-400">🎯 スケール操作</h4>
        <button
          onClick={resetScale}
          className="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded"
        >
          リセット
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <div className="text-sm font-medium truncate mb-1">{selectedModel.prompt}</div>
          <div className="text-xs text-gray-400">現在のサイズ: {(currentScale * 100).toFixed(0)}%</div>
        </div>

        {/* スライダー */}
        <div>
          <label className="block text-xs mb-1">スケール調整:</label>
          <input
            type="range"
            min="0.1"
            max="5.0"
            step="0.1"
            value={currentScale}
            onChange={(e) => handleScaleSlider(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>10%</span>
            <span>100%</span>
            <span>500%</span>
          </div>
        </div>

        {/* 数値入力 */}
        <div>
          <label className="block text-xs mb-1">直接入力:</label>
          <div className="flex space-x-2">
            <input
              type="number"
              min="0.1"
              max="5.0"
              step="0.1"
              value={currentScale.toFixed(1)}
              onChange={(e) => handleScaleInput(e.target.value)}
              className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-white"
            />
            <span className="text-xs text-gray-400 self-center">倍</span>
          </div>
        </div>

        {/* プリセットボタン */}
        <div>
          <div className="text-xs mb-1">プリセット:</div>
          <div className="grid grid-cols-4 gap-1">
            {[0.5, 1.0, 1.5, 2.0].map((preset) => (
              <button
                key={preset}
                onClick={() => handleScaleSlider(preset)}
                className={`text-xs py-1 px-2 rounded transition-colors ${Math.abs(currentScale - preset) < 0.1
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
              >
                {preset}x
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-gray-400 border-t border-gray-700 pt-2">
          💡 ヒント: オブジェクトをクリックして選択、TransformControlsまたはこのパネルでサイズ調整
        </div>
      </div>
    </div>
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
    clearModels,
    deleteModel,
    saveModelsToHistory,
    loadCollectionFromHistory,
    deleteCollectionFromHistory,
    getCollections,
    selectedModelId,
    setSelectedModelId,
    updateModelScale,
    selectModel,
    registerModelRef,
    getModelRef
  } = useTextTo3D();

  return (
    <div className="w-full h-screen relative bg-gray-900">
      <Canvas
        camera={{ position: [3, 2, 3], fov: 60 }}
        shadows
        gl={{ antialias: true, alpha: true }}
      >
        <TextTo3DScene
          generatedModels={generatedModels}
          selectedModelId={selectedModelId}
          onSelectModel={setSelectedModelId}
          onScaleChange={updateModelScale}
          registerModelRef={registerModelRef}
          getModelRef={getModelRef}
        />
      </Canvas>

      <GenerationPanel
        onGenerate={(prompt, aiModel, isPremium) => generateModel(prompt, aiModel, isPremium)}
        isGenerating={isGenerating}
        generationProgress={generationProgress}
        error={error}
        apiStatus={apiStatus}
        onClearError={clearError}
      />

      <CollectionHistoryPanel
        onSaveCollection={saveModelsToHistory}
        onLoadCollection={loadCollectionFromHistory}
        onDeleteCollection={deleteCollectionFromHistory}
        onClearAll={clearModels}
        getCollections={getCollections}
        currentModelsCount={generatedModels.length}
      />

      <ScaleControlPanel
        selectedModelId={selectedModelId}
        generatedModels={generatedModels}
        onScaleChange={updateModelScale}
      />

      {/* ステータス表示 */}
      <div className="fixed bottom-4 left-4 z-50 bg-black bg-opacity-90 text-white p-3 rounded">
        <h4 className="font-bold mb-2">🔥 Text-to-3D</h4>
        <ul className="text-xs space-y-1">
          <li>✅ AI 3D生成システム</li>
          <li>🎯 クリック選択・スケール調整</li>
          <li>💎 プレミアムモデル対応</li>
          <li>📦 GLB形式出力</li>
          <li>🎨 高品質テクスチャ</li>
        </ul>
      </div>
    </div>
  );
};

// エラーバウンダリーコンポーネント
class GLTFErrorBoundary extends React.Component<
  {
    children: React.ReactNode;
    fallback: React.ReactNode;
    onError?: (error: Error, errorInfo: any) => void;
  },
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

    // エラーコールバックを呼び出し
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: any) {
    // propsが変更された場合はエラー状態をリセット
    if (prevProps.children !== this.props.children) {
      if (this.state.hasError) {
        this.setState({ hasError: false });
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
} 