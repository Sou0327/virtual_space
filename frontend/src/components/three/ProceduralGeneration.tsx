import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// プロシージャル地形生成
export const ProceduralTerrain: React.FC<{
  size: number;
  resolution: number;
  heightScale: number;
  seed: number;
  type: 'hills' | 'mountains' | 'plains' | 'islands' | 'valley';
}> = ({ size, resolution, heightScale, seed, type }) => {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(size, size, resolution, resolution);
    const vertices = geo.attributes.position.array as Float32Array;

    // シード値によるランダム生成器
    const seededRandom = (x: number, y: number) => {
      const hash = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
      return hash - Math.floor(hash);
    };

    // パーリンノイズ風の高さ生成
    const generateHeight = (x: number, z: number) => {
      const scale1 = 0.01;
      const scale2 = 0.05;
      const scale3 = 0.1;

      let height = 0;
      height += seededRandom(x * scale1, z * scale1) * 0.6;
      height += seededRandom(x * scale2, z * scale2) * 0.3;
      height += seededRandom(x * scale3, z * scale3) * 0.1;

      // 地形タイプによる調整
      switch (type) {
        case 'mountains':
          height = Math.pow(height, 1.5) * 2;
          break;
        case 'hills':
          height = Math.sin(height * Math.PI) * 0.8;
          break;
        case 'plains':
          height = height * 0.2;
          break;
        case 'islands':
          const center = size / 2;
          const distanceFromCenter = Math.sqrt(
            Math.pow(x - center, 2) + Math.pow(z - center, 2)
          );
          const falloff = Math.max(0, 1 - distanceFromCenter / (size * 0.4));
          height = height * falloff * 1.5;
          break;
        case 'valley':
          const valleyFactor = Math.abs(x - size / 2) / (size / 2);
          height = height * (1 - valleyFactor * 0.8);
          break;
      }

      return height * heightScale;
    };

    // 頂点の高さを設定
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i] + size / 2;
      const z = vertices[i + 2] + size / 2;
      vertices[i + 1] = generateHeight(x, z);
    }

    geo.computeVertexNormals();
    return geo;
  }, [size, resolution, heightScale, seed, type]);

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <meshStandardMaterial
        color="#7cb342"
        roughness={0.8}
        metalness={0.1}
        wireframe={false}
      />
    </mesh>
  );
};

// プロシージャル建物生成
export const ProceduralBuilding: React.FC<{
  position: [number, number, number];
  seed: number;
  style: 'modern' | 'fantasy' | 'industrial' | 'residential';
}> = ({ position, seed, style }) => {
  const buildingData = useMemo(() => {
    const seededRandom = (offset: number) => {
      const hash = Math.sin(seed * 12.9898 + offset * 78.233) * 43758.5453;
      return hash - Math.floor(hash);
    };

    const width = 2 + seededRandom(1) * 3;
    const height = 3 + seededRandom(2) * 8;
    const depth = 2 + seededRandom(3) * 3;
    const floors = Math.max(1, Math.floor(height / 2.5));

    let color = '#cccccc';
    let material = 'standard';

    switch (style) {
      case 'modern':
        color = '#e0e0e0';
        material = 'glass';
        break;
      case 'fantasy':
        color = '#8b4513';
        material = 'stone';
        break;
      case 'industrial':
        color = '#696969';
        material = 'metal';
        break;
      case 'residential':
        color = '#deb887';
        material = 'brick';
        break;
    }

    return { width, height, depth, floors, color, material };
  }, [seed, style]);

  return (
    <group position={position}>
      {/* メインビルディング */}
      <mesh position={[0, buildingData.height / 2, 0]} castShadow>
        <boxGeometry args={[buildingData.width, buildingData.height, buildingData.depth]} />
        <meshStandardMaterial
          color={buildingData.color}
          roughness={buildingData.material === 'glass' ? 0.1 : 0.7}
          metalness={buildingData.material === 'metal' ? 0.8 : 0.1}
          transparent={buildingData.material === 'glass'}
          opacity={buildingData.material === 'glass' ? 0.3 : 1}
        />
      </mesh>

      {/* 窓の生成 */}
      {Array.from({ length: buildingData.floors }, (_, floor) => {
        const windowsPerFloor = Math.max(2, Math.floor(buildingData.width));
        return Array.from({ length: windowsPerFloor }, (_, window) => (
          <mesh
            key={`${floor}-${window}`}
            position={[
              -buildingData.width / 2 + 0.1 + (window + 0.5) * (buildingData.width / windowsPerFloor),
              1 + floor * 2.5,
              buildingData.depth / 2 + 0.01
            ]}
          >
            <boxGeometry args={[0.4, 0.6, 0.02]} />
            <meshStandardMaterial
              color={buildingData.material === 'fantasy' ? '#4169e1' : '#87ceeb'}
              emissive={buildingData.material === 'fantasy' ? '#000080' : '#000000'}
              emissiveIntensity={0.2}
              transparent
              opacity={0.8}
            />
          </mesh>
        ));
      })}

      {/* スタイル別装飾 */}
      {style === 'fantasy' && (
        <mesh position={[0, buildingData.height + 1, 0]}>
          <coneGeometry args={[buildingData.width * 0.6, 2, 8]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
      )}

      {style === 'modern' && (
        <mesh position={[0, buildingData.height + 0.2, 0]}>
          <boxGeometry args={[buildingData.width + 0.2, 0.4, buildingData.depth + 0.2]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      )}
    </group>
  );
};

// プロシージャル植生生成
export const ProceduralVegetation: React.FC<{
  terrainSize: number;
  density: number;
  seed: number;
  biome: 'forest' | 'savanna' | 'jungle' | 'desert' | 'tundra';
}> = ({ terrainSize, density, seed, biome }) => {
  const vegetation = useMemo(() => {
    const seededRandom = (offset: number) => {
      const hash = Math.sin(seed * 12.9898 + offset * 78.233) * 43758.5453;
      return hash - Math.floor(hash);
    };

    const plants: Array<{
      position: [number, number, number];
      type: 'tree' | 'bush' | 'grass' | 'cactus' | 'rock';
      scale: number;
      rotation: number;
    }> = [];

    const plantCount = Math.floor(terrainSize * terrainSize * density / 100);

    console.log('🌱 植生生成:', {
      terrainSize,
      density,
      plantCount,
      biome
    });

    for (let i = 0; i < plantCount; i++) {
      const x = (seededRandom(i * 2) - 0.5) * terrainSize;
      const z = (seededRandom(i * 2 + 1) - 0.5) * terrainSize;
      const scale = 0.5 + seededRandom(i * 3) * 1.5;
      const rotation = seededRandom(i * 4) * Math.PI * 2;

      let type: 'tree' | 'bush' | 'grass' | 'cactus' | 'rock' = 'tree';

      switch (biome) {
        case 'forest':
          type = seededRandom(i * 5) < 0.7 ? 'tree' : 'bush';
          break;
        case 'savanna':
          type = seededRandom(i * 5) < 0.3 ? 'tree' : 'grass';
          break;
        case 'jungle':
          type = seededRandom(i * 5) < 0.8 ? 'tree' : 'bush';
          break;
        case 'desert':
          type = seededRandom(i * 5) < 0.6 ? 'cactus' : 'rock';
          break;
        case 'tundra':
          type = seededRandom(i * 5) < 0.2 ? 'tree' : 'rock';
          break;
      }

      plants.push({
        position: [x, 0, z],
        type,
        scale,
        rotation
      });
    }

    return plants;
  }, [terrainSize, density, seed, biome]);

  return (
    <group>
      {vegetation.map((plant, index) => (
        <VegetationElement
          key={index}
          position={plant.position}
          type={plant.type}
          scale={plant.scale}
          rotation={plant.rotation}
          biome={biome}
        />
      ))}
    </group>
  );
};

// 個別植生要素
const VegetationElement: React.FC<{
  position: [number, number, number];
  type: 'tree' | 'bush' | 'grass' | 'cactus' | 'rock';
  scale: number;
  rotation: number;
  biome: string;
}> = ({ position, type, scale, rotation, biome }) => {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    // 風アニメーションを完全に無効化
    // if (meshRef.current && (type === 'tree' || type === 'bush')) {
    //   // 風の効果
    //   meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime + position[0]) * 0.02;
    // }
  });

  const getColor = () => {
    switch (biome) {
      case 'desert': return type === 'cactus' ? '#228b22' : '#daa520';
      case 'tundra': return '#708090';
      case 'jungle': return '#006400';
      case 'savanna': return '#9acd32';
      default: return '#228b22';
    }
  };

  return (
    <group
      ref={meshRef}
      position={[position[0], position[1] + scale, position[2]]}
      scale={scale}
      rotation={[0, rotation, 0]}
    >
      {type === 'tree' && (
        <>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.15, 2, 8]} />
            <meshStandardMaterial color="#8b4513" />
          </mesh>
          <mesh position={[0, 1.5, 0]}>
            <sphereGeometry args={[0.8, 8, 8]} />
            <meshStandardMaterial color={getColor()} />
          </mesh>
        </>
      )}

      {type === 'bush' && (
        <mesh position={[0, 0.3, 0]}>
          <sphereGeometry args={[0.4, 6, 6]} />
          <meshStandardMaterial color={getColor()} />
        </mesh>
      )}

      {type === 'grass' && (
        <mesh position={[0, 0.1, 0]}>
          <coneGeometry args={[0.1, 0.3, 4]} />
          <meshStandardMaterial color={getColor()} />
        </mesh>
      )}

      {type === 'cactus' && (
        <>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 1, 6]} />
            <meshStandardMaterial color={getColor()} />
          </mesh>
          <mesh position={[0.2, 0.8, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.6, 6]} />
            <meshStandardMaterial color={getColor()} />
          </mesh>
        </>
      )}

      {type === 'rock' && (
        <mesh position={[0, 0.2, 0]}>
          <dodecahedronGeometry args={[0.3, 0]} />
          <meshStandardMaterial color="#696969" />
        </mesh>
      )}
    </group>
  );
};

// プロシージャル都市生成
export const ProceduralCity: React.FC<{
  size: number;
  buildingDensity: number;
  seed: number;
  style: 'modern' | 'fantasy' | 'industrial' | 'residential' | 'mixed';
}> = ({ size, buildingDensity, seed, style }) => {
  const cityLayout = useMemo(() => {
    const seededRandom = (offset: number) => {
      const hash = Math.sin(seed * 12.9898 + offset * 78.233) * 43758.5453;
      return hash - Math.floor(hash);
    };

    const buildings: Array<{
      position: [number, number, number];
      seed: number;
      style: 'modern' | 'fantasy' | 'industrial' | 'residential';
    }> = [];

    const gridSize = Math.floor(size / 8);
    const buildingCount = Math.floor(gridSize * gridSize * buildingDensity);

    console.log('🏢 都市生成:', {
      size,
      buildingDensity,
      gridSize,
      buildingCount,
      style
    });

    for (let i = 0; i < buildingCount; i++) {
      const gridX = Math.floor(seededRandom(i * 2) * gridSize);
      const gridZ = Math.floor(seededRandom(i * 2 + 1) * gridSize);

      const x = (gridX - gridSize / 2) * 8 + (seededRandom(i * 3) - 0.5) * 4;
      const z = (gridZ - gridSize / 2) * 8 + (seededRandom(i * 4) - 0.5) * 4;

      let buildingStyle: 'modern' | 'fantasy' | 'industrial' | 'residential' = style === 'mixed' ? 'modern' : style;
      if (style === 'mixed') {
        const styleRand = seededRandom(i * 5);
        if (styleRand < 0.25) buildingStyle = 'modern';
        else if (styleRand < 0.5) buildingStyle = 'fantasy';
        else if (styleRand < 0.75) buildingStyle = 'industrial';
        else buildingStyle = 'residential';
      }

      buildings.push({
        position: [x, 0, z],
        seed: seed + i,
        style: buildingStyle
      });
    }

    return buildings;
  }, [size, buildingDensity, seed, style]);

  return (
    <group>
      {cityLayout.map((building, index) => (
        <ProceduralBuilding
          key={index}
          position={building.position}
          seed={building.seed}
          style={building.style}
        />
      ))}
    </group>
  );
}; 