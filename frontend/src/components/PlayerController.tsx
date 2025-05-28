import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface PlayerControllerProps {
  position: [number, number, number];
  onMove: (position: [number, number, number]) => void;
  onRotate?: (rotation: [number, number, number]) => void;
  speed?: number;
  jumpHeight?: number;
  viewMode: 'first-person' | 'third-person';
  // モバイル用の入力
  virtualMoveInput?: { x: number; y: number };
  virtualLookInput?: { x: number; y: number };
}

export const PlayerController: React.FC<PlayerControllerProps> = ({
  position,
  onMove,
  onRotate,
  speed = 5,
  jumpHeight = 8,
  viewMode,
  virtualMoveInput = { x: 0, y: 0 },
  virtualLookInput = { x: 0, y: 0 }
}) => {
  const { camera, gl } = useThree();
  const [keys, setKeys] = useState({
    w: false,
    a: false,
    s: false,
    d: false,
    space: false,
    shift: false
  });

  const [isJumping, setIsJumping] = useState(false);
  const [velocity, setVelocity] = useState(new THREE.Vector3(0, 0, 0));
  const [mouseMovement, setMouseMovement] = useState({ x: 0, y: 0 });
  const [isPointerLocked, setIsPointerLocked] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const playerPosition = useRef(new THREE.Vector3(...position));
  const playerRotation = useRef(new THREE.Euler(0, 0, 0));
  const moveVector = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());

  // モバイル検出
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      const isMobileDevice = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsMobile(isMobileDevice || isTouchDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // キーボードイベントの処理
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      switch (key) {
        case 'w':
          setKeys(prev => ({ ...prev, w: true }));
          break;
        case 'a':
          setKeys(prev => ({ ...prev, a: true }));
          break;
        case 's':
          setKeys(prev => ({ ...prev, s: true }));
          break;
        case 'd':
          setKeys(prev => ({ ...prev, d: true }));
          break;
        case ' ':
          event.preventDefault();
          setKeys(prev => ({ ...prev, space: true }));
          break;
        case 'shift':
          setKeys(prev => ({ ...prev, shift: true }));
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      switch (key) {
        case 'w':
          setKeys(prev => ({ ...prev, w: false }));
          break;
        case 'a':
          setKeys(prev => ({ ...prev, a: false }));
          break;
        case 's':
          setKeys(prev => ({ ...prev, s: false }));
          break;
        case 'd':
          setKeys(prev => ({ ...prev, d: false }));
          break;
        case ' ':
          setKeys(prev => ({ ...prev, space: false }));
          break;
        case 'shift':
          setKeys(prev => ({ ...prev, shift: false }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // マウスイベントの処理（デスクトップ用）
  useEffect(() => {
    if (isMobile || viewMode !== 'first-person') return;

    const handleMouseMove = (event: MouseEvent) => {
      if (!isPointerLocked) return;

      const sensitivity = 0.002;
      setMouseMovement({
        x: event.movementX * sensitivity,
        y: event.movementY * sensitivity
      });
    };

    const handleClick = () => {
      if (viewMode === 'first-person' && !isMobile) {
        gl.domElement.requestPointerLock();
      }
    };

    const handlePointerLockChange = () => {
      setIsPointerLocked(document.pointerLockElement === gl.domElement);
    };

    gl.domElement.addEventListener('click', handleClick);
    gl.domElement.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('pointerlockchange', handlePointerLockChange);

    return () => {
      gl.domElement.removeEventListener('click', handleClick);
      gl.domElement.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
    };
  }, [viewMode, isPointerLocked, gl.domElement, isMobile]);

  // フレームごとの更新
  useFrame((state, delta) => {
    const currentSpeed = keys.shift ? speed * 2 : speed; // Shiftで走る

    // 視点回転の処理
    if (viewMode === 'first-person') {
      if (isMobile) {
        // モバイル：バーチャルジョイスティック
        const lookSensitivity = 2.0;
        playerRotation.current.y -= virtualLookInput.x * lookSensitivity * delta;
        playerRotation.current.x -= virtualLookInput.y * lookSensitivity * delta;
      } else if (isPointerLocked) {
        // デスクトップ：マウス
        playerRotation.current.y -= mouseMovement.x;
        playerRotation.current.x -= mouseMovement.y;
        setMouseMovement({ x: 0, y: 0 });
      }

      // 上下の視点制限
      playerRotation.current.x = Math.max(
        -Math.PI / 2,
        Math.min(Math.PI / 2, playerRotation.current.x)
      );
    }

    // 移動ベクトルの計算
    moveVector.current.set(0, 0, 0);

    if (isMobile) {
      // モバイル：バーチャルジョイスティック
      moveVector.current.x = virtualMoveInput.x;
      moveVector.current.z = virtualMoveInput.y;
    } else {
      // デスクトップ：キーボード
      if (keys.w) moveVector.current.z -= 1;
      if (keys.s) moveVector.current.z += 1;
      if (keys.a) moveVector.current.x -= 1;
      if (keys.d) moveVector.current.x += 1;
    }

    // 移動ベクトルを正規化
    if (moveVector.current.length() > 0) {
      moveVector.current.normalize();

      // プレイヤーの向きに応じて移動方向を調整
      if (viewMode === 'first-person') {
        moveVector.current.applyEuler(new THREE.Euler(0, playerRotation.current.y, 0));
      }

      // 速度を適用
      moveVector.current.multiplyScalar(currentSpeed * delta);

      // 位置を更新
      playerPosition.current.add(moveVector.current);
    }

    // ジャンプの処理
    if (keys.space && !isJumping && playerPosition.current.y <= 0.1) {
      setVelocity(new THREE.Vector3(0, jumpHeight, 0));
      setIsJumping(true);
    }

    // 重力とジャンプの物理演算
    if (isJumping || playerPosition.current.y > 0) {
      const gravity = -25;
      velocity.y += gravity * delta;
      playerPosition.current.y += velocity.y * delta;

      // 地面に着地
      if (playerPosition.current.y <= 0) {
        playerPosition.current.y = 0;
        setVelocity(new THREE.Vector3(0, 0, 0));
        setIsJumping(false);
      }
    }

    // 境界制限（モバイルでは広めに）
    const boundary = isMobile ? 40 : 20;
    playerPosition.current.x = Math.max(-boundary, Math.min(boundary, playerPosition.current.x));
    playerPosition.current.z = Math.max(-boundary, Math.min(boundary, playerPosition.current.z));

    // カメラ位置の更新
    if (viewMode === 'first-person') {
      camera.position.copy(playerPosition.current);
      camera.position.y += 1.6; // 目の高さ
      camera.rotation.copy(playerRotation.current);
    } else {
      // 3人称視点の場合、プレイヤーの後ろ上方にカメラを配置
      const offset = new THREE.Vector3(0, 8, 15);
      offset.applyEuler(new THREE.Euler(0, playerRotation.current.y, 0));
      camera.position.copy(playerPosition.current).add(offset);
      camera.lookAt(playerPosition.current.x, playerPosition.current.y + 1, playerPosition.current.z);
    }

    // 位置の変更を親コンポーネントに通知
    onMove([playerPosition.current.x, playerPosition.current.y, playerPosition.current.z]);

    if (onRotate) {
      onRotate([playerRotation.current.x, playerRotation.current.y, playerRotation.current.z]);
    }
  });

  return null;
}; 