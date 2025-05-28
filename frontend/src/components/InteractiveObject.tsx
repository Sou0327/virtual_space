import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';

interface InteractiveObjectProps {
  position: [number, number, number];
  type: 'info' | 'media' | 'shop' | 'social';
  title: string;
  description?: string;
  onClick?: () => void;
}

export const InteractiveObject: React.FC<InteractiveObjectProps> = ({
  position,
  type,
  title,
  description,
  onClick
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // ホバー時の浮遊アニメーション
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;

      // クリック時の回転アニメーション
      if (clicked) {
        meshRef.current.rotation.y += 0.1;
      } else {
        meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.2;
      }
    }
  });

  const getObjectColor = () => {
    switch (type) {
      case 'info': return hovered ? '#60A5FA' : '#3B82F6';
      case 'media': return hovered ? '#F87171' : '#EF4444';
      case 'shop': return hovered ? '#34D399' : '#10B981';
      case 'social': return hovered ? '#A78BFA' : '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getObjectIcon = () => {
    switch (type) {
      case 'info': return 'ℹ️';
      case 'media': return '🎬';
      case 'shop': return '🛒';
      case 'social': return '💬';
      default: return '❓';
    }
  };

  const handleClick = () => {
    setClicked(true);
    setTimeout(() => setClicked(false), 500);
    onClick?.();
  };

  return (
    <group position={position}>
      {/* メインオブジェクト */}
      <Box
        ref={meshRef}
        args={[1, 1, 1]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={handleClick}
      >
        <meshStandardMaterial
          color={getObjectColor()}
          emissive={getObjectColor()}
          emissiveIntensity={hovered ? 0.3 : 0.1}
          transparent
          opacity={hovered ? 0.9 : 0.7}
        />
      </Box>

      {/* アイコン表示 */}
      <Text
        position={[0, 0, 0.51]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {getObjectIcon()}
      </Text>

      {/* タイトル表示 */}
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {title}
      </Text>

      {/* ホバー時の詳細情報 */}
      {hovered && description && (
        <Text
          position={[0, -1.5, 0]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
          maxWidth={3}
        >
          {description}
        </Text>
      )}

      {/* 光のエフェクト */}
      {hovered && (
        <Sphere args={[1.2, 16, 16]} position={[0, 0, 0]}>
          <meshBasicMaterial
            color={getObjectColor()}
            transparent
            opacity={0.1}
            side={THREE.BackSide}
          />
        </Sphere>
      )}
    </group>
  );
}; 