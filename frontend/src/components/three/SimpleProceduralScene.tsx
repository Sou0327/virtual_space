import React, { useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { SimpleWebGPUDisplay } from './SimpleWebGPU';

// 最小限のプロシージャル生成
const SimpleProceduralTerrain: React.FC<{
  seed: number;
}> = ({ seed }) => {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(50, 50, 20, 20);
    const vertices = geo.attributes.position.array as Float32Array;

    // シンプルなランダム高さ生成
    const random = (x: number, y: number) => {
      const hash = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
      return (hash - Math.floor(hash)) * 3; // 高さ0-3
    };

    // 頂点の高さを設定
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const z = vertices[i + 2];
      vertices[i + 1] = random(x, z);
    }

    geo.computeVertexNormals();
    return geo;
  }, [seed]);

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <meshStandardMaterial color="#7cb342" />
    </mesh>
  );
};

// シンプルな木生成
const SimpleTree: React.FC<{
  position: [number, number, number];
  seed: number;
}> = ({ position, seed }) => {
  const random = (offset: number) => {
    const hash = Math.sin(seed * 12.9898 + offset * 78.233) * 43758.5453;
    return hash - Math.floor(hash);
  };

  const height = 2 + random(1) * 3;
  const trunkRadius = 0.1 + random(2) * 0.1;
  const leafRadius = 0.8 + random(3) * 0.5;

  return (
    <group position={position}>
      {/* 幹 */}
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[trunkRadius, trunkRadius + 0.05, height, 8]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      {/* 葉 */}
      <mesh position={[0, height + leafRadius / 2, 0]}>
        <sphereGeometry args={[leafRadius, 8, 8]} />
        <meshStandardMaterial color="#228b22" />
      </mesh>
    </group>
  );
};

// シンプルな建物生成
const SimpleBuilding: React.FC<{
  position: [number, number, number];
  seed: number;
}> = ({ position, seed }) => {
  const random = (offset: number) => {
    const hash = Math.sin(seed * 12.9898 + offset * 78.233) * 43758.5453;
    return hash - Math.floor(hash);
  };

  const width = 2 + random(1) * 2;
  const height = 3 + random(2) * 5;
  const depth = 2 + random(3) * 2;

  return (
    <group position={position}>
      {/* メイン建物 */}
      <mesh position={[0, height / 2, 0]} castShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#cccccc" />
      </mesh>
      {/* 屋根 */}
      <mesh position={[0, height + 0.5, 0]}>
        <coneGeometry args={[width * 0.7, 1, 4]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
    </group>
  );
};

// メインシーン
const SimpleProceduralSceneContent: React.FC<{
  seed: number;
  showTrees: boolean;
  showBuildings: boolean;
}> = ({ seed, showTrees, showBuildings }) => {
  // 固定位置の木
  const trees = useMemo(() => {
    if (!showTrees) return [];
    return [
      { position: [10, 0, 10] as [number, number, number], seed: seed + 1 },
      { position: [-15, 0, 5] as [number, number, number], seed: seed + 2 },
      { position: [5, 0, -10] as [number, number, number], seed: seed + 3 },
      { position: [-8, 0, -15] as [number, number, number], seed: seed + 4 },
      { position: [20, 0, -5] as [number, number, number], seed: seed + 5 },
    ];
  }, [seed, showTrees]);

  // 固定位置の建物
  const buildings = useMemo(() => {
    if (!showBuildings) return [];
    return [
      { position: [0, 0, 0] as [number, number, number], seed: seed + 10 },
      { position: [15, 0, 0] as [number, number, number], seed: seed + 11 },
      { position: [-12, 0, 8] as [number, number, number], seed: seed + 12 },
    ];
  }, [seed, showBuildings]);

  return (
    <>
      {/* 固定照明 */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* 地形 */}
      <SimpleProceduralTerrain seed={seed} />

      {/* 木 */}
      {trees.map((tree, index) => (
        <SimpleTree
          key={`tree-${index}-${tree.seed}`}
          position={tree.position}
          seed={tree.seed}
        />
      ))}

      {/* 建物 */}
      {buildings.map((building, index) => (
        <SimpleBuilding
          key={`building-${index}-${building.seed}`}
          position={building.position}
          seed={building.seed}
        />
      ))}

      {/* 参照用キューブ */}
      <mesh position={[0, 1, 5]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ff6b6b" />
      </mesh>
    </>
  );
};

// コントロールパネル
const SimpleControls: React.FC<{
  seed: number;
  showTrees: boolean;
  showBuildings: boolean;
  showWebGPU: boolean;
  onSeedChange: (seed: number) => void;
  onToggleTrees: () => void;
  onToggleBuildings: () => void;
  onToggleWebGPU: () => void;
}> = ({ seed, showTrees, showBuildings, showWebGPU, onSeedChange, onToggleTrees, onToggleBuildings, onToggleWebGPU }) => {
  return (
    <div className="fixed top-4 left-4 z-50 bg-white bg-opacity-95 p-4 rounded-lg shadow-lg max-w-sm">
      <h3 className="text-lg font-bold mb-3">🌱 シンプル生成テスト</h3>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">シード値: {seed}</label>
          <button
            onClick={() => onSeedChange(Math.floor(Math.random() * 10000))}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            🎲 新しいシード
          </button>
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showTrees}
              onChange={onToggleTrees}
            />
            <span>🌳 木を表示</span>
          </label>
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showBuildings}
              onChange={onToggleBuildings}
            />
            <span>🏠 建物を表示</span>
          </label>
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showWebGPU}
              onChange={onToggleWebGPU}
            />
            <span>🚀 WebGPU情報</span>
          </label>
        </div>
      </div>
    </div>
  );
};

// メインコンポーネント
export const SimpleProceduralScene: React.FC = () => {
  const [seed, setSeed] = useState(42);
  const [showTrees, setShowTrees] = useState(true);
  const [showBuildings, setShowBuildings] = useState(true);
  const [showWebGPU, setShowWebGPU] = useState(false);

  return (
    <div className="w-full h-screen relative">
      {/* 完全固定カメラのCanvas */}
      <Canvas
        camera={{
          position: [25, 15, 25],
          fov: 60,
          near: 0.1,
          far: 100
        }}
        shadows
      >
        <SimpleProceduralSceneContent
          seed={seed}
          showTrees={showTrees}
          showBuildings={showBuildings}
        />
        {/* カメラ制御なし - 完全固定 */}
      </Canvas>

      {/* コントロール */}
      <SimpleControls
        seed={seed}
        showTrees={showTrees}
        showBuildings={showBuildings}
        showWebGPU={showWebGPU}
        onSeedChange={setSeed}
        onToggleTrees={() => setShowTrees(!showTrees)}
        onToggleBuildings={() => setShowBuildings(!showBuildings)}
        onToggleWebGPU={() => setShowWebGPU(!showWebGPU)}
      />

      {/* WebGPU情報 */}
      {showWebGPU && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <SimpleWebGPUDisplay />
        </div>
      )}

      {/* 説明 */}
      <div className="fixed bottom-4 left-4 z-50 bg-black bg-opacity-80 text-white p-3 rounded text-sm max-w-xs">
        <h4 className="font-bold mb-2">📋 テスト項目</h4>
        <ul className="text-xs space-y-1">
          <li>• カメラ: 完全固定</li>
          <li>• 地形: シード値で変化</li>
          <li>• 木: 固定5箇所に生成</li>
          <li>• 建物: 固定3箇所に生成</li>
          <li>• アニメーション: なし</li>
          <li>• WebGPU: 情報表示可能</li>
        </ul>
      </div>
    </div>
  );
}; 