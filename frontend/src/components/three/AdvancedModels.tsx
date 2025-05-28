import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Sphere, Cylinder, Cone, Torus, Plane } from '@react-three/drei';
import * as THREE from 'three';
import { DynamicMaterial } from './AdvancedMaterials';

// 高度なアバターコンポーネント
export const AdvancedAvatar: React.FC<{
  position: [number, number, number];
  color: string;
  name: string;
  isMoving?: boolean;
  emotion?: 'happy' | 'sad' | 'excited' | 'neutral';
}> = ({ position, color, name, isMoving = false, emotion = 'neutral' }) => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const bodyRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // 歩行アニメーション
      if (isMoving) {
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 4) * 0.1;
      }
    }

    if (headRef.current) {
      // 頭の動き
      headRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.2;

      // 感情に応じた表現
      switch (emotion) {
        case 'happy':
          headRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.05);
          break;
        case 'excited':
          headRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 5) * 0.1;
          break;
      }
    }

    if (bodyRef.current && isMoving) {
      // 体の揺れ
      bodyRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 4) * 0.1;
    }
  });

  const getEmotionColor = () => {
    switch (emotion) {
      case 'happy': return '#FFD700';
      case 'sad': return '#4169E1';
      case 'excited': return '#FF69B4';
      default: return color;
    }
  };

  return (
    <group ref={groupRef} position={position}>
      {/* 頭 */}
      <Sphere ref={headRef} args={[0.4, 16, 16]} position={[0, 1.6, 0]}>
        <DynamicMaterial type="fabric" color={getEmotionColor()} />
      </Sphere>

      {/* 目 */}
      <Sphere args={[0.08, 8, 8]} position={[-0.15, 1.7, 0.3]}>
        <DynamicMaterial type="glow" color="#FFFFFF" />
      </Sphere>
      <Sphere args={[0.08, 8, 8]} position={[0.15, 1.7, 0.3]}>
        <DynamicMaterial type="glow" color="#FFFFFF" />
      </Sphere>

      {/* 体 */}
      <Box ref={bodyRef} args={[0.6, 1.2, 0.3]} position={[0, 0.6, 0]}>
        <DynamicMaterial type="fabric" color={color} />
      </Box>

      {/* 腕 */}
      <Cylinder args={[0.1, 0.1, 0.8]} position={[-0.5, 0.8, 0]} rotation={[0, 0, Math.PI / 6]}>
        <DynamicMaterial type="fabric" color={color} />
      </Cylinder>
      <Cylinder args={[0.1, 0.1, 0.8]} position={[0.5, 0.8, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <DynamicMaterial type="fabric" color={color} />
      </Cylinder>

      {/* 脚 */}
      <Cylinder args={[0.12, 0.12, 0.8]} position={[-0.2, -0.4, 0]}>
        <DynamicMaterial type="fabric" color={color} />
      </Cylinder>
      <Cylinder args={[0.12, 0.12, 0.8]} position={[0.2, -0.4, 0]}>
        <DynamicMaterial type="fabric" color={color} />
      </Cylinder>

      {/* 名前表示 */}
      <mesh position={[0, 2.5, 0]}>
        <planeGeometry args={[2, 0.4]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.7} />
      </mesh>

      {/* オーラエフェクト */}
      {emotion === 'excited' && (
        <Torus args={[0.8, 0.05, 8, 16]} position={[0, 1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <DynamicMaterial type="neon" color="#FF00FF" emissiveIntensity={1.0} />
        </Torus>
      )}
    </group>
  );
};

// 高度な建築要素
export const ModernBuilding: React.FC<{
  position: [number, number, number];
  height?: number;
  width?: number;
  depth?: number;
}> = ({ position, height = 8, width = 4, depth = 4 }) => {
  const buildingRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (buildingRef.current) {
      // 微細な揺れ
      buildingRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.01;
    }
  });

  return (
    <group ref={buildingRef} position={position}>
      {/* メイン構造 */}
      <Box args={[width, height, depth]} position={[0, height / 2, 0]}>
        <DynamicMaterial type="glass" opacity={0.3} />
      </Box>

      {/* 窓 */}
      {Array.from({ length: Math.floor(height / 2) }, (_, floor) => (
        <group key={floor}>
          {Array.from({ length: 3 }, (_, window) => (
            <Box
              key={window}
              args={[0.6, 0.8, 0.1]}
              position={[
                (window - 1) * 1.2,
                floor * 2 + 1,
                depth / 2 + 0.05
              ]}
            >
              <DynamicMaterial type="neon" color="#00FFFF" emissiveIntensity={0.8} />
            </Box>
          ))}
        </group>
      ))}

      {/* 屋上アンテナ */}
      <Cylinder args={[0.05, 0.05, 2]} position={[0, height + 1, 0]}>
        <DynamicMaterial type="metal" />
      </Cylinder>

      {/* 発光する看板 */}
      <Box args={[width * 0.8, 0.5, 0.1]} position={[0, height * 0.8, depth / 2 + 0.1]}>
        <DynamicMaterial type="glow" color="#FF0080" emissiveIntensity={1.2} />
      </Box>
    </group>
  );
};

// 自然要素 - 高度な木
export const AdvancedTree: React.FC<{
  position: [number, number, number];
  scale?: number;
  season?: 'spring' | 'summer' | 'autumn' | 'winter';
}> = ({ position, scale = 1, season = 'summer' }) => {
  const treeRef = useRef<THREE.Group>(null);
  const leavesRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (leavesRef.current) {
      // 風による揺れ
      leavesRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      leavesRef.current.position.x = Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
    }
  });

  const getLeafColor = () => {
    switch (season) {
      case 'spring': return '#90EE90';
      case 'summer': return '#228B22';
      case 'autumn': return '#FF8C00';
      case 'winter': return '#FFFFFF';
      default: return '#228B22';
    }
  };

  return (
    <group ref={treeRef} position={position} scale={scale}>
      {/* 幹 */}
      <Cylinder args={[0.3, 0.4, 3]} position={[0, 1.5, 0]}>
        <DynamicMaterial type="wood" />
      </Cylinder>

      {/* 枝 */}
      {Array.from({ length: 5 }, (_, i) => (
        <Cylinder
          key={i}
          args={[0.05, 0.1, 1.5]}
          position={[
            Math.sin((i / 5) * Math.PI * 2) * 0.8,
            2.5 + Math.cos((i / 5) * Math.PI * 2) * 0.3,
            Math.cos((i / 5) * Math.PI * 2) * 0.8
          ]}
          rotation={[
            Math.PI / 4,
            (i / 5) * Math.PI * 2,
            0
          ]}
        >
          <DynamicMaterial type="wood" />
        </Cylinder>
      ))}

      {/* 葉 */}
      <Sphere ref={leavesRef} args={[1.5, 12, 12]} position={[0, 3.5, 0]}>
        <DynamicMaterial type="grass" color={getLeafColor()} />
      </Sphere>

      {/* 季節エフェクト */}
      {season === 'autumn' && (
        <group>
          {Array.from({ length: 10 }, (_, i) => (
            <Box
              key={i}
              args={[0.1, 0.1, 0.01]}
              position={[
                (Math.random() - 0.5) * 4,
                Math.random() * 2 + 1,
                (Math.random() - 0.5) * 4
              ]}
              rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
            >
              <DynamicMaterial type="fabric" color="#FF8C00" />
            </Box>
          ))}
        </group>
      )}
    </group>
  );
};

// インタラクティブな噴水
export const InteractiveFountain: React.FC<{
  position: [number, number, number];
  isActive?: boolean;
}> = ({ position, isActive = true }) => {
  const waterRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (waterRef.current && isActive) {
      waterRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      waterRef.current.position.y = Math.sin(state.clock.elapsedTime * 3) * 0.2;
    }
  });

  return (
    <group position={position}>
      {/* ベース */}
      <Cylinder args={[2, 2, 0.5]} position={[0, 0.25, 0]}>
        <DynamicMaterial type="marble" />
      </Cylinder>

      {/* 中央の柱 */}
      <Cylinder args={[0.3, 0.3, 2]} position={[0, 1, 0]}>
        <DynamicMaterial type="marble" />
      </Cylinder>

      {/* 水のエフェクト */}
      {isActive && (
        <group ref={waterRef}>
          {Array.from({ length: 20 }, (_, i) => (
            <Sphere
              key={i}
              args={[0.05, 8, 8]}
              position={[
                Math.sin((i / 20) * Math.PI * 2) * (0.5 + Math.random() * 0.5),
                2 + Math.random() * 2,
                Math.cos((i / 20) * Math.PI * 2) * (0.5 + Math.random() * 0.5)
              ]}
            >
              <DynamicMaterial type="water" opacity={0.8} />
            </Sphere>
          ))}
        </group>
      )}

      {/* 水面 */}
      <Cylinder args={[1.8, 1.8, 0.1]} position={[0, 0.55, 0]}>
        <DynamicMaterial type="water" opacity={0.6} />
      </Cylinder>
    </group>
  );
};

// 未来的なプラットフォーム
export const FuturisticPlatform: React.FC<{
  position: [number, number, number];
  size?: number;
  isActive?: boolean;
}> = ({ position, size = 3, isActive = true }) => {
  const platformRef = useRef<THREE.Group>(null);
  const ringsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (platformRef.current && isActive) {
      platformRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }

    if (ringsRef.current && isActive) {
      ringsRef.current.rotation.y = state.clock.elapsedTime;
    }
  });

  return (
    <group ref={platformRef} position={position}>
      {/* メインプラットフォーム */}
      <Cylinder args={[size, size, 0.2]} position={[0, 0, 0]}>
        <DynamicMaterial type="metal" color="#4169E1" />
      </Cylinder>

      {/* 発光リング */}
      <group ref={ringsRef}>
        {Array.from({ length: 3 }, (_, i) => (
          <Torus
            key={i}
            args={[size + i * 0.5, 0.05, 8, 16]}
            position={[0, 0.2 + i * 0.1, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <DynamicMaterial
              type="neon"
              color={`hsl(${(i * 120) % 360}, 100%, 50%)`}
              emissiveIntensity={1.0}
            />
          </Torus>
        ))}
      </group>

      {/* ホログラム */}
      {isActive && (
        <Cone args={[0.5, 2, 8]} position={[0, 1.5, 0]}>
          <DynamicMaterial type="hologram" opacity={0.5} />
        </Cone>
      )}
    </group>
  );
}; 