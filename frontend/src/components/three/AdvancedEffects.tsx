import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// 高度なパーティクルシステム
export const AdvancedParticleSystem: React.FC<{
  count: number;
  type: 'fire' | 'magic' | 'energy' | 'snow' | 'rain' | 'sparkles' | 'smoke' | 'lightning';
  position?: [number, number, number];
  size?: number;
  speed?: number;
  color?: string;
}> = ({
  count,
  type,
  position = [0, 0, 0],
  size = 1,
  speed = 1,
  color
}) => {
    const pointsRef = useRef<THREE.Points>(null);

    const [positions, velocities, colors, sizes] = useMemo(() => {
      const positions = new Float32Array(count * 3);
      const velocities = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const sizes = new Float32Array(count);

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;

        // 位置の初期化
        switch (type) {
          case 'fire':
            positions[i3] = (Math.random() - 0.5) * 2;
            positions[i3 + 1] = Math.random() * 5;
            positions[i3 + 2] = (Math.random() - 0.5) * 2;
            break;
          case 'magic':
            const angle = (i / count) * Math.PI * 2;
            const radius = Math.random() * 3;
            positions[i3] = Math.cos(angle) * radius;
            positions[i3 + 1] = Math.random() * 4;
            positions[i3 + 2] = Math.sin(angle) * radius;
            break;
          case 'energy':
            positions[i3] = (Math.random() - 0.5) * 10;
            positions[i3 + 1] = (Math.random() - 0.5) * 10;
            positions[i3 + 2] = (Math.random() - 0.5) * 10;
            break;
          default:
            positions[i3] = (Math.random() - 0.5) * 20;
            positions[i3 + 1] = Math.random() * 10;
            positions[i3 + 2] = (Math.random() - 0.5) * 20;
        }

        // 速度の初期化
        switch (type) {
          case 'fire':
            velocities[i3] = (Math.random() - 0.5) * 0.02;
            velocities[i3 + 1] = Math.random() * 0.05 + 0.02;
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
            break;
          case 'magic':
            velocities[i3] = (Math.random() - 0.5) * 0.01;
            velocities[i3 + 1] = Math.random() * 0.02;
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.01;
            break;
          case 'energy':
            velocities[i3] = (Math.random() - 0.5) * 0.03;
            velocities[i3 + 1] = (Math.random() - 0.5) * 0.03;
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.03;
            break;
          case 'snow':
            velocities[i3] = (Math.random() - 0.5) * 0.01;
            velocities[i3 + 1] = -Math.random() * 0.02 - 0.01;
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.01;
            break;
          case 'rain':
            velocities[i3] = 0;
            velocities[i3 + 1] = -Math.random() * 0.1 - 0.05;
            velocities[i3 + 2] = 0;
            break;
          default:
            velocities[i3] = (Math.random() - 0.5) * 0.02;
            velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
        }

        // 色の設定
        const particleColor = new THREE.Color();
        switch (type) {
          case 'fire':
            particleColor.setHSL(Math.random() * 0.1, 1, 0.5 + Math.random() * 0.5);
            break;
          case 'magic':
            particleColor.setHSL(0.8 + Math.random() * 0.2, 1, 0.7);
            break;
          case 'energy':
            particleColor.setHSL(0.5 + Math.random() * 0.3, 1, 0.8);
            break;
          case 'snow':
            particleColor.setRGB(1, 1, 1);
            break;
          case 'rain':
            particleColor.setRGB(0.5, 0.7, 1);
            break;
          default:
            particleColor.setHSL(Math.random(), 1, 0.7);
        }

        if (color) {
          particleColor.set(color);
        }

        colors[i3] = particleColor.r;
        colors[i3 + 1] = particleColor.g;
        colors[i3 + 2] = particleColor.b;

        // サイズの設定
        sizes[i] = Math.random() * size + 0.1;
      }

      return [positions, velocities, colors, sizes];
    }, [count, type, size, color]);

    useFrame((state) => {
      if (!pointsRef.current) return;

      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      const colors = pointsRef.current.geometry.attributes.color.array as Float32Array;

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;

        // 位置の更新
        positions[i3] += velocities[i3] * speed;
        positions[i3 + 1] += velocities[i3 + 1] * speed;
        positions[i3 + 2] += velocities[i3 + 2] * speed;

        // 境界チェックとリセット
        switch (type) {
          case 'fire':
            if (positions[i3 + 1] > 8) {
              positions[i3] = (Math.random() - 0.5) * 2;
              positions[i3 + 1] = 0;
              positions[i3 + 2] = (Math.random() - 0.5) * 2;
            }
            break;
          case 'snow':
          case 'rain':
            if (positions[i3 + 1] < -5) {
              positions[i3] = (Math.random() - 0.5) * 20;
              positions[i3 + 1] = 10;
              positions[i3 + 2] = (Math.random() - 0.5) * 20;
            }
            break;
          case 'magic':
            // 円形の動き
            const time = state.clock.elapsedTime;
            const radius = 3 + Math.sin(time + i * 0.1) * 0.5;
            positions[i3] = Math.cos(time * 0.5 + i * 0.1) * radius;
            positions[i3 + 2] = Math.sin(time * 0.5 + i * 0.1) * radius;
            positions[i3 + 1] += velocities[i3 + 1] * speed;
            if (positions[i3 + 1] > 6) positions[i3 + 1] = 0;
            break;
          case 'energy':
            // エネルギー球の動き
            const centerDistance = Math.sqrt(
              positions[i3] ** 2 + positions[i3 + 1] ** 2 + positions[i3 + 2] ** 2
            );
            if (centerDistance > 8) {
              positions[i3] = (Math.random() - 0.5) * 2;
              positions[i3 + 1] = (Math.random() - 0.5) * 2;
              positions[i3 + 2] = (Math.random() - 0.5) * 2;
            }
            break;
        }

        // 色のアニメーション
        if (type === 'fire') {
          const intensity = 1 - (positions[i3 + 1] / 8);
          colors[i3] = intensity; // R
          colors[i3 + 1] = intensity * 0.5; // G
          colors[i3 + 2] = 0; // B
        } else if (type === 'magic') {
          const hue = (state.clock.elapsedTime * 0.1 + i * 0.01) % 1;
          const color = new THREE.Color().setHSL(hue, 1, 0.7);
          colors[i3] = color.r;
          colors[i3 + 1] = color.g;
          colors[i3 + 2] = color.b;
        }
      }

      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      pointsRef.current.geometry.attributes.color.needsUpdate = true;
    });

    return (
      <group position={position}>
        <points ref={pointsRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={count}
              array={positions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              count={count}
              array={colors}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-size"
              count={count}
              array={sizes}
              itemSize={1}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.1}
            sizeAttenuation={true}
            vertexColors={true}
            transparent={true}
            opacity={0.8}
            blending={THREE.AdditiveBlending}
          />
        </points>
      </group>
    );
  };

// 雷エフェクト
export const LightningEffect: React.FC<{
  position: [number, number, number];
  target: [number, number, number];
  isActive?: boolean;
}> = ({ position, target, isActive = true }) => {
  const lightningRef = useRef<THREE.Group>(null);

  const lightningPath = useMemo(() => {
    const points = [];
    const segments = 20;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = position[0] + (target[0] - position[0]) * t + (Math.random() - 0.5) * 0.5;
      const y = position[1] + (target[1] - position[1]) * t + (Math.random() - 0.5) * 0.5;
      const z = position[2] + (target[2] - position[2]) * t + (Math.random() - 0.5) * 0.5;
      points.push(new THREE.Vector3(x, y, z));
    }

    return points;
  }, [position, target]);

  useFrame((state) => {
    if (lightningRef.current && isActive) {
      lightningRef.current.visible = Math.random() > 0.7;
    }
  });

  if (!isActive) return null;

  return (
    <group ref={lightningRef}>
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={lightningPath.length}
            array={new Float32Array(lightningPath.flatMap(p => [p.x, p.y, p.z]))}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#FFFFFF" linewidth={3} />
      </line>
    </group>
  );
};

// オーロラエフェクト
export const AuroraEffect: React.FC<{
  position?: [number, number, number];
  scale?: number;
}> = ({ position = [0, 10, -10], scale = 1 }) => {
  const auroraRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (auroraRef.current) {
      auroraRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      auroraRef.current.material.opacity = 0.3 + Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });

  return (
    <mesh ref={auroraRef} position={position} scale={scale}>
      <planeGeometry args={[20, 8, 32, 16]} />
      <meshBasicMaterial
        color="#00FF88"
        transparent
        opacity={0.3}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};

// 爆発エフェクト
export const ExplosionEffect: React.FC<{
  position: [number, number, number];
  isActive: boolean;
  onComplete?: () => void;
}> = ({ position, isActive, onComplete }) => {
  const explosionRef = useRef<THREE.Group>(null);
  const startTime = useRef<number>(0);

  useFrame((state) => {
    if (!isActive || !explosionRef.current) return;

    if (startTime.current === 0) {
      startTime.current = state.clock.elapsedTime;
    }

    const elapsed = state.clock.elapsedTime - startTime.current;
    const duration = 2; // 2秒間

    if (elapsed > duration) {
      onComplete?.();
      startTime.current = 0;
      return;
    }

    const progress = elapsed / duration;
    const scale = progress * 5;
    const opacity = 1 - progress;

    explosionRef.current.scale.setScalar(scale);
    explosionRef.current.children.forEach((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.Material) {
        child.material.opacity = opacity;
      }
    });
  });

  if (!isActive) return null;

  return (
    <group ref={explosionRef} position={position}>
      {Array.from({ length: 20 }, (_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2
          ]}
          rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
        >
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshBasicMaterial
            color={`hsl(${Math.random() * 60}, 100%, 50%)`}
            transparent
            opacity={1}
          />
        </mesh>
      ))}
    </group>
  );
};

// ポータルエフェクト
export const PortalEffect: React.FC<{
  position: [number, number, number];
  isActive?: boolean;
  size?: number;
}> = ({ position, isActive = true, size = 2 }) => {
  const portalRef = useRef<THREE.Group>(null);
  const ringsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (portalRef.current && isActive) {
      portalRef.current.rotation.z = state.clock.elapsedTime * 0.5;
    }

    if (ringsRef.current && isActive) {
      ringsRef.current.rotation.y = -state.clock.elapsedTime * 0.8;
    }
  });

  if (!isActive) return null;

  return (
    <group position={position}>
      <group ref={portalRef}>
        {/* 中央のポータル */}
        <mesh>
          <ringGeometry args={[size * 0.8, size, 32]} />
          <meshBasicMaterial
            color="#8A2BE2"
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      <group ref={ringsRef}>
        {/* 回転するリング */}
        {Array.from({ length: 3 }, (_, i) => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI) / 3]}>
            <torusGeometry args={[size + i * 0.3, 0.05, 8, 16]} />
            <meshBasicMaterial
              color={`hsl(${270 + i * 30}, 100%, 70%)`}
              transparent
              opacity={0.8}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
      </group>

      {/* パーティクル */}
      <AdvancedParticleSystem
        count={100}
        type="magic"
        position={[0, 0, 0]}
        size={0.5}
        speed={0.5}
        color="#8A2BE2"
      />
    </group>
  );
}; 