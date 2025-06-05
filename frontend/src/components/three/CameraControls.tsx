import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';

interface CameraControlsProps {
  viewMode: 'creator' | 'visitor';
  disabled?: boolean;
  onPointerLockChange?: (isLocked: boolean) => void;
}

const CameraControls: React.FC<CameraControlsProps> = ({ viewMode, disabled = false, onPointerLockChange }) => {
  const { camera } = useThree();
  const orbitControlsRef = useRef<any>();
  const pointerLockControlsRef = useRef<any>();
  const [isLocked, setIsLocked] = useState(false);

  // 移動関連の状態
  const moveState = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    run: false
  });

  const velocity = useRef(new THREE.Vector3());

  useEffect(() => {
    // 視点モードに応じてカメラ位置を設定
    if (viewMode === 'creator') {
      camera.position.set(0, 8, 8); // 俯瞰視点
      if (orbitControlsRef.current) {
        orbitControlsRef.current.target.set(0, 0, 0);
        orbitControlsRef.current.update();
      }
    } else {
      camera.position.set(0, 1.6, 5); // 人間の目の高さ
      camera.lookAt(0, 1.6, 0); // 正面を向く
    }
  }, [camera, viewMode]);

  // PointerLock用のキーイベント処理
  useEffect(() => {
    if (viewMode !== 'visitor' || disabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
          moveState.current.forward = true;
          break;
        case 'KeyS':
          moveState.current.backward = true;
          break;
        case 'KeyA':
          moveState.current.left = true;
          break;
        case 'KeyD':
          moveState.current.right = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          moveState.current.run = true;
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
          moveState.current.forward = false;
          break;
        case 'KeyS':
          moveState.current.backward = false;
          break;
        case 'KeyA':
          moveState.current.left = false;
          break;
        case 'KeyD':
          moveState.current.right = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          moveState.current.run = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [viewMode, disabled]);

  // ビジター歩行フレーム処理
  useFrame((_, delta) => {
    if (viewMode !== 'visitor' || disabled || !isLocked) return;

    const direction = new THREE.Vector3();
    const right = new THREE.Vector3();

    // カメラの向きベクトルを取得
    camera.getWorldDirection(direction);
    direction.y = 0; // Y軸を無効にして水平移動のみ
    direction.normalize();

    right.crossVectors(camera.up, direction).normalize();

    // 移動速度（走る時は2倍）
    const moveSpeed = moveState.current.run ? 6.0 : 3.0;

    // 入力に基づいて速度を計算
    const inputVector = new THREE.Vector3();

    if (moveState.current.forward) inputVector.add(direction);
    if (moveState.current.backward) inputVector.sub(direction);
    if (moveState.current.left) inputVector.add(right);
    if (moveState.current.right) inputVector.sub(right);

    if (inputVector.length() > 0) {
      inputVector.normalize();
      velocity.current.copy(inputVector.multiplyScalar(moveSpeed));
    } else {
      // 摩擦で減速
      velocity.current.multiplyScalar(0.9);
    }

    // カメラ位置を更新
    camera.position.addScaledVector(velocity.current, delta);

    // 床の高さ制限（1.6mの高さを維持）
    camera.position.y = 1.6;

    // 部屋の境界制限
    camera.position.x = Math.max(-9, Math.min(9, camera.position.x));
    camera.position.z = Math.max(-9, Math.min(9, camera.position.z));
  });

  // クリエイター用キーボード移動
  useEffect(() => {
    if (viewMode !== 'creator' || disabled) return;

    const keys = {
      w: false, a: false, s: false, d: false,
      q: false, e: false, r: false, f: false,
      shift: false, arrowUp: false, arrowDown: false,
      arrowLeft: false, arrowRight: false
    };

    const moveSpeed = 0.08;

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

    let animationId: number;
    const animate = () => {
      if (!orbitControlsRef.current) return;

      const controls = orbitControlsRef.current;
      const direction = new THREE.Vector3();
      const right = new THREE.Vector3();

      camera.getWorldDirection(direction);
      right.crossVectors(camera.up, direction).normalize();

      const currentSpeed = keys.shift ? moveSpeed * 2 : moveSpeed;

      if (keys.w) controls.object.position.addScaledVector(direction, currentSpeed);
      if (keys.s) controls.object.position.addScaledVector(direction, -currentSpeed);
      if (keys.a) controls.object.position.addScaledVector(right, currentSpeed);
      if (keys.d) controls.object.position.addScaledVector(right, -currentSpeed);
      if (keys.q) controls.object.position.y += currentSpeed;
      if (keys.f) controls.object.position.y -= currentSpeed;
      if (keys.arrowUp) controls.object.position.addScaledVector(direction, currentSpeed);
      if (keys.arrowDown) controls.object.position.addScaledVector(direction, -currentSpeed);
      if (keys.arrowLeft) controls.object.position.addScaledVector(right, currentSpeed);
      if (keys.arrowRight) controls.object.position.addScaledVector(right, -currentSpeed);

      controls.update();
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationId);
    };
  }, [camera, disabled, viewMode]);

  if (viewMode === 'visitor') {
    return (
      <PointerLockControls
        ref={pointerLockControlsRef}
        onLock={() => {
          setIsLocked(true);
          onPointerLockChange?.(true);
        }}
        onUnlock={() => {
          setIsLocked(false);
          onPointerLockChange?.(false);
        }}
      />
    );
  }

  return (
    <OrbitControls
      ref={orbitControlsRef}
      enableDamping={true}
      dampingFactor={0.1}
      panSpeed={1.0}
      rotateSpeed={0.8}
      zoomSpeed={1.0}
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