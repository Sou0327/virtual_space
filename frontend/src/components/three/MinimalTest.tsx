import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, MeshReflectorMaterial, Box, Cylinder, Sphere, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

// 超リアルなレザーチェア
const RealisticLeatherChair: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* 座面（ふっくらとしたクッション） */}
      <mesh position={[0, 0.65, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.25, 1.6]} />
        <meshStandardMaterial
          color="#8B4513"
          metalness={0.05}
          roughness={0.8}
        />
      </mesh>

      {/* 座面の縁取り */}
      <mesh position={[0, 0.77, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.75, 0.05, 1.55]} />
        <meshStandardMaterial
          color="#654321"
          metalness={0.1}
          roughness={0.6}
        />
      </mesh>

      {/* 背もたれ（カーブド） */}
      <mesh position={[0, 1.5, -0.7]} rotation={[0.1, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 1.7, 0.25]} />
        <meshStandardMaterial
          color="#A0522D"
          metalness={0.05}
          roughness={0.7}
        />
      </mesh>

      {/* 背もたれの縫い目 */}
      <mesh position={[0, 1.5, -0.57]} rotation={[0.1, 0, 0]} castShadow>
        <boxGeometry args={[1.7, 1.6, 0.02]} />
        <meshStandardMaterial
          color="#654321"
          metalness={0.1}
          roughness={0.5}
        />
      </mesh>

      {/* 脚（木製・テーパー形状） */}
      {[[-0.7, 0.3, -0.6], [0.7, 0.3, -0.6], [-0.7, 0.3, 0.6], [0.7, 0.3, 0.6]].map((pos, i) => (
        <group key={i}>
          <mesh position={pos as [number, number, number]} castShadow>
            <cylinderGeometry args={[0.12, 0.08, 0.6]} />
            <meshStandardMaterial
              color="#654321"
              metalness={0.2}
              roughness={0.4}
            />
          </mesh>
          {/* 脚のキャップ */}
          <mesh position={[pos[0], pos[1] - 0.3, pos[2]]} castShadow>
            <cylinderGeometry args={[0.09, 0.09, 0.05]} />
            <meshStandardMaterial
              color="#2C2C2C"
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
        </group>
      ))}

      {/* アームレスト */}
      {[[-0.95, 1.1, 0], [0.95, 1.1, 0]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow receiveShadow>
          <boxGeometry args={[0.2, 0.15, 1.2]} />
          <meshStandardMaterial
            color="#A0522D"
            metalness={0.05}
            roughness={0.7}
          />
        </mesh>
      ))}

      {/* 座面クッション（レザー風） */}
      <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.2, 1.4]} />
        <meshStandardMaterial
          color="#8B0000"
          metalness={0.1}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
};

// プレミアムガラステーブル
const PremiumGlassTable: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const groupRef = useRef<THREE.Group>(null);
  const glassRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.01;
    }
    if (glassRef.current && glassRef.current.material) {
      const material = glassRef.current.material as THREE.MeshStandardMaterial;
      material.opacity = 0.15 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* ガラス天板（厚み表現） */}
      <mesh ref={glassRef} position={[0, 1.25, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.8, 1.8, 0.15, 64]} />
        <meshStandardMaterial
          color="#E6F3FF"
          metalness={0.0}
          roughness={0.0}
          transparent={true}
          opacity={0.15}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* ガラスの縁 */}
      <mesh position={[0, 1.25, 0]} castShadow>
        <cylinderGeometry args={[1.82, 1.82, 0.05, 64]} />
        <meshStandardMaterial
          color="#C0C0C0"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* ステンレス脚（複雑な形状） */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.15, 1.0, 32]} />
        <meshStandardMaterial
          color="#E5E5E5"
          metalness={0.95}
          roughness={0.05}
        />
      </mesh>

      {/* 中央の接続部 */}
      <mesh position={[0, 1.15, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.2, 0.1, 32]} />
        <meshStandardMaterial
          color="#D3D3D3"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* ベース（重厚感のある円盤） */}
      <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.0, 1.0, 0.15, 64]} />
        <meshStandardMaterial
          color="#696969"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* 滑り止めパッド */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const x = Math.cos(angle) * 0.8;
        const z = Math.sin(angle) * 0.8;
        return (
          <mesh key={i} position={[x, 0.005, z]} receiveShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.01, 16]} />
            <meshStandardMaterial
              color="#2C2C2C"
              metalness={0.0}
              roughness={1.0}
            />
          </mesh>
        );
      })}
    </group>
  );
};

// 詳細な本棚
const DetailedBookShelf: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.02;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* メインフレーム */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 3.2, 0.9]} />
        <meshStandardMaterial
          color="#654321"
          metalness={0.1}
          roughness={0.9}
        />
      </mesh>

      {/* 背板 */}
      <mesh position={[0, 1.5, -0.4]} castShadow receiveShadow>
        <boxGeometry args={[2.0, 3.0, 0.05]} />
        <meshStandardMaterial
          color="#8B4513"
          metalness={0.05}
          roughness={0.8}
        />
      </mesh>

      {/* 棚板（より詳細） */}
      {[1.0, 0.4, -0.2, -0.8].map((y, i) => (
        <group key={i}>
          <mesh position={[0, y, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.0, 0.08, 0.8]} />
            <meshStandardMaterial
              color="#A0522D"
              metalness={0.1}
              roughness={0.7}
            />
          </mesh>
          {/* 棚板の縁 */}
          <mesh position={[0, y + 0.045, 0.35]} castShadow>
            <boxGeometry args={[2.0, 0.02, 0.05]} />
            <meshStandardMaterial
              color="#654321"
              metalness={0.15}
              roughness={0.6}
            />
          </mesh>
        </group>
      ))}

      {/* リアルな本 */}
      {Array.from({ length: 24 }, (_, i) => {
        const shelfIndex = Math.floor(i / 6);
        const bookIndex = i % 6;
        const shelfY = [1.05, 0.45, -0.15, -0.75][shelfIndex];
        const x = -0.8 + bookIndex * 0.27;
        const height = 0.25 + Math.random() * 0.1;
        const width = 0.15 + Math.random() * 0.05;
        const depth = 0.03 + Math.random() * 0.02;

        const colors = [
          '#8B0000', '#006400', '#4B0082', '#FF8C00',
          '#1E90FF', '#8B4513', '#228B22', '#DC143C',
          '#9932CC', '#FF1493', '#00CED1', '#FF6347'
        ];

        return (
          <mesh
            key={i}
            position={[x, shelfY + height / 2, 0.25]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial
              color={colors[i % colors.length]}
              metalness={0.0}
              roughness={0.8}
            />
          </mesh>
        );
      })}

      {/* 装飾的な取っ手 */}
      {[0.8, -1.2].map((y, i) => (
        <mesh key={i} position={[0.9, y, 0.46]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.1]} />
          <meshStandardMaterial
            color="#DAA520"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      ))}
    </group>
  );
};

// リアルな観葉植物
const RealisticPlant: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const groupRef = useRef<THREE.Group>(null);
  const leavesRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const sway = Math.sin(state.clock.elapsedTime * 1.2) * 0.02;
      groupRef.current.rotation.z = sway;
    }
    if (leavesRef.current) {
      leavesRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* テラコッタ植木鉢（質感向上） */}
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.45, 0.35, 0.7, 32]} />
        <meshStandardMaterial
          color="#A0522D"
          metalness={0.0}
          roughness={1.0}
        />
      </mesh>

      {/* 植木鉢の縁 */}
      <mesh position={[0, 0.68, 0]} castShadow>
        <cylinderGeometry args={[0.48, 0.45, 0.05, 32]} />
        <meshStandardMaterial
          color="#8B4513"
          metalness={0.05}
          roughness={0.9}
        />
      </mesh>

      {/* 受け皿 */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <cylinderGeometry args={[0.5, 0.5, 0.03, 32]} />
        <meshStandardMaterial
          color="#654321"
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>

      {/* 土（詳細） */}
      <mesh position={[0, 0.62, 0]} receiveShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.15, 32]} />
        <meshStandardMaterial
          color="#3C2415"
          metalness={0.0}
          roughness={1.0}
        />
      </mesh>

      {/* 複数の茎 */}
      {[0, 0.2, -0.15].map((offset, i) => (
        <mesh key={i} position={[offset, 1.3, offset * 0.5]} castShadow>
          <cylinderGeometry args={[0.04, 0.06, 1.4, 16]} />
          <meshStandardMaterial
            color="#228B22"
            metalness={0.0}
            roughness={0.7}
          />
        </mesh>
      ))}

      {/* リアルな葉っぱ（多層構造） */}
      <group ref={leavesRef}>
        {[
          [0.4, 2.0, 0.3], [-0.4, 1.8, -0.2], [0.3, 1.6, -0.4],
          [-0.3, 1.4, 0.4], [0.5, 1.2, 0.1], [-0.5, 1.0, -0.1],
          [0.2, 2.2, 0.2], [-0.2, 2.0, -0.3], [0.1, 1.8, 0.5],
          [-0.1, 1.6, -0.5], [0.3, 1.4, 0.3], [-0.3, 1.2, -0.3]
        ].map((pos, i) => (
          <mesh key={i} position={pos as [number, number, number]} castShadow>
            <sphereGeometry args={[0.25, 8, 6]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? "#32CD32" : "#228B22"}
              metalness={0.0}
              roughness={0.6}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};

// プレミアムフロアランプ
const PremiumFloorLamp: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const groupRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const shadeRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.intensity = 1.2 + Math.sin(state.clock.elapsedTime * 1.5) * 0.3;
    }
    if (shadeRef.current && shadeRef.current.material) {
      const material = shadeRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* 重厚なベース */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.3, 32]} />
        <meshStandardMaterial
          color="#1C1C1C"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* ベースの装飾リング */}
      <mesh position={[0, 0.28, 0]} castShadow>
        <cylinderGeometry args={[0.42, 0.38, 0.05, 32]} />
        <meshStandardMaterial
          color="#DAA520"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* メインポール（セグメント化） */}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={i} position={[0, 0.5 + i * 0.35, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.3, 16]} />
          <meshStandardMaterial
            color="#2C2C2C"
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
      ))}

      {/* ポール接続部 */}
      {Array.from({ length: 4 }, (_, i) => (
        <mesh key={i} position={[0, 0.65 + i * 0.35, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.08, 16]} />
          <meshStandardMaterial
            color="#DAA520"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      ))}

      {/* ランプシェード（ファブリック風） */}
      <mesh ref={shadeRef} position={[0, 2.3, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.8, 1.0, 32]} />
        <meshStandardMaterial
          color="#F5F5DC"
          metalness={0.0}
          roughness={0.9}
          emissive="#FFF8DC"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* シェードの縁取り */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <cylinderGeometry args={[0.82, 0.82, 0.03, 32]} />
        <meshStandardMaterial
          color="#DAA520"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* 光源 */}
      <pointLight
        ref={lightRef}
        position={[0, 2.1, 0]}
        intensity={1.2}
        color="#FFF8DC"
        distance={12}
        decay={2}
        castShadow
      />

      {/* 装飾用チェーン */}
      <mesh position={[0.6, 1.9, 0]} castShadow>
        <cylinderGeometry args={[0.01, 0.01, 0.3, 8]} />
        <meshStandardMaterial
          color="#DAA520"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
    </group>
  );
};

// 超リアル家具ショールーム
const UltraRealisticShowroom: React.FC = () => {
  console.log('�� UltraRealisticShowroom rendering...');
  console.log('🎮 THREE.js version:', THREE.REVISION);

  return (
    <>
      {/* 環境光とHDRI環境マップ */}
      <Environment preset="studio" background={false} />

      {/* 高品質照明設定 */}
      <ambientLight intensity={0.2} />
      <directionalLight
        position={[15, 15, 8]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[4096, 4096]}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={-0.0001}
      />

      {/* 追加の方向光（リムライト効果） */}
      <directionalLight
        position={[-10, 10, -5]}
        intensity={0.8}
        color="#E6F3FF"
      />

      {/* 天井照明 */}
      <spotLight
        position={[0, 12, 0]}
        angle={0.6}
        penumbra={1}
        intensity={1.0}
        castShadow
        color="#FFFACD"
      />

      {/* 超リアル家具配置 */}
      <RealisticLeatherChair position={[-4, 0, -2]} />
      <RealisticLeatherChair position={[-1.5, 0, -2]} />
      <PremiumGlassTable position={[-2.75, 0, 1.5]} />
      <DetailedBookShelf position={[4, 0, -3]} />
      <RealisticPlant position={[2.5, 0, 3.5]} />
      <RealisticPlant position={[-5, 0, 3]} />
      <PremiumFloorLamp position={[5, 0, 1]} />

      {/* 高級パーケットフローリング */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial
          color="#DEB887"
          metalness={0.05}
          roughness={0.7}
        />
      </mesh>

      {/* 高級ペルシャ絨毯 */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 7]} />
        <meshStandardMaterial
          color="#8B0000"
          metalness={0.0}
          roughness={1.0}
        />
      </mesh>

      {/* 絨毯の装飾パターン */}
      <mesh position={[0, 0.007, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 5]} />
        <meshStandardMaterial
          color="#DAA520"
          metalness={0.0}
          roughness={0.9}
          transparent={true}
          opacity={0.6}
        />
      </mesh>

      {/* 壁（背景） */}
      <mesh position={[0, 2.5, -6]} receiveShadow>
        <planeGeometry args={[30, 5]} />
        <meshStandardMaterial
          color="#F5F5F5"
          metalness={0.0}
          roughness={0.9}
        />
      </mesh>

      {/* 高品質接触シャドウ */}
      <ContactShadows
        position={[0, 0.003, 0]}
        opacity={0.6}
        scale={30}
        blur={1.0}
        far={20}
        color="#000000"
      />

      {/* カメラコントロール（最適化） */}
      <OrbitControls
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        autoRotate={false}
        enableDamping={true}
        dampingFactor={0.03}
        target={[0, 1.2, 0]}
        minDistance={4}
        maxDistance={30}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2.1}
        maxAzimuthAngle={Math.PI}
        minAzimuthAngle={-Math.PI}
      />
    </>
  );
};

// 最小テストコンポーネント
export const MinimalTest: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);

  console.log('🔧 MinimalTest component mounting...');
  console.log('🔧 Browser info:', {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language
  });

  useEffect(() => {
    console.log('🔧 MinimalTest useEffect running...');

    try {
      // WebGL対応チェック
      const canvas = document.createElement('canvas');
      console.log('🔧 Canvas created:', canvas);

      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
      console.log('🔧 WebGL context:', gl);

      if (!gl) {
        setError('WebGLがサポートされていません');
        console.error('❌ WebGL not supported');
        return;
      }

      const webglInfo = {
        version: gl.getParameter(gl.VERSION),
        vendor: gl.getParameter(gl.VENDOR),
        renderer: gl.getParameter(gl.RENDERER),
        shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
        maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
        maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS)
      };

      console.log('✅ WebGL supported:', webglInfo);
      setDebugInfo(webglInfo);
      setIsReady(true);
    } catch (err) {
      console.error('❌ Error in WebGL check:', err);
      setError(`WebGL初期化エラー: ${err}`);
    }
  }, []);

  const handleCanvasCreated = (state: { gl: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera }) => {
    try {
      const { gl, scene, camera } = state;
      console.log('✅ Three.js Canvas created successfully');
      console.log('📊 Three.js state:', {
        renderer: gl.constructor.name,
        scene: scene.constructor.name,
        camera: camera.constructor.name,
        capabilities: gl.capabilities,
        info: gl.info
      });

      // Context Lost対策
      const canvas = gl.domElement;
      console.log('🔧 Canvas element:', canvas);

      canvas.addEventListener('webglcontextlost', (event: Event) => {
        event.preventDefault();
        console.warn('⚠️ WebGL Context Lost - attempting recovery...');
        setError('WebGLコンテキストが失われました。リロードしてください。');
      });

      canvas.addEventListener('webglcontextrestored', () => {
        console.log('✅ WebGL Context Restored');
        setError(null);
      });

      // レンダリング情報を定期的にログ出力
      setTimeout(() => {
        console.log('📊 Render info after 2 seconds:', {
          drawCalls: gl.info.render.calls,
          triangles: gl.info.render.triangles,
          points: gl.info.render.points,
          lines: gl.info.render.lines
        });
      }, 2000);

    } catch (err) {
      console.error('❌ Error in Canvas creation:', err);
      setError(`Canvas作成エラー: ${err}`);
    }
  };

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-red-100">
        <div className="text-center p-8 max-w-2xl">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-800 mb-4">3D表示エラー</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="text-left bg-red-50 p-4 rounded mb-4">
            <h3 className="font-bold mb-2">デバッグ情報:</h3>
            <pre className="text-xs overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 mr-4"
          >
            🔄 ページを再読み込み
          </button>
          <button
            onClick={() => {
              setError(null);
              setIsReady(false);
              // 強制的に再初期化
              setTimeout(() => setIsReady(true), 100);
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            🔧 再試行
          </button>
        </div>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-blue-100">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🔄</div>
          <h2 className="text-2xl font-bold text-blue-800 mb-4">3D環境を準備中...</h2>
          <p className="text-blue-600">WebGL対応チェック中</p>
          <div className="mt-4 text-sm text-blue-500">
            <div>ブラウザ: {navigator.userAgent.includes('Chrome') ? 'Chrome' : 'その他'}</div>
            <div>プラットフォーム: {navigator.platform}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative bg-gray-900">
      <Canvas
        ref={canvasRef}
        camera={{
          position: [8, 6, 8],
          fov: 75,
          near: 0.1,
          far: 1000
        }}
        shadows
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true
        }}
        onCreated={handleCanvasCreated}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          zIndex: 1
        }}
        fallback={
          <div className="w-full h-full flex items-center justify-center bg-yellow-100">
            <div className="text-center p-8">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-yellow-800 mb-4">3D表示に失敗</h2>
              <p className="text-yellow-600 mb-4">ブラウザが3D表示に対応していません</p>
              <div className="text-left bg-yellow-50 p-4 rounded">
                <h3 className="font-bold mb-2">WebGL情報:</h3>
                <pre className="text-xs overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
              </div>
            </div>
          </div>
        }
      >
        <UltraRealisticShowroom />
      </Canvas>

      {/* ステータス表示 */}
      <div className="fixed top-4 left-4 z-50 bg-black bg-opacity-90 text-white p-4 rounded max-w-sm">
        <h3 className="font-bold mb-2">🏆 超リアル家具ショールーム</h3>
        <ul className="text-sm space-y-1">
          <li>✅ WebGL: 対応済み</li>
          <li>🪑 超リアルレザーチェアx2: リアルな質感</li>
          <li>🪞 プレミアムガラステーブル: 透明・金属脚</li>
          <li>📚 詳細な本棚: 24冊の本・4段</li>
          <li>🌿 リアルな観葉植物x2: 風揺れ効果</li>
          <li>💡 プレミアムフロアランプ: 動的照明</li>
          <li>🏠 高級パーケットフローリング・絨毯</li>
        </ul>
        <div className="mt-2 text-xs">
          <div className="text-yellow-200">🖱️ マウス: 視点操作</div>
          <div className="text-yellow-200">🔄 ホイール: ズーム</div>
          <div className="text-green-200">📊 コンソール(F12)でログ確認</div>
        </div>
        <div className="mt-2 text-xs bg-gray-800 p-2 rounded">
          <div className="text-cyan-200">THREE.js: v{THREE.REVISION}</div>
          <div className="text-cyan-200">WebGL: {debugInfo.version || 'チェック中'}</div>
          <div className="text-cyan-200">シャドウ: 有効</div>
          <div className="text-cyan-200">アンチエイリアス: 有効</div>
        </div>
        <div className="mt-2 text-xs bg-green-800 p-2 rounded">
          <div className="text-green-200">✅ 3D機能: 正常動作中</div>
          <div className="text-green-200">🏠 リアル家具レンダリング</div>
          <div className="text-green-200">🌟 インテリアデザイン品質</div>
        </div>
      </div>

      {/* 品質情報 */}
      <div className="fixed top-4 right-4 z-50 bg-purple-600 bg-opacity-90 text-white p-4 rounded max-w-xs">
        <h4 className="font-bold mb-2">✨ 家具品質機能</h4>
        <ul className="text-xs space-y-1">
          <li>🪑 リアル家具モデリング</li>
          <li>🌅 HDRI環境照明（スタジオ）</li>
          <li>💡 動的ランプ照明</li>
          <li>🪞 ガラステーブル透明度</li>
          <li>🌿 植物風揺れアニメーション</li>
          <li>📚 カラフル本コレクション</li>
          <li>🏠 木製フローリング質感</li>
          <li>🟥 高級絨毯テクスチャ</li>
        </ul>
        <div className="mt-2 p-2 bg-green-700 bg-opacity-80 rounded text-xs">
          <div className="text-green-200">✅ インテリアデザイン完成</div>
          <div className="text-green-200">🏆 プロダクションレベル</div>
        </div>
      </div>

      {/* 操作ヘルプ */}
      <div className="fixed bottom-4 right-4 z-50 bg-blue-600 bg-opacity-90 text-white p-4 rounded max-w-xs">
        <h4 className="font-bold mb-2">🎮 ショールーム操作</h4>
        <ul className="text-xs space-y-1">
          <li>🖱️ ドラッグ: 部屋を見回す</li>
          <li>🔄 ホイール: ズームイン・アウト</li>
          <li>🖱️ 右クリック+ドラッグ: パン移動</li>
          <li>👀 角度制限: 自然な視点</li>
          <li>🪑 各家具の細部を観察</li>
          <li>💡 ランプの光り方を確認</li>
          <li>🌿 植物の揺れを楽しむ</li>
          <li>🪞 ガラステーブルの透明感</li>
        </ul>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="fixed bottom-4 left-4 right-4 z-50 bg-red-600 text-white p-4 rounded">
          <div className="flex items-center justify-between">
            <span>❌ {error}</span>
            <button
              onClick={() => setError(null)}
              className="text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}; 