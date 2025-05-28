import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface ParticleSystemProps {
  count?: number;
  type?: 'stars' | 'snow' | 'sparkles' | 'bubbles';
}

export const ParticleSystem: React.FC<ParticleSystemProps> = ({
  count = 1000,
  type = 'stars'
}) => {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // 位置の設定
      switch (type) {
        case 'stars':
          positions[i3] = (Math.random() - 0.5) * 50;
          positions[i3 + 1] = (Math.random() - 0.5) * 50;
          positions[i3 + 2] = (Math.random() - 0.5) * 50;
          break;
        case 'snow':
          positions[i3] = (Math.random() - 0.5) * 30;
          positions[i3 + 1] = Math.random() * 20 + 10;
          positions[i3 + 2] = (Math.random() - 0.5) * 30;
          break;
        case 'sparkles':
          positions[i3] = (Math.random() - 0.5) * 20;
          positions[i3 + 1] = Math.random() * 10;
          positions[i3 + 2] = (Math.random() - 0.5) * 20;
          break;
        case 'bubbles':
          positions[i3] = (Math.random() - 0.5) * 25;
          positions[i3 + 1] = Math.random() * 15;
          positions[i3 + 2] = (Math.random() - 0.5) * 25;
          break;
        default:
          positions[i3] = (Math.random() - 0.5) * 40;
          positions[i3 + 1] = (Math.random() - 0.5) * 40;
          positions[i3 + 2] = (Math.random() - 0.5) * 40;
      }

      // 色の設定
      switch (type) {
        case 'stars':
          colors[i3] = 1;
          colors[i3 + 1] = 1;
          colors[i3 + 2] = Math.random() * 0.5 + 0.5;
          break;
        case 'snow':
          colors[i3] = 1;
          colors[i3 + 1] = 1;
          colors[i3 + 2] = 1;
          break;
        case 'sparkles':
          colors[i3] = Math.random() * 0.5 + 0.5;
          colors[i3 + 1] = Math.random() * 0.5 + 0.5;
          colors[i3 + 2] = 1;
          break;
        case 'bubbles':
          colors[i3] = 0.5 + Math.random() * 0.5;
          colors[i3 + 1] = 0.8 + Math.random() * 0.2;
          colors[i3 + 2] = 1;
          break;
        default:
          colors[i3] = Math.random();
          colors[i3 + 1] = Math.random();
          colors[i3 + 2] = Math.random();
      }
    }

    return [positions, colors];
  }, [count, type]);

  useFrame((state) => {
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;

        switch (type) {
          case 'stars':
            // 星は静的だが、わずかに揺らめく
            positions[i3] += Math.sin(state.clock.elapsedTime + i) * 0.001;
            positions[i3 + 1] += Math.cos(state.clock.elapsedTime + i) * 0.001;
            break;
          case 'snow':
            // 雪は下に落ちる
            positions[i3 + 1] -= 0.02;
            positions[i3] += Math.sin(state.clock.elapsedTime + i) * 0.005;
            if (positions[i3 + 1] < -10) {
              positions[i3 + 1] = 20;
            }
            break;
          case 'sparkles':
            // キラキラは上下に浮遊
            positions[i3 + 1] += Math.sin(state.clock.elapsedTime * 2 + i) * 0.01;
            positions[i3] += Math.cos(state.clock.elapsedTime + i) * 0.005;
            positions[i3 + 2] += Math.sin(state.clock.elapsedTime * 1.5 + i) * 0.005;
            break;
          case 'bubbles':
            // 泡は上に浮上
            positions[i3 + 1] += 0.01;
            positions[i3] += Math.sin(state.clock.elapsedTime + i) * 0.003;
            positions[i3 + 2] += Math.cos(state.clock.elapsedTime + i) * 0.003;
            if (positions[i3 + 1] > 20) {
              positions[i3 + 1] = -5;
            }
            break;
        }
      }

      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const getPointSize = () => {
    switch (type) {
      case 'stars': return 2;
      case 'snow': return 3;
      case 'sparkles': return 4;
      case 'bubbles': return 5;
      default: return 2;
    }
  };

  return (
    <Points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <PointMaterial
        size={getPointSize()}
        vertexColors
        transparent
        opacity={type === 'bubbles' ? 0.6 : 0.8}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  );
}; 