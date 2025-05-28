import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Sky, Stars, Clouds, SpotLight } from '@react-three/drei';
import * as THREE from 'three';
import {
  MagicalOrbs,
  MagicCircle,
  FloatingSpellbook,
  EnchantedTree,
  MagicalCrystal
} from './AdvancedFantasyEffects';

interface AIEnvironmentConfig {
  description: string;
  mood: 'mystical' | 'dark' | 'bright' | 'ethereal' | 'ancient' | 'modern';
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night' | 'eternal';
  weather: 'clear' | 'foggy' | 'stormy' | 'snowy' | 'magical';
  scale: 'intimate' | 'medium' | 'vast' | 'infinite';
}

interface AIEnvironmentGeneratorProps {
  config: AIEnvironmentConfig;
  onGenerated?: (elements: any[]) => void;
}

// AIテキスト解析エンジン
class FantasyEnvironmentAnalyzer {
  static parseDescription(description: string): {
    structures: string[];
    atmosphere: string[];
    lighting: string[];
    effects: string[];
    textures: string[];
    sounds: string[];
  } {
    const keywords = {
      structures: {
        '魔法学校': ['castle', 'towers', 'courtyard', 'library', 'classroom'],
        '城': ['castle', 'towers', 'walls', 'moat', 'bridge'],
        '森': ['trees', 'forest', 'grove', 'clearing'],
        '洞窟': ['cave', 'crystals', 'stalactites', 'underground'],
        '空中都市': ['floating', 'clouds', 'bridges', 'platforms'],
        '神殿': ['temple', 'pillars', 'altar', 'statues'],
        '図書館': ['library', 'books', 'shelves', 'scrolls'],
        '実験室': ['laboratory', 'cauldrons', 'potions', 'apparatus']
      },
      atmosphere: {
        '神秘的': ['mystical', 'ethereal', 'otherworldly'],
        '幻想的': ['fantasy', 'dreamlike', 'surreal'],
        '古代': ['ancient', 'old', 'weathered'],
        '魔法': ['magical', 'enchanted', 'spellbound'],
        '暗い': ['dark', 'shadow', 'mysterious'],
        '明るい': ['bright', 'luminous', 'radiant']
      },
      lighting: {
        '松明': ['torches', 'fire', 'flame'],
        '魔法の光': ['magical_light', 'glow', 'aura'],
        '月光': ['moonlight', 'lunar', 'silver'],
        '星明かり': ['starlight', 'cosmic', 'celestial'],
        '蝋燭': ['candles', 'wax', 'flicker'],
        '水晶': ['crystal', 'gem', 'prismatic']
      },
      effects: {
        '霧': ['fog', 'mist', 'haze'],
        '雲': ['clouds', 'vapor', 'sky'],
        '魔法の粒子': ['particles', 'sparkles', 'magic_dust'],
        '炎': ['fire', 'flame', 'ember'],
        '稲妻': ['lightning', 'electric', 'storm'],
        '雪': ['snow', 'ice', 'frost']
      },
      textures: {
        '石': ['stone', 'granite', 'marble'],
        '木': ['wood', 'timber', 'oak'],
        '金属': ['metal', 'bronze', 'silver'],
        '布': ['fabric', 'tapestry', 'velvet'],
        '魔法': ['magical', 'ethereal', 'energy']
      },
      sounds: {
        '風': ['wind', 'breeze', 'whisper'],
        '水': ['water', 'stream', 'fountain'],
        '炎': ['fire', 'crackle', 'burn'],
        '魔法': ['magic', 'chime', 'resonance']
      }
    };

    const result = {
      structures: [] as string[],
      atmosphere: [] as string[],
      lighting: [] as string[],
      effects: [] as string[],
      textures: [] as string[],
      sounds: [] as string[]
    };

    const lowerDesc = description.toLowerCase();

    // キーワードマッチング
    Object.entries(keywords).forEach(([category, subcategories]) => {
      Object.entries(subcategories).forEach(([keyword, tags]) => {
        if (lowerDesc.includes(keyword)) {
          result[category as keyof typeof result].push(...tags);
        }
      });
    });

    return result;
  }

  static generatePalette(mood: string, timeOfDay: string): {
    primary: string;
    secondary: string;
    accent: string;
    ambient: string;
    fog: string;
  } {
    const palettes: Record<string, Record<string, any>> = {
      mystical: {
        dawn: { primary: '#9d4edd', secondary: '#c77dff', accent: '#e0aaff', ambient: '#f8f4ff', fog: '#e0aaff40' },
        day: { primary: '#7209b7', secondary: '#a663cc', accent: '#c77dff', ambient: '#f1e8ff', fog: '#c77dff30' },
        dusk: { primary: '#560bad', secondary: '#7209b7', accent: '#9d4edd', ambient: '#2d1b69', fog: '#9d4edd50' },
        night: { primary: '#240046', secondary: '#3c096c', accent: '#5a189a', ambient: '#10002b', fog: '#5a189a60' }
      },
      dark: {
        dawn: { primary: '#2d1b69', secondary: '#403d58', accent: '#5d5a7b', ambient: '#1a1626', fog: '#403d5860' },
        day: { primary: '#1a1626', secondary: '#2d1b69', accent: '#403d58', ambient: '#0f0a19', fog: '#2d1b6940' },
        dusk: { primary: '#0f0a19', secondary: '#1a1626', accent: '#2d1b69', ambient: '#080414', fog: '#1a162680' },
        night: { primary: '#080414', secondary: '#0f0a19', accent: '#1a1626', ambient: '#040209', fog: '#0f0a1990' }
      },
      bright: {
        dawn: { primary: '#fff3e0', secondary: '#ffe0b2', accent: '#ffcc80', ambient: '#fff8e1', fog: '#ffcc8030' },
        day: { primary: '#fff8e1', secondary: '#fff3e0', accent: '#ffe0b2', ambient: '#fffde7', fog: '#ffe0b220' },
        dusk: { primary: '#ffe0b2', secondary: '#ffcc80', accent: '#ffab40', ambient: '#fff3e0', fog: '#ffab4040' },
        night: { primary: '#ff8f00', secondary: '#ffa726', accent: '#ffb74d', ambient: '#fff3e0', fog: '#ffb74d50' }
      },
      ethereal: {
        dawn: { primary: '#e8f5e8', secondary: '#c8e6c9', accent: '#a5d6a7', ambient: '#f1f8e9', fog: '#a5d6a730' },
        day: { primary: '#f1f8e9', secondary: '#e8f5e8', accent: '#c8e6c9', ambient: '#f9fbe7', fog: '#c8e6c920' },
        dusk: { primary: '#c8e6c9', secondary: '#a5d6a7', accent: '#81c784', ambient: '#e8f5e8', fog: '#81c78440' },
        night: { primary: '#2e7d32', secondary: '#388e3c', accent: '#43a047', ambient: '#1b5e20', fog: '#43a04750' }
      }
    };

    return palettes[mood]?.[timeOfDay] || palettes.mystical.day;
  }
}

// 魔法的な建造物生成
const MagicalStructure: React.FC<{
  type: string;
  position: [number, number, number];
  scale: number;
  material: any;
}> = ({ type, position, scale, material }) => {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // 微細な魔法的な動き
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.01;
    }
  });

  const structures: Record<string, JSX.Element> = {
    tower: (
      <group ref={meshRef} position={position} scale={scale}>
        {/* 基部 */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[2, 3, 6, 8]} />
          {material}
        </mesh>
        {/* 中部 */}
        <mesh position={[0, 4, 0]}>
          <cylinderGeometry args={[1.5, 2, 8, 8]} />
          {material}
        </mesh>
        {/* 頂部 */}
        <mesh position={[0, 9, 0]}>
          <coneGeometry args={[2, 3, 8]} />
          {material}
        </mesh>
        {/* 魔法的な装飾 */}
        {Array.from({ length: 6 }, (_, i) => (
          <mesh key={i} position={[
            Math.cos((i / 6) * Math.PI * 2) * 2.5,
            2 + i * 1.2,
            Math.sin((i / 6) * Math.PI * 2) * 2.5
          ]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial
              color="#ff6b6b"
              emissive="#ff0000"
              emissiveIntensity={0.5}
            />
          </mesh>
        ))}
      </group>
    ),
    castle: (
      <group ref={meshRef} position={position} scale={scale}>
        {/* メイン構造 */}
        <mesh position={[0, 2, 0]}>
          <boxGeometry args={[8, 4, 8]} />
          {material}
        </mesh>
        {/* 角の塔 */}
        {Array.from({ length: 4 }, (_, i) => (
          <mesh key={i} position={[
            i < 2 ? -3.5 : 3.5,
            4,
            i % 2 === 0 ? -3.5 : 3.5
          ]}>
            <cylinderGeometry args={[0.8, 1, 6, 8]} />
            {material}
          </mesh>
        ))}
        {/* 城門 */}
        <mesh position={[0, 1, -4.2]}>
          <cylinderGeometry args={[1.5, 1.5, 2, 16, 1, false, 0, Math.PI]} />
          {material}
        </mesh>
      </group>
    ),
    library: (
      <group ref={meshRef} position={position} scale={scale}>
        {/* メイン建物 */}
        <mesh position={[0, 3, 0]}>
          <boxGeometry args={[12, 6, 8]} />
          {material}
        </mesh>
        {/* 本棚（窓のような装飾） */}
        {Array.from({ length: 6 }, (_, i) => (
          <mesh key={i} position={[
            -5 + i * 2,
            3,
            4.1
          ]}>
            <boxGeometry args={[1.5, 4, 0.2]} />
            <meshStandardMaterial color="#8b4513" />
          </mesh>
        ))}
        {/* ドーム屋根 */}
        <mesh position={[0, 7, 0]}>
          <sphereGeometry args={[4, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          {material}
        </mesh>
      </group>
    )
  };

  return structures[type] || structures.tower;
};

// 魔法的なパーティクルシステム
const MagicalParticles: React.FC<{
  type: string;
  position: [number, number, number];
  count: number;
  color: string;
}> = ({ type, position, count, color }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const tempObject = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (meshRef.current) {
      for (let i = 0; i < count; i++) {
        const time = state.clock.elapsedTime + i * 0.1;

        switch (type) {
          case 'magical_dust':
            tempObject.position.set(
              position[0] + Math.sin(time + i) * 3,
              position[1] + Math.sin(time * 2 + i) * 2 + 2,
              position[2] + Math.cos(time + i) * 3
            );
            break;
          case 'floating_orbs':
            tempObject.position.set(
              position[0] + Math.sin(time * 0.5 + i * 2) * 5,
              position[1] + Math.sin(time + i) + 3,
              position[2] + Math.cos(time * 0.5 + i * 2) * 5
            );
            tempObject.scale.setScalar(0.5 + Math.sin(time * 2) * 0.2);
            break;
          case 'energy_streams':
            tempObject.position.set(
              position[0] + Math.sin(time * 3 + i * 0.5) * 2,
              position[1] + i * 0.3,
              position[2] + Math.cos(time * 3 + i * 0.5) * 2
            );
            break;
        }

        tempObject.updateMatrix();
        meshRef.current.setMatrixAt(i, tempObject.matrix);
      }
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.8}
        transparent
        opacity={0.8}
      />
    </instancedMesh>
  );
};

// メインAI環境生成コンポーネント
export const AIEnvironmentGenerator: React.FC<AIEnvironmentGeneratorProps> = ({
  config,
  onGenerated
}) => {
  const parsedElements = useMemo(() => {
    return FantasyEnvironmentAnalyzer.parseDescription(config.description);
  }, [config.description]);

  const colorPalette = useMemo(() => {
    return FantasyEnvironmentAnalyzer.generatePalette(config.mood, config.timeOfDay);
  }, [config.mood, config.timeOfDay]);

  const environmentSettings = useMemo(() => {
    const settings = {
      fogNear: 10,
      fogFar: 100,
      fogColor: colorPalette.fog,
      skyConfig: {
        inclination: config.timeOfDay === 'night' ? 0.6 : 0.49,
        azimuth: 0.25,
        distance: 450000
      },
      lightingIntensity: {
        ambient: config.timeOfDay === 'night' ? 0.2 : 0.4,
        directional: config.timeOfDay === 'night' ? 0.5 : 1.2
      }
    };

    switch (config.scale) {
      case 'intimate':
        settings.fogFar = 30;
        break;
      case 'medium':
        settings.fogFar = 60;
        break;
      case 'vast':
        settings.fogFar = 150;
        break;
      case 'infinite':
        settings.fogFar = 300;
        break;
    }

    return settings;
  }, [config, colorPalette]);

  return (
    <>
      {/* 環境設定 */}
      <Environment preset="sunset" />

      {/* 背景色 */}
      <color attach="background" args={[colorPalette.primary]} />

      {/* 霧 */}
      <fog
        attach="fog"
        args={[
          colorPalette.fog,
          environmentSettings.fogNear,
          environmentSettings.fogFar
        ]}
      />

      {/* 空 */}
      <Sky
        distance={environmentSettings.skyConfig.distance}
        sunPosition={
          config.timeOfDay === 'night'
            ? [0, -1, 0]
            : [100, 20, 100]
        }
        inclination={environmentSettings.skyConfig.inclination}
        azimuth={environmentSettings.skyConfig.azimuth}
      />

      {/* 星（夜の場合） */}
      {config.timeOfDay === 'night' && (
        <Stars
          radius={300}
          depth={60}
          count={20000}
          factor={7}
        />
      )}

      {/* 雲（霧の場合） */}
      {config.weather === 'foggy' && (
        <Clouds
          material={THREE.MeshLambertMaterial}
          limit={200}
          range={200}
        />
      )}

      {/* 魔法的な建造物 */}
      {parsedElements.structures.includes('castle') && (
        <MagicalStructure
          type="castle"
          position={[0, 0, -20]}
          scale={1}
          material={
            <meshStandardMaterial
              color={colorPalette.secondary}
              roughness={0.8}
              metalness={0.2}
            />
          }
        />
      )}

      {parsedElements.structures.includes('towers') && (
        <>
          <MagicalStructure
            type="tower"
            position={[-15, 0, -10]}
            scale={0.8}
            material={
              <meshStandardMaterial
                color={colorPalette.accent}
                roughness={0.7}
                metalness={0.3}
              />
            }
          />
          <MagicalStructure
            type="tower"
            position={[15, 0, -15]}
            scale={1.2}
            material={
              <meshStandardMaterial
                color={colorPalette.accent}
                roughness={0.7}
                metalness={0.3}
              />
            }
          />
        </>
      )}

      {parsedElements.structures.includes('library') && (
        <>
          <MagicalStructure
            type="library"
            position={[25, 0, 0]}
            scale={0.7}
            material={
              <meshStandardMaterial
                color={colorPalette.secondary}
                roughness={0.6}
                metalness={0.1}
              />
            }
          />

          {/* 図書館周辺に浮遊する魔法書 */}
          {Array.from({ length: 3 }, (_, i) => (
            <FloatingSpellbook
              key={i}
              position={[
                25 + (i - 1) * 8,
                3 + Math.sin(i) * 2,
                (i - 1) * 5
              ]}
              isOpen={true}
              color={colorPalette.accent}
            />
          ))}
        </>
      )}

      {/* 魔法的なパーティクルエフェクト */}
      {parsedElements.effects.includes('particles') && (
        <MagicalParticles
          type="magical_dust"
          position={[0, 5, 0]}
          count={100}
          color={colorPalette.accent}
        />
      )}

      {parsedElements.effects.includes('magic_dust') && (
        <MagicalOrbs
          position={[0, 8, 0]}
          count={20}
          color="#ffd700"
          size={0.3}
          speed={0.8}
        />
      )}

      {/* 高度な魔法的装飾 */}

      {/* 中央の大魔法陣 */}
      <MagicCircle
        position={[0, 0.1, 0]}
        radius={6}
        isActive={true}
        color={colorPalette.accent}
      />

      {/* 魔法の水晶群 */}
      {Array.from({ length: 6 }, (_, i) => (
        <MagicalCrystal
          key={i}
          position={[
            Math.sin((i / 6) * Math.PI * 2) * 20,
            0,
            Math.cos((i / 6) * Math.PI * 2) * 20
          ]}
          size={1 + Math.random() * 0.5}
          color={i % 2 === 0 ? colorPalette.accent : "#4169E1"}
          pulseSpeed={2 + Math.random() * 2}
        />
      ))}

      {/* 魔法の森 */}
      {(parsedElements.structures.includes('forest') || parsedElements.structures.includes('trees')) && (
        Array.from({ length: 8 }, (_, i) => (
          <EnchantedTree
            key={i}
            position={[
              (Math.random() - 0.5) * 80,
              0,
              (Math.random() - 0.5) * 80
            ]}
            scale={0.8 + Math.random() * 0.4}
            season={config.timeOfDay === 'night' ? 'winter' : 'spring'}
            magicalIntensity={config.mood === 'mystical' ? 0.8 : 0.4}
          />
        ))
      )}

      {/* 空中に浮かぶ魔法オーブ */}
      <MagicalOrbs
        position={[0, 15, 0]}
        count={30}
        color={colorPalette.accent}
        size={0.2}
        speed={0.5}
      />

      {/* 四隅の守護魔法陣 */}
      {Array.from({ length: 4 }, (_, i) => (
        <MagicCircle
          key={i}
          position={[
            Math.sin((i / 4) * Math.PI * 2) * 40,
            0.2,
            Math.cos((i / 4) * Math.PI * 2) * 40
          ]}
          radius={3}
          isActive={true}
          color={i % 2 === 0 ? "#32CD32" : "#FF6347"}
        />
      ))}

      {/* 魔法的な照明 */}
      {parsedElements.lighting.includes('magical_light') && (
        <>
          <spotLight
            position={[0, 20, 0]}
            angle={0.6}
            penumbra={1}
            intensity={1}
            color={colorPalette.accent}
            castShadow
          />

          {Array.from({ length: 8 }, (_, i) => (
            <pointLight
              key={i}
              position={[
                Math.sin((i / 8) * Math.PI * 2) * 12,
                3,
                Math.cos((i / 8) * Math.PI * 2) * 12
              ]}
              intensity={0.5}
              color={colorPalette.accent}
              distance={8}
            />
          ))}
        </>
      )}

      {/* 魔法の床 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[200, 200, 100, 100]} />
        <meshStandardMaterial
          color={colorPalette.primary}
          roughness={0.8}
          metalness={0.1}
          transparent
          opacity={0.9}
        />
      </mesh>
    </>
  );
}; 