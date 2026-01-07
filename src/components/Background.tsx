import { useEffect, useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { bgDB } from '../utils/db';

export const Background = () => {
  const { settings } = useSettings();
  const { type, customUrl, activeLocalId, blur, brightness, maskColor } = settings.background;
  const [localUrl, setLocalUrl] = useState<string>('');

  // 当 ID 变化时，从 IndexedDB 加载图片
  useEffect(() => {
    if (type === 'local' && activeLocalId) {
      bgDB.getById(activeLocalId).then(record => {
        if (record) {
          const url = URL.createObjectURL(record.file);
          setLocalUrl(url);
          // 记得在下次 URL 变化前释放内存
          return () => URL.revokeObjectURL(url);
        }
      });
    }
  }, [type, activeLocalId]);

  const getBackgroundImage = () => {
    switch (type) {
      case 'local':
        return localUrl ? `url(${localUrl})` : 'none';
      case 'custom':
        return `url(${customUrl})`;
      case 'builtin':
      default:
        return 'url(https://bing.biturl.top/?resolution=1920&format=image&index=0&mkt=zh-CN)';
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full -z-50 bg-black">
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-700 ease-in-out"
        style={{
          backgroundImage: getBackgroundImage(),
          filter: `blur(${blur}px)`,
          transform: 'scale(1.05)'
        }}
      />
      <div 
        className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-300"
        style={{
          backgroundColor: maskColor || '#000000',
          opacity: (100 - brightness) / 100
        }}
      />
    </div>
  );
};