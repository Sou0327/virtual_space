import React, { useRef, useEffect, useState, useCallback } from 'react';

interface VirtualJoystickProps {
  onMove?: (x: number, y: number) => void;
  onLook?: (x: number, y: number) => void;
  size?: number;
  deadZone?: number;
}

interface JoystickState {
  x: number;
  y: number;
  active: boolean;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({
  onMove,
  onLook,
  size = 120,
  deadZone = 0.1
}) => {
  const moveJoystickRef = useRef<HTMLDivElement>(null);
  const lookJoystickRef = useRef<HTMLDivElement>(null);
  const moveKnobRef = useRef<HTMLDivElement>(null);
  const lookKnobRef = useRef<HTMLDivElement>(null);

  const [moveState, setMoveState] = useState<JoystickState>({ x: 0, y: 0, active: false });
  const [lookState, setLookState] = useState<JoystickState>({ x: 0, y: 0, active: false });

  const activeTouchesRef = useRef<Map<number, 'move' | 'look'>>(new Map());

  const updateJoystick = useCallback((
    element: HTMLDivElement,
    knob: HTMLDivElement,
    clientX: number,
    clientY: number,
    callback?: (x: number, y: number) => void
  ) => {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = size / 2 - 10;

    let normalizedX = deltaX / maxDistance;
    let normalizedY = deltaY / maxDistance;

    if (distance > maxDistance) {
      normalizedX = (deltaX / distance) * 1;
      normalizedY = (deltaY / distance) * 1;
    }

    // デッドゾーンの適用
    const magnitude = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);
    if (magnitude < deadZone) {
      normalizedX = 0;
      normalizedY = 0;
    }

    // ノブの位置を更新
    const knobX = Math.max(-maxDistance, Math.min(maxDistance, deltaX));
    const knobY = Math.max(-maxDistance, Math.min(maxDistance, deltaY));
    knob.style.transform = `translate(${knobX}px, ${knobY}px)`;

    // コールバックを呼び出し
    if (callback) {
      callback(normalizedX, -normalizedY); // Y軸を反転
    }

    return { x: normalizedX, y: -normalizedY };
  }, [size, deadZone]);

  const resetJoystick = useCallback((knob: HTMLDivElement) => {
    knob.style.transform = 'translate(0px, 0px)';
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    e.preventDefault();

    Array.from(e.changedTouches).forEach(touch => {
      const element = document.elementFromPoint(touch.clientX, touch.clientY);

      if (moveJoystickRef.current?.contains(element as Node)) {
        activeTouchesRef.current.set(touch.identifier, 'move');
        setMoveState(prev => ({ ...prev, active: true }));

        if (moveJoystickRef.current && moveKnobRef.current) {
          updateJoystick(
            moveJoystickRef.current,
            moveKnobRef.current,
            touch.clientX,
            touch.clientY,
            onMove
          );
        }
      } else if (lookJoystickRef.current?.contains(element as Node)) {
        activeTouchesRef.current.set(touch.identifier, 'look');
        setLookState(prev => ({ ...prev, active: true }));

        if (lookJoystickRef.current && lookKnobRef.current) {
          updateJoystick(
            lookJoystickRef.current,
            lookKnobRef.current,
            touch.clientX,
            touch.clientY,
            onLook
          );
        }
      }
    });
  }, [updateJoystick, onMove, onLook]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();

    Array.from(e.changedTouches).forEach(touch => {
      const touchType = activeTouchesRef.current.get(touch.identifier);

      if (touchType === 'move' && moveJoystickRef.current && moveKnobRef.current) {
        const result = updateJoystick(
          moveJoystickRef.current,
          moveKnobRef.current,
          touch.clientX,
          touch.clientY,
          onMove
        );
        setMoveState(prev => ({ ...prev, x: result.x, y: result.y }));
      } else if (touchType === 'look' && lookJoystickRef.current && lookKnobRef.current) {
        const result = updateJoystick(
          lookJoystickRef.current,
          lookKnobRef.current,
          touch.clientX,
          touch.clientY,
          onLook
        );
        setLookState(prev => ({ ...prev, x: result.x, y: result.y }));
      }
    });
  }, [updateJoystick, onMove, onLook]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    e.preventDefault();

    Array.from(e.changedTouches).forEach(touch => {
      const touchType = activeTouchesRef.current.get(touch.identifier);

      if (touchType === 'move') {
        activeTouchesRef.current.delete(touch.identifier);
        setMoveState({ x: 0, y: 0, active: false });
        if (moveKnobRef.current) {
          resetJoystick(moveKnobRef.current);
        }
        if (onMove) onMove(0, 0);
      } else if (touchType === 'look') {
        activeTouchesRef.current.delete(touch.identifier);
        setLookState({ x: 0, y: 0, active: false });
        if (lookKnobRef.current) {
          resetJoystick(lookKnobRef.current);
        }
        if (onLook) onLook(0, 0);
      }
    });
  }, [resetJoystick, onMove, onLook]);

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const joystickStyle = {
    width: `${size}px`,
    height: `${size}px`,
  };

  const knobStyle = {
    width: '40px',
    height: '40px',
  };

  return (
    <>
      {/* 移動用ジョイスティック（左下） */}
      <div className="fixed bottom-4 left-4 z-50 pointer-events-auto">
        <div
          ref={moveJoystickRef}
          className={`relative rounded-full border-4 border-white bg-black bg-opacity-30 backdrop-blur-sm transition-all duration-200 ${moveState.active ? 'border-green-400 bg-opacity-50' : 'border-gray-400'
            }`}
          style={joystickStyle}
        >
          <div
            ref={moveKnobRef}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-100 ${moveState.active ? 'bg-green-400' : 'bg-white'
              }`}
            style={knobStyle}
          />
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-white text-xs font-semibold">
            移動
          </div>
        </div>
      </div>

      {/* カメラ操作用ジョイスティック（右下） */}
      <div className="fixed bottom-4 right-4 z-50 pointer-events-auto">
        <div
          ref={lookJoystickRef}
          className={`relative rounded-full border-4 border-white bg-black bg-opacity-30 backdrop-blur-sm transition-all duration-200 ${lookState.active ? 'border-blue-400 bg-opacity-50' : 'border-gray-400'
            }`}
          style={joystickStyle}
        >
          <div
            ref={lookKnobRef}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-100 ${lookState.active ? 'bg-blue-400' : 'bg-white'
              }`}
            style={knobStyle}
          />
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-white text-xs font-semibold">
            視点
          </div>
        </div>
      </div>

      {/* ジャンプボタン */}
      <div className="fixed bottom-4 right-36 z-50 pointer-events-auto">
        <button
          className="w-16 h-16 rounded-full bg-yellow-500 bg-opacity-80 backdrop-blur-sm border-4 border-white text-white font-bold text-lg hover:bg-yellow-400 active:bg-yellow-600 transition-all duration-200"
          onTouchStart={(e) => {
            e.preventDefault();
            // ジャンプイベントを発火
            const jumpEvent = new KeyboardEvent('keydown', { key: ' ' });
            document.dispatchEvent(jumpEvent);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            const jumpEvent = new KeyboardEvent('keyup', { key: ' ' });
            document.dispatchEvent(jumpEvent);
          }}
        >
          🚀
        </button>
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-white text-xs font-semibold">
          ジャンプ
        </div>
      </div>
    </>
  );
}; 