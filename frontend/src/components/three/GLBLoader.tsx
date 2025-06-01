import React, { Suspense } from 'react';
import { useGLTF } from '@react-three/drei';

// GLBモデル表示コンポーネント
export const GLBModel: React.FC<{ url: string }> = ({ url }) => {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
};

// GLBローダーコンポーネント（Suspense対応）
export const GLBLoader: React.FC<{ url: string }> = ({ url }) => {
  return (
    <Suspense fallback={<mesh><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="gray" /></mesh>}>
      <GLBModel url={url} />
    </Suspense>
  );
};

export default GLBLoader; 