import React, { useState, useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface TouchInteractionProps {
  onObjectTouch?: (object: any, position: { x: number; y: number }) => void;
}

interface ObjectInfo {
  name: string;
  description: string;
  type: string;
  position: { x: number; y: number };
}

export const TouchInteraction: React.FC<TouchInteractionProps> = ({ onObjectTouch }) => {
  const { camera, scene, gl } = useThree();
  const [selectedObject, setSelectedObject] = useState<ObjectInfo | null>(null);
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 });
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  const getObjectInfo = (object: THREE.Object3D): ObjectInfo | null => {
    // オブジェクトの種類に応じて情報を返す
    if (object.userData.type) {
      return {
        name: object.userData.name || 'Unknown Object',
        description: object.userData.description || 'No description available',
        type: object.userData.type,
        position: touchPosition
      };
    }

    // デフォルトの情報を推測
    if (object.type === 'Mesh') {
      const mesh = object as THREE.Mesh;
      if (mesh.geometry.type === 'SphereGeometry') {
        return {
          name: '球体オブジェクト',
          description: '3D空間内の球体です。インタラクティブな要素かもしれません。',
          type: 'sphere',
          position: touchPosition
        };
      } else if (mesh.geometry.type === 'BoxGeometry') {
        return {
          name: '立方体オブジェクト',
          description: '3D空間内の立方体です。建物や装飾品の可能性があります。',
          type: 'box',
          position: touchPosition
        };
      } else if (mesh.geometry.type === 'PlaneGeometry') {
        return {
          name: '平面',
          description: '床や壁などの平面です。',
          type: 'plane',
          position: touchPosition
        };
      }
    }

    return {
      name: object.name || '3Dオブジェクト',
      description: `${object.type}タイプのオブジェクトです。`,
      type: object.type.toLowerCase(),
      position: touchPosition
    };
  };

  const handleTouch = (event: TouchEvent) => {
    event.preventDefault();

    if (event.touches.length === 1) {
      const touch = event.touches[0];
      const rect = gl.domElement.getBoundingClientRect();

      // タッチ位置を正規化座標に変換
      mouse.current.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;

      // レイキャスティング
      raycaster.current.setFromCamera(mouse.current, camera);
      const intersects = raycaster.current.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        const objectInfo = getObjectInfo(intersectedObject);

        if (objectInfo) {
          setTouchPosition({
            x: touch.clientX,
            y: touch.clientY
          });
          setSelectedObject(objectInfo);

          if (onObjectTouch) {
            onObjectTouch(intersectedObject, { x: touch.clientX, y: touch.clientY });
          }
        }
      } else {
        setSelectedObject(null);
      }
    }
  };

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('touchstart', handleTouch, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouch);
    };
  }, [gl.domElement, camera, scene]);

  return (
    <>
      {selectedObject && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: `${Math.min(selectedObject.position.x, window.innerWidth - 250)}px`,
            top: `${Math.max(selectedObject.position.y - 100, 10)}px`,
          }}
        >
          <div className="bg-black bg-opacity-80 backdrop-blur-sm text-white p-4 rounded-lg shadow-lg max-w-xs">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg">{selectedObject.name}</h3>
              <button
                className="text-gray-400 hover:text-white pointer-events-auto"
                onClick={() => setSelectedObject(null)}
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-300 mb-2">{selectedObject.description}</p>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-blue-500 bg-opacity-50 rounded text-xs">
                {selectedObject.type}
              </span>
              <span className="text-xs text-gray-400">
                タッチして詳細表示
              </span>
            </div>
          </div>

          {/* 矢印 */}
          <div
            className="absolute w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-black border-opacity-80"
            style={{
              left: '20px',
              top: '100%'
            }}
          />
        </div>
      )}

      {/* タッチ操作のヒント */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
        <div className="bg-black bg-opacity-50 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm">
          💡 オブジェクトをタッチして詳細を表示
        </div>
      </div>
    </>
  );
}; 