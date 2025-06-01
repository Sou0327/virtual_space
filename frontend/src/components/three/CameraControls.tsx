import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface CameraControlsProps {
  viewMode: 'creator' | 'visitor';
  disabled?: boolean;
}

const CameraControls: React.FC<CameraControlsProps> = ({ viewMode, disabled = false }) => {
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>();

  useEffect(() => {
    // 視点モードに応じてカメラ位置を設定
    if (viewMode === 'creator') {
      camera.position.set(0, 8, 8); // 俯瞰視点
    } else {
      camera.position.set(0, 1.6, 5); // 人間視点
    }
  }, [camera, viewMode]);

  // キーボード移動を完全に直線的に（フレーム毎の処理で滑らか）
  useEffect(() => {
    if (disabled) return;

    const keys = {
      w: false, a: false, s: false, d: false,
      q: false, e: false, r: false, f: false,
      shift: false, arrowUp: false, arrowDown: false,
      arrowLeft: false, arrowRight: false
    };

    const moveSpeed = 0.08; // 移動スピードを大幅に下げて細かい制御を可能に

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW': keys.w = true; break;
        case 'KeyA': keys.a = true; break;
        case 'KeyS': keys.s = true; break;
        case 'KeyD': keys.d = true; break;
        case 'KeyQ': keys.q = true; break;
        case 'KeyE': keys.e = true; break;
        case 'KeyR': keys.r = true; break;
        case 'KeyF': keys.f = true; break;
        case 'ShiftLeft': case 'ShiftRight': keys.shift = true; break;
        case 'ArrowUp': keys.arrowUp = true; break;
        case 'ArrowDown': keys.arrowDown = true; break;
        case 'ArrowLeft': keys.arrowLeft = true; break;
        case 'ArrowRight': keys.arrowRight = true; break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW': keys.w = false; break;
        case 'KeyA': keys.a = false; break;
        case 'KeyS': keys.s = false; break;
        case 'KeyD': keys.d = false; break;
        case 'KeyQ': keys.q = false; break;
        case 'KeyE': keys.e = false; break;
        case 'KeyR': keys.r = false; break;
        case 'KeyF': keys.f = false; break;
        case 'ShiftLeft': case 'ShiftRight': keys.shift = false; break;
        case 'ArrowUp': keys.arrowUp = false; break;
        case 'ArrowDown': keys.arrowDown = false; break;
        case 'ArrowLeft': keys.arrowLeft = false; break;
        case 'ArrowRight': keys.arrowRight = false; break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // フレーム毎の滑らかな移動処理
    const moveCamera = () => {
      if (!controlsRef.current) return;

      const controls = controlsRef.current;
      const direction = new THREE.Vector3();
      const right = new THREE.Vector3();

      // カメラの向きベクトルを取得
      camera.getWorldDirection(direction);
      right.crossVectors(camera.up, direction).normalize();

      const currentSpeed = keys.shift ? moveSpeed * 2 : moveSpeed;

      // WASD移動（完全直線・瞬間的）
      if (keys.w) {
        controls.object.position.addScaledVector(direction, currentSpeed);
      }
      if (keys.s) {
        controls.object.position.addScaledVector(direction, -currentSpeed);
      }
      if (keys.a) {
        controls.object.position.addScaledVector(right, currentSpeed);
      }
      if (keys.d) {
        controls.object.position.addScaledVector(right, -currentSpeed);
      }

      // QE上下移動
      if (keys.q) {
        controls.object.position.y += currentSpeed;
      }
      if (keys.f) {
        controls.object.position.y -= currentSpeed;
      }

      // 十字キー並行移動（完全直線・瞬間的）
      if (keys.arrowUp) {
        controls.object.position.addScaledVector(direction, currentSpeed);
      }
      if (keys.arrowDown) {
        controls.object.position.addScaledVector(direction, -currentSpeed);
      }
      if (keys.arrowLeft) {
        controls.object.position.addScaledVector(right, currentSpeed);
      }
      if (keys.arrowRight) {
        controls.object.position.addScaledVector(right, -currentSpeed);
      }

      controls.update();
    };

    // useFrameは使わず、requestAnimationFrameで直接制御
    let animationId: number;
    const animate = () => {
      moveCamera();
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationId);
    };
  }, [camera, disabled]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping={true} // ダンピングを有効にして滑らかな動きに
      dampingFactor={0.1} // ダンピングを軽めに設定
      panSpeed={1.0}  // パン速度を下げる
      rotateSpeed={0.8} // 回転速度を下げる
      zoomSpeed={1.0}   // ズーム速度を適度に
      minDistance={1}
      maxDistance={50}
      maxPolarAngle={Math.PI * 0.9}
      enablePan={true}
      enableRotate={true}
      enableZoom={true}
      target={[0, 0, 0]}
    />
  );
};

export default CameraControls; 