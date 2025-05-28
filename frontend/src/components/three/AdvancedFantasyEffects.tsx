import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 高度な魔法オーブエフェクト
export const MagicalOrbs: React.FC<{
  position: [number, number, number];
  count: number;
  color: string;
  size: number;
  speed: number;
}> = ({ position, count, color, size, speed }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const orbData = useMemo(() =>
    Array.from({ length: count }, () => ({
      offset: Math.random() * Math.PI * 2,
      radius: 3 + Math.random() * 5,
      height: Math.random() * 10,
      rotationSpeed: 0.5 + Math.random() * 1.5
    })), [count]
  );

  useFrame((state) => {
    if (meshRef.current) {
      orbData.forEach((orb, i) => {
        const time = state.clock.elapsedTime * speed + orb.offset;

        tempObject.position.set(
          position[0] + Math.sin(time * orb.rotationSpeed) * orb.radius,
          position[1] + orb.height + Math.sin(time * 2) * 2,
          position[2] + Math.cos(time * orb.rotationSpeed) * orb.radius
        );

        // 発光の脈動
        const pulseFactor = 0.5 + Math.sin(time * 3) * 0.5;
        tempObject.scale.setScalar(size * pulseFactor);

        tempObject.updateMatrix();
        if (meshRef.current) {
          meshRef.current.setMatrixAt(i, tempObject.matrix);
        }
      });
      if (meshRef.current) {
        meshRef.current.instanceMatrix.needsUpdate = true;
      }
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.1, 12, 12]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1.5}
        transparent
        opacity={0.8}
      />
    </instancedMesh>
  );
};

// 魔法陣エフェクト
export const MagicCircle: React.FC<{
  position: [number, number, number];
  radius: number;
  isActive: boolean;
  color: string;
}> = ({ position, radius, isActive, color }) => {
  const circleRef = useRef<THREE.Group>(null);
  const runesRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (circleRef.current && isActive) {
      circleRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
    if (runesRef.current && isActive) {
      runesRef.current.rotation.y = -state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <group position={position}>
      {/* メイン魔法陣 */}
      <group ref={circleRef}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius * 0.8, radius, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isActive ? 0.8 : 0.2}
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* 内側の円 */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[radius * 0.3, radius * 0.5, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isActive ? 1.2 : 0.3}
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* ルーン文字 */}
      <group ref={runesRef}>
        {Array.from({ length: 8 }, (_, i) => (
          <mesh
            key={i}
            position={[
              Math.cos((i / 8) * Math.PI * 2) * radius * 0.9,
              0.05,
              Math.sin((i / 8) * Math.PI * 2) * radius * 0.9
            ]}
            rotation={[-Math.PI / 2, 0, (i / 8) * Math.PI * 2]}
          >
            <boxGeometry args={[0.2, 0.4, 0.02]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={isActive ? 1.5 : 0.4}
            />
          </mesh>
        ))}
      </group>

      {/* 中央の柱状の光 */}
      {isActive && (
        <mesh position={[0, radius * 0.5, 0]}>
          <cylinderGeometry args={[0.1, 0.3, radius, 16]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={2}
            transparent
            opacity={0.7}
          />
        </mesh>
      )}
    </group>
  );
};

// 魔法の書物エフェクト
export const FloatingSpellbook: React.FC<{
  position: [number, number, number];
  isOpen: boolean;
  color: string;
}> = ({ position, isOpen, color }) => {
  const bookRef = useRef<THREE.Group>(null);
  const pagesRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (bookRef.current) {
      bookRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.2;
      bookRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }

    if (pagesRef.current && isOpen) {
      pagesRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group ref={bookRef} position={position}>
      {/* 本の表紙 */}
      <mesh>
        <boxGeometry args={[1, 0.1, 1.4]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* 本の背表紙 */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[1, 0.1, 1.4]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {/* 開いたページ */}
      {isOpen && (
        <group ref={pagesRef} position={[0, 0.12, 0]}>
          <mesh rotation={[0, -0.3, 0]} position={[-0.3, 0, 0]}>
            <boxGeometry args={[0.9, 0.01, 1.3]} />
            <meshStandardMaterial
              color="#FFF8DC"
              emissive={color}
              emissiveIntensity={0.3}
            />
          </mesh>
          <mesh rotation={[0, 0.3, 0]} position={[0.3, 0, 0]}>
            <boxGeometry args={[0.9, 0.01, 1.3]} />
            <meshStandardMaterial
              color="#FFF8DC"
              emissive={color}
              emissiveIntensity={0.3}
            />
          </mesh>

          {/* 魔法文字のエフェクト */}
          {Array.from({ length: 6 }, (_, i) => (
            <mesh
              key={i}
              position={[
                -0.3 + Math.random() * 0.6,
                0.02,
                -0.4 + (i * 0.2)
              ]}
            >
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={1.5}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* 魔法のオーラ */}
      <MagicalOrbs
        position={[0, 0, 0]}
        count={8}
        color={color}
        size={0.3}
        speed={0.8}
      />
    </group>
  );
};

// 魔法の樹木エフェクト
export const EnchantedTree: React.FC<{
  position: [number, number, number];
  scale: number;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  magicalIntensity: number;
}> = ({ position, scale, season, magicalIntensity }) => {
  const treeRef = useRef<THREE.Group>(null);
  const leavesRef = useRef<THREE.Mesh>(null);

  const seasonColors = {
    spring: '#90EE90',
    summer: '#228B22',
    autumn: '#FF4500',
    winter: '#E0E0E0'
  };

  useFrame((state) => {
    if (treeRef.current) {
      treeRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
    }

    if (leavesRef.current) {
      leavesRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={treeRef} position={position} scale={scale}>
      {/* 幹 */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.3, 0.5, 4, 8]} />
        <meshStandardMaterial
          color="#8B4513"
          emissive="#4A4A4A"
          emissiveIntensity={magicalIntensity * 0.2}
        />
      </mesh>

      {/* 葉 */}
      <mesh ref={leavesRef} position={[0, 5, 0]}>
        <sphereGeometry args={[2, 12, 12]} />
        <meshStandardMaterial
          color={seasonColors[season]}
          emissive={seasonColors[season]}
          emissiveIntensity={magicalIntensity * 0.5}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* 魔法のエフェクト */}
      {magicalIntensity > 0.5 && (
        <>
          <MagicalOrbs
            position={[0, 5, 0]}
            count={12}
            color="#FFD700"
            size={0.2}
            speed={0.6}
          />

          {/* 根元の魔法陣 */}
          <MagicCircle
            position={[0, 0.1, 0]}
            radius={1.5}
            isActive={true}
            color="#32CD32"
          />
        </>
      )}

      {/* 季節の特殊エフェクト */}
      {season === 'winter' && (
        // 雪のエフェクト
        Array.from({ length: 20 }, (_, i) => (
          <mesh
            key={i}
            position={[
              (Math.random() - 0.5) * 6,
              Math.random() * 8 + 2,
              (Math.random() - 0.5) * 6
            ]}
          >
            <sphereGeometry args={[0.05, 6, 6]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
        ))
      )}

      {season === 'autumn' && (
        // 落ち葉のエフェクト
        Array.from({ length: 10 }, (_, i) => (
          <mesh
            key={i}
            position={[
              (Math.random() - 0.5) * 4,
              Math.random() * 2,
              (Math.random() - 0.5) * 4
            ]}
            rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
          >
            <boxGeometry args={[0.1, 0.01, 0.15]} />
            <meshStandardMaterial color="#D2691E" />
          </mesh>
        ))
      )}
    </group>
  );
};

// 魔法の水晶エフェクト
export const MagicalCrystal: React.FC<{
  position: [number, number, number];
  size: number;
  color: string;
  pulseSpeed: number;
}> = ({ position, size, color, pulseSpeed }) => {
  const crystalRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (crystalRef.current) {
      crystalRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      crystalRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;

      const pulse = 1 + Math.sin(state.clock.elapsedTime * pulseSpeed) * 0.3;
      crystalRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group position={position}>
      <mesh ref={crystalRef}>
        <octahedronGeometry args={[size, 2]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.2}
          transparent
          opacity={0.8}
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>

      {/* 基台 */}
      <mesh position={[0, -size * 0.8, 0]}>
        <cylinderGeometry args={[size * 0.6, size * 0.8, size * 0.4, 8]} />
        <meshStandardMaterial color="#696969" />
      </mesh>

      {/* エネルギービーム */}
      <mesh position={[0, size * 2, 0]}>
        <cylinderGeometry args={[0.02, 0.1, size * 2, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
}; 