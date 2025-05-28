import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';

// 高度なマテリアル定義
export const useAdvancedMaterials = () => {
  const materials = useMemo(() => ({
    // 木材マテリアル
    wood: new THREE.MeshStandardMaterial({
      color: '#8B4513',
      roughness: 0.8,
      metalness: 0.1,
      normalScale: new THREE.Vector2(0.5, 0.5),
    }),

    // 大理石マテリアル
    marble: new THREE.MeshStandardMaterial({
      color: '#F8F8FF',
      roughness: 0.1,
      metalness: 0.0,
      transparent: true,
      opacity: 0.9,
    }),

    // 金属マテリアル
    metal: new THREE.MeshStandardMaterial({
      color: '#C0C0C0',
      roughness: 0.2,
      metalness: 0.9,
      envMapIntensity: 1.0,
    }),

    // ガラスマテリアル
    glass: new THREE.MeshPhysicalMaterial({
      color: '#FFFFFF',
      metalness: 0.0,
      roughness: 0.0,
      transmission: 0.9,
      transparent: true,
      opacity: 0.1,
      ior: 1.5,
      thickness: 0.01,
    }),

    // ネオンマテリアル
    neon: new THREE.MeshStandardMaterial({
      color: '#00FFFF',
      emissive: '#00FFFF',
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.8,
    }),

    // 布マテリアル
    fabric: new THREE.MeshStandardMaterial({
      color: '#8B0000',
      roughness: 0.9,
      metalness: 0.0,
    }),

    // 草マテリアル
    grass: new THREE.MeshStandardMaterial({
      color: '#228B22',
      roughness: 0.9,
      metalness: 0.0,
    }),

    // 水マテリアル
    water: new THREE.MeshPhysicalMaterial({
      color: '#006994',
      metalness: 0.0,
      roughness: 0.1,
      transmission: 0.8,
      transparent: true,
      opacity: 0.6,
      ior: 1.33,
    }),

    // ホログラムマテリアル
    hologram: new THREE.MeshStandardMaterial({
      color: '#00FFFF',
      emissive: '#0080FF',
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
    }),

    // 発光マテリアル
    glow: new THREE.MeshStandardMaterial({
      color: '#FFFF00',
      emissive: '#FFFF00',
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.9,
    }),
  }), []);

  return materials;
};

// 動的マテリアルコンポーネント
export const DynamicMaterial: React.FC<{
  type: 'wood' | 'marble' | 'metal' | 'glass' | 'neon' | 'fabric' | 'grass' | 'water' | 'hologram' | 'glow';
  color?: string;
  emissiveIntensity?: number;
  roughness?: number;
  metalness?: number;
  opacity?: number;
}> = ({
  type,
  color,
  emissiveIntensity = 0.5,
  roughness,
  metalness,
  opacity
}) => {
    const materials = useAdvancedMaterials();

    const material = useMemo(() => {
      const baseMaterial = materials[type].clone();

      if (color) baseMaterial.color.set(color);
      if (emissiveIntensity !== undefined && baseMaterial.emissiveIntensity !== undefined) {
        baseMaterial.emissiveIntensity = emissiveIntensity;
      }
      if (roughness !== undefined) baseMaterial.roughness = roughness;
      if (metalness !== undefined) baseMaterial.metalness = metalness;
      if (opacity !== undefined) {
        baseMaterial.opacity = opacity;
        baseMaterial.transparent = true;
      }

      return baseMaterial;
    }, [materials, type, color, emissiveIntensity, roughness, metalness, opacity]);

    return <primitive object={material} attach="material" />;
  };

// テクスチャローダーフック
export const useTextures = () => {
  // 実際のプロジェクトでは、テクスチャファイルをロードします
  // const woodTexture = useLoader(THREE.TextureLoader, '/textures/wood.jpg');
  // const marbleTexture = useLoader(THREE.TextureLoader, '/textures/marble.jpg');

  return useMemo(() => ({
    // プロシージャルテクスチャの生成
    createNoiseTexture: (width = 512, height = 512) => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d')!;

      const imageData = context.createImageData(width, height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 255;
        data[i] = noise;     // R
        data[i + 1] = noise; // G
        data[i + 2] = noise; // B
        data[i + 3] = 255;   // A
      }

      context.putImageData(imageData, 0, 0);

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(4, 4);

      return texture;
    },

    createGradientTexture: (color1: string, color2: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const context = canvas.getContext('2d')!;

      const gradient = context.createLinearGradient(0, 0, 256, 256);
      gradient.addColorStop(0, color1);
      gradient.addColorStop(1, color2);

      context.fillStyle = gradient;
      context.fillRect(0, 0, 256, 256);

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;

      return texture;
    },
  }), []);
}; 