// モバイルデバイス検出ユーティリティ

export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) || window.innerWidth <= 768;
};

export const isTablet = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return /iPad|Android/i.test(navigator.userAgent) && window.innerWidth > 768 && window.innerWidth <= 1024;
};

export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore
    navigator.msMaxTouchPoints > 0
  );
};

export const getViewportSize = () => {
  if (typeof window === 'undefined') return { width: 1920, height: 1080 };
  
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
};

export const isLandscape = (): boolean => {
  if (typeof window === 'undefined') return true;
  
  return window.innerWidth > window.innerHeight;
};

export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (isMobile()) return 'mobile';
  if (isTablet()) return 'tablet';
  return 'desktop';
}; 