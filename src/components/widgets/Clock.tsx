import { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';

export const Clock = () => {
  const { settings } = useSettings(); // 获取全局设置
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 根据 settings.fontFamily 获取类名
  const getFontClass = () => {
    switch (settings.fontFamily) {
      case 'serif': return 'font-serif';
      case 'mono': return 'font-mono';
      default: return 'font-sans';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: settings.clockFormat === '12' // 使用全局设置
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  return (
    <div className={`flex flex-col items-center select-none text-white drop-shadow-lg transition-all duration-300 ${getFontClass()}`}>
      <h1 className="text-8xl md:text-9xl font-bold tracking-tight"
          style={{ fontFamily: settings.fontFamily === 'serif' ? '"Lora", serif' : settings.fontFamily === 'mono' ? '"JetBrains Mono", monospace' : '"Roboto", sans-serif' }}>
        {formatTime(time)}
      </h1>
      <p className="text-2xl mt-4 font-light opacity-90">
        {formatDate(time)}
      </p>
    </div>
  );
};