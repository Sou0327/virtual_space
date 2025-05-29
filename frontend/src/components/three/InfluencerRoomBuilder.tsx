import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html, TransformControls } from '@react-three/drei';
import { Physics, useBox, usePlane } from '@react-three/cannon';
import * as THREE from 'three';

// 3Dモデル管理フック
const useRoomBuilder = () => {
  const [models, setModels] = useState<Array<{
    id: string;
    type: 'room' | 'furniture' | 'decoration' | 'large_structure';
    prompt: string;
    modelUrl: string;
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
    physics: {
      type: 'static' | 'dynamic' | 'kinematic';
      mass: number;
      material: string;
    };
    metadata: {
      size: 'small' | 'medium' | 'large' | 'room_scale';
      category: string;
      canPlaceOn: boolean;
      canHoldObjects: boolean;
    };
  }>>([]);

  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [roomTheme, setRoomTheme] = useState('modern_apartment');
  const [roomHistory, setRoomHistory] = useState<Array<{
    id: string;
    name: string;
    theme: string;
    createdAt: string;
    models: typeof models;
    thumbnail?: string;
  }>>([]);

  // ローカルストレージから履歴を読み込み
  useEffect(() => {
    const savedHistory = localStorage.getItem('fanverse_room_history');
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        setRoomHistory(history);
      } catch (error) {
        console.error('履歴の読み込みに失敗:', error);
      }
    }
  }, []);

  // 履歴をローカルストレージに保存
  const saveToHistory = (roomName: string) => {
    if (models.length === 0) return;

    const newRoom = {
      id: `room_${Date.now()}`,
      name: roomName || `${roomTheme} Room`,
      theme: roomTheme,
      createdAt: new Date().toISOString(),
      models: [...models],
      thumbnail: `https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=150&fit=crop&crop=center`
    };

    const updatedHistory = [newRoom, ...roomHistory].slice(0, 10);
    setRoomHistory(updatedHistory);
    localStorage.setItem('fanverse_room_history', JSON.stringify(updatedHistory));

    console.log('✅ ルームを履歴に保存:', roomName);
  };

  // 履歴からルームを読み込み
  const loadFromHistory = (roomId: string) => {
    const room = roomHistory.find(r => r.id === roomId);
    if (room) {
      setModels(room.models);
      setRoomTheme(room.theme);
      setSelectedModel(null);
      console.log('✅ 履歴からルームを読み込み:', room.name);
    }
  };

  // 履歴から削除
  const deleteFromHistory = (roomId: string) => {
    const updatedHistory = roomHistory.filter(r => r.id !== roomId);
    setRoomHistory(updatedHistory);
    localStorage.setItem('fanverse_room_history', JSON.stringify(updatedHistory));
  };

  // 現在のルームをクリア
  const clearCurrentRoom = () => {
    setModels([]);
    setSelectedModel(null);
  };

  // 大型構造物生成
  const generateLargeStructure = async (prompt: string, structureType: 'room' | 'building' | 'environment') => {
    setIsGenerating(true);

    try {
      const response = await fetch('http://localhost:3001/api/ai/text-to-3d', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `${prompt}, large scale ${structureType}, architectural, detailed interior/exterior`,
          art_style: 'realistic',
          texture_resolution: 2048,
          ai_model: 'meshy-4',
          topology: 'triangle',
          target_polycount: 50000
        })
      });

      const data = await response.json();

      const newModel = {
        id: `structure_${Date.now()}`,
        type: (structureType === 'room' ? 'room' : 'large_structure') as 'room' | 'large_structure',
        prompt: prompt,
        modelUrl: data.model_url || 'fallback',
        position: [0, 2, 0] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number],
        scale: [4, 4, 4] as [number, number, number],
        physics: {
          type: 'static' as 'static',
          mass: 0,
          material: 'concrete'
        },
        metadata: {
          size: 'room_scale' as const,
          category: structureType,
          canPlaceOn: true,
          canHoldObjects: true
        }
      };

      setModels(prev => [newModel, ...prev]);
      return newModel;
    } catch (error) {
      console.error('❌ Large structure generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // 通常オブジェクト生成
  const generateObject = async (prompt: string, objectType: 'furniture' | 'decoration') => {
    setIsGenerating(true);

    try {
      const response = await fetch('http://localhost:3001/api/ai/text-to-3d', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `${prompt}, detailed ${objectType}, realistic materials`,
          art_style: 'realistic',
          texture_resolution: 1024,
          ai_model: 'meshy-4'
        })
      });

      const data = await response.json();

      const newModel = {
        id: `object_${Date.now()}`,
        type: objectType as 'furniture' | 'decoration',
        prompt: prompt,
        modelUrl: data.model_url || 'fallback',
        position: [Math.random() * 4 - 2, 2, Math.random() * 4 - 2] as [number, number, number],
        rotation: [0, Math.random() * Math.PI * 2, 0] as [number, number, number],
        scale: [1, 1, 1] as [number, number, number],
        physics: {
          type: 'dynamic' as 'dynamic',
          mass: objectType === 'furniture' ? 10 : 1,
          material: objectType === 'furniture' ? 'wood' : 'plastic'
        },
        metadata: {
          size: (objectType === 'furniture' ? 'medium' : 'small') as 'medium' | 'small',
          category: objectType,
          canPlaceOn: objectType === 'furniture',
          canHoldObjects: objectType === 'furniture'
        }
      };

      setModels(prev => [newModel, ...prev]);
      return newModel;
    } catch (error) {
      console.error('❌ Object generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // モデル位置更新
  const updateModelTransform = (id: string, transform: Partial<{
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
  }>) => {
    setModels(prev => prev.map(model =>
      model.id === id ? { ...model, ...transform } : model
    ));
  };

  // モデル削除
  const deleteModel = (id: string) => {
    setModels(prev => prev.filter(model => model.id !== id));
    if (selectedModel === id) setSelectedModel(null);
  };

  return {
    models,
    selectedModel,
    setSelectedModel,
    isGenerating,
    roomTheme,
    setRoomTheme,
    generateLargeStructure,
    generateObject,
    updateModelTransform,
    deleteModel,
    saveToHistory,
    loadFromHistory,
    deleteFromHistory,
    clearCurrentRoom,
    roomHistory
  };
};

// 安全な3Dモデルコンポーネント
const SafeModel: React.FC<{
  model: any;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ model, isSelected, onSelect }) => {
  const meshRef = useRef<THREE.Object3D>(null);
  const [hovered, setHovered] = useState(false);

  // ルームスケールオブジェクトは物理ボディを使わない
  const usePhysics = model.metadata.size !== 'room_scale';

  // 物理ボディ設定
  const [ref] = usePhysics
    ? (model.physics.type === 'static'
      ? useBox(() => ({
        mass: 0,
        position: model.position,
        args: [2, 2, 2]
      }))
      : useBox(() => ({
        mass: model.physics.mass,
        position: model.position,
        args: [1, 1, 1]
      })))
    : [useRef()];

  // 安全なフォールバックオブジェクト
  const boxSize: [number, number, number] = model.metadata.size === 'room_scale' ? [8, 4, 8] : [1, 1, 1];

  return (
    <group
      ref={usePhysics ? (ref as any) : meshRef}
      position={!usePhysics ? model.position : undefined}
      onClick={onSelect}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* 3Dモデル */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={boxSize} />
        <meshStandardMaterial
          color={model.type === 'room' ? '#8B4513' : '#4A90E2'}
          metalness={0.3}
          roughness={0.7}
          emissive={isSelected ? '#ffff00' : '#000000'}
          emissiveIntensity={isSelected ? 0.2 : 0}
        />
      </mesh>

      {/* 選択インジケーター */}
      {isSelected && (
        <mesh position={[0, model.metadata.size === 'room_scale' ? 5 : 2, 0]}>
          <sphereGeometry args={[0.2]} />
          <meshBasicMaterial color="#ffff00" />
        </mesh>
      )}

      {/* ホバーエフェクト */}
      {hovered && !isSelected && (
        <mesh position={[0, model.metadata.size === 'room_scale' ? 4 : 1.5, 0]}>
          <sphereGeometry args={[0.1]} />
          <meshBasicMaterial color="#00ff00" />
        </mesh>
      )}

      {/* モデル情報表示 */}
      <Html position={[0, model.metadata.size === 'room_scale' ? 6 : 3, 0]} center>
        <div className="bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs text-center">
          <div className="font-bold">{model.type.toUpperCase()}</div>
          <div className="text-gray-300 truncate max-w-32">{model.prompt}</div>
          <div className="text-blue-400 text-xs">
            {model.metadata.size} | {usePhysics ? model.physics.type : 'no-physics'}
          </div>
        </div>
      </Html>

      {/* Transform Controls（選択時） */}
      {isSelected && meshRef.current && (
        <TransformControls
          object={meshRef.current}
          mode="translate"
          enabled={true}
          showX={true}
          showY={true}
          showZ={true}
        />
      )}
    </group>
  );
};

// 物理フロア
const PhysicsFloor: React.FC = () => {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
    material: { friction: 0.8, restitution: 0.1 }
  }));

  return (
    <mesh ref={ref as any} receiveShadow>
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial color="#2C2C2C" />
    </mesh>
  );
};

// ルーム生成パネル
const RoomBuilderPanel: React.FC<{
  onGenerateLarge: (prompt: string, type: 'room' | 'building' | 'environment') => void;
  onGenerateObject: (prompt: string, type: 'furniture' | 'decoration') => void;
  isGenerating: boolean;
  roomTheme: string;
  onThemeChange: (theme: string) => void;
}> = ({ onGenerateLarge, onGenerateObject, isGenerating, roomTheme, onThemeChange }) => {
  const [prompt, setPrompt] = useState('');
  const [generationType, setGenerationType] = useState<'room' | 'furniture' | 'decoration'>('room');

  const roomThemes = {
    modern_apartment: '🏢 モダンアパート',
    cozy_bedroom: '🛏️ 居心地の良い寝室',
    streaming_studio: '🎥 配信スタジオ',
    luxury_office: '💼 高級オフィス',
    gaming_room: '🎮 ゲーミングルーム',
    art_gallery: '🎨 アートギャラリー'
  };

  const handleGenerate = () => {
    if (!prompt.trim()) return;

    if (generationType === 'room') {
      onGenerateLarge(`${prompt}, ${roomTheme} style interior`, 'room');
    } else if (generationType === 'furniture') {
      onGenerateObject(`${prompt}, ${roomTheme} style`, 'furniture');
    } else {
      onGenerateObject(`${prompt}, decorative item`, 'decoration');
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 bg-gray-900 bg-opacity-95 text-white p-6 rounded-lg max-w-sm">
      <h3 className="text-xl font-bold mb-4 text-center">🏠 インフルエンサールーム</h3>

      {/* ルームテーマ選択 */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">ルームテーマ:</label>
        <select
          value={roomTheme}
          onChange={(e) => onThemeChange(e.target.value)}
          className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
        >
          {Object.entries(roomThemes).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* 生成タイプ選択 */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">生成タイプ:</label>
        <select
          value={generationType}
          onChange={(e) => setGenerationType(e.target.value as any)}
          className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
        >
          <option value="room">🏠 ルーム・大型構造</option>
          <option value="furniture">🪑 家具</option>
          <option value="decoration">🎨 装飾品</option>
        </select>
      </div>

      {/* プロンプト入力 */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">説明:</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={
            generationType === 'room' ? '例: spacious living room with large windows' :
              generationType === 'furniture' ? '例: comfortable gaming chair' :
                '例: decorative plant pot'
          }
          className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white h-20 resize-none"
          disabled={isGenerating}
        />
      </div>

      {/* 生成ボタン */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || !prompt.trim()}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-3 px-4 rounded font-bold mb-4"
      >
        {isGenerating ? '🔄 生成中...' : `🚀 ${generationType === 'room' ? 'ルーム' : generationType === 'furniture' ? '家具' : '装飾品'}生成`}
      </button>

      {/* 機能説明 */}
      <div className="p-3 bg-purple-900 bg-opacity-50 rounded text-xs">
        <div className="font-medium text-purple-200 mb-1">🎯 機能:</div>
        <ul className="text-purple-300 space-y-1">
          <li>• 🏠 大型ルーム・建物生成</li>
          <li>• 🪑 家具の物理配置</li>
          <li>• 🎨 装飾品ドロップ</li>
          <li>• ⚡ リアルタイム物理演算</li>
          <li>• 🎮 ドラッグ&ドロップ移動</li>
        </ul>
      </div>
    </div>
  );
};

// メインシーン
const RoomBuilderScene: React.FC<{
  models: any[];
  selectedModel: string | null;
  onSelectModel: (id: string | null) => void;
}> = ({ models, selectedModel, onSelectModel }) => {
  const controlsRef = useRef<any>();

  // 背景クリックで選択解除
  const handleBackgroundClick = (event: any) => {
    if (event.object === event.target) {
      onSelectModel(null);
    }
  };

  // カメラリセット機能
  const resetCamera = () => {
    if (controlsRef.current) {
      try {
        controlsRef.current.object.position.set(15, 10, 15);
        controlsRef.current.target.set(0, 3, 0);
        controlsRef.current.update();
        console.log('🎥 カメラをリセットしました');
      } catch (error) {
        console.error('カメラリセットエラー:', error);
      }
    }
  };

  return (
    <Physics gravity={[0, -9.82, 0]}>
      <Environment preset="apartment" background={false} />

      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      {/* 物理フロア */}
      <mesh
        onClick={handleBackgroundClick}
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#2C2C2C" transparent opacity={0.8} />
      </mesh>

      <PhysicsFloor />

      {/* 生成された3Dモデル */}
      {models.map((model) => (
        <SafeModel
          key={model.id}
          model={model}
          isSelected={selectedModel === model.id}
          onSelect={() => onSelectModel(model.id)}
        />
      ))}

      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.4}
        scale={50}
        blur={2}
        far={20}
      />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        enableDamping={false}
        target={[0, 3, 0]}
        minDistance={1}
        maxDistance={100}
        maxPolarAngle={Math.PI * 0.95}
        minPolarAngle={Math.PI * 0.05}
        zoomSpeed={1.2}
        panSpeed={1.0}
        rotateSpeed={1.0}
      />

      {/* カメラリセットボタン */}
      <Html position={[0, 8, 0]} center>
        <button
          onClick={resetCamera}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs shadow-lg border border-blue-400"
        >
          🎥 カメラリセット
        </button>
      </Html>
    </Physics>
  );
};

// ルーム履歴パネル
const RoomHistoryPanel: React.FC<{
  roomHistory: Array<{
    id: string;
    name: string;
    theme: string;
    createdAt: string;
    models: any[];
    thumbnail?: string;
  }>;
  onLoadRoom: (roomId: string) => void;
  onDeleteRoom: (roomId: string) => void;
  onSaveCurrentRoom: (roomName: string) => void;
  onClearRoom: () => void;
  currentModelsCount: number;
}> = ({ roomHistory, onLoadRoom, onDeleteRoom, onSaveCurrentRoom, onClearRoom, currentModelsCount }) => {
  const [showHistory, setShowHistory] = useState(false);
  const [saveRoomName, setSaveRoomName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const handleSaveRoom = () => {
    if (currentModelsCount === 0) {
      alert('保存するオブジェクトがありません');
      return;
    }
    setShowSaveDialog(true);
  };

  const confirmSave = () => {
    const roomName = saveRoomName.trim() || `Room ${new Date().toLocaleString()}`;
    onSaveCurrentRoom(roomName);
    setSaveRoomName('');
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
          <span className="text-lg">📚</span>
          <span className="text-xs font-medium">履歴</span>
          {roomHistory.length > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-1 min-w-4 h-4 flex items-center justify-center">
              {roomHistory.length}
            </span>
          )}
        </div>
      </button>

      {/* 履歴パネル */}
      {showHistory && (
        <div className="absolute top-12 right-0 bg-gray-900 bg-opacity-95 p-4 rounded-lg shadow-xl border border-gray-600 w-80 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white">📚 ルーム履歴</h3>
            <button
              onClick={() => setShowHistory(false)}
              className="text-gray-400 hover:text-white text-lg"
            >
              ✕
            </button>
          </div>

          {/* 現在のルーム操作 */}
          <div className="mb-4 p-3 bg-gray-800 rounded border">
            <div className="text-xs text-gray-400 mb-2">現在のルーム ({currentModelsCount} オブジェクト)</div>
            <div className="flex space-x-2">
              <button
                onClick={handleSaveRoom}
                disabled={currentModelsCount === 0}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-xs py-2 px-3 rounded"
              >
                💾 保存
              </button>
              <button
                onClick={onClearRoom}
                disabled={currentModelsCount === 0}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white text-xs py-2 px-3 rounded"
              >
                🗑️ クリア
              </button>
            </div>
          </div>

          {/* 履歴リスト */}
          {roomHistory.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <div className="text-2xl mb-2">📭</div>
              <div className="text-sm">保存されたルームがありません</div>
            </div>
          ) : (
            <div className="space-y-2">
              {roomHistory.map((room) => (
                <div key={room.id} className="bg-gray-800 p-3 rounded border border-gray-700 hover:border-purple-500 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-white text-sm truncate">{room.name}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {room.theme} • {room.models.length} オブジェクト
                      </div>
                      <div className="text-xs text-gray-500">{formatDate(room.createdAt)}</div>
                    </div>
                    {room.thumbnail && (
                      <img
                        src={room.thumbnail}
                        alt={room.name}
                        className="w-12 h-9 object-cover rounded ml-2"
                      />
                    )}
                  </div>
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => {
                        onLoadRoom(room.id);
                        setShowHistory(false);
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded"
                    >
                      📂 読込
                    </button>
                    <button
                      onClick={() => onDeleteRoom(room.id)}
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
            <h3 className="text-lg font-bold text-white mb-4">💾 ルームを保存</h3>
            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-2">ルーム名:</label>
              <input
                type="text"
                value={saveRoomName}
                onChange={(e) => setSaveRoomName(e.target.value)}
                placeholder={`Room ${new Date().toLocaleString()}`}
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
                  setSaveRoomName('');
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

// メインコンポーネント
export const InfluencerRoomBuilder: React.FC = () => {
  const {
    models,
    selectedModel,
    setSelectedModel,
    isGenerating,
    roomTheme,
    setRoomTheme,
    generateLargeStructure,
    generateObject,
    deleteModel,
    saveToHistory,
    loadFromHistory,
    deleteFromHistory,
    clearCurrentRoom,
    roomHistory
  } = useRoomBuilder();

  return (
    <div className="w-full h-screen relative bg-gray-900">
      {/* ウェルカムメッセージ */}
      {models.length === 0 && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 bg-gradient-to-r from-purple-900 to-blue-900 bg-opacity-95 text-white p-4 rounded-lg shadow-lg border border-purple-500 max-w-2xl">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">🏠 インフルエンサールーム作成</h2>
            <div className="text-xs bg-purple-600 px-2 py-1 rounded">AI + 物理エンジン</div>
          </div>
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <div className="text-purple-200 font-medium mb-2">✨ 機能</div>
              <ul className="text-gray-300 text-xs space-y-1">
                <li>• あなただけのパーソナル空間</li>
                <li>• リアルタイム3D生成</li>
                <li>• 物理演算対応</li>
                <li>• ドラッグ&ドロップ移動</li>
              </ul>
            </div>
            <div>
              <div className="text-blue-200 font-medium mb-2">🎯 推奨順序</div>
              <div className="text-gray-300 text-xs space-y-1">
                <div>1️⃣ ルーム・大型構造</div>
                <div>2️⃣ 家具配置</div>
                <div>3️⃣ 装飾品追加</div>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-purple-400 text-center">
            <div className="text-xs text-purple-200">右上パネルから生成を開始 →</div>
          </div>
        </div>
      )}

      <Canvas
        camera={{ position: [15, 10, 15], fov: 60 }}
        shadows
        gl={{ antialias: true, alpha: true }}
      >
        <RoomBuilderScene
          models={models}
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
        />
      </Canvas>

      <RoomBuilderPanel
        onGenerateLarge={generateLargeStructure}
        onGenerateObject={generateObject}
        isGenerating={isGenerating}
        roomTheme={roomTheme}
        onThemeChange={setRoomTheme}
      />

      <RoomHistoryPanel
        roomHistory={roomHistory}
        onLoadRoom={loadFromHistory}
        onDeleteRoom={deleteFromHistory}
        onSaveCurrentRoom={saveToHistory}
        onClearRoom={clearCurrentRoom}
        currentModelsCount={models.length}
      />

      {/* モデル管理パネル */}
      {models.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 bg-gray-900 bg-opacity-95 text-white p-4 rounded-lg max-w-sm">
          <h4 className="font-bold mb-2">🎮 オブジェクト管理 ({models.length})</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {models.map((model) => (
              <div key={model.id} className="bg-gray-800 p-2 rounded text-xs flex justify-between items-center">
                <div>
                  <div className="font-medium truncate">{model.prompt}</div>
                  <div className="text-gray-400">{model.type} | {model.metadata.size}</div>
                </div>
                <button
                  onClick={() => deleteModel(model.id)}
                  className="text-red-400 hover:text-red-300 ml-2"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ステータス表示 */}
      <div className="fixed bottom-4 left-4 z-50 bg-black bg-opacity-90 text-white p-4 rounded">
        <h4 className="font-bold mb-2">🏠 ルームビルダー</h4>
        <ul className="text-sm space-y-1">
          <li>✅ 物理エンジン統合</li>
          <li>🏠 大型構造物生成</li>
          <li>🪑 家具配置システム</li>
          <li>🎮 ドラッグ&ドロップ</li>
          <li>⚡ リアルタイム物理演算</li>
        </ul>

        {/* 操作説明 */}
        <div className="mt-3 pt-2 border-t border-gray-600">
          <div className="text-xs text-gray-400">
            <div>🖱️ ドラッグ: カメラ回転</div>
            <div>🔍 ホイール: ズーム</div>
            <div>📦 クリック: オブジェクト選択</div>
            <div>🎥 ボタン: カメラリセット</div>
          </div>
        </div>
      </div>
    </div>
  );
}; 