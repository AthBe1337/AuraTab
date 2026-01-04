import { useState, useEffect } from 'react';

// 定义 Props 接口，允许父组件传入设置
interface ClockProps {
  use24Hour?: boolean;     // 是否使用24小时制
  showSeconds?: boolean;   // 是否显示秒
  fontFamily?: 'sans' | 'serif' | 'mono'; // 字体选择
}

export const Clock = ({ 
  use24Hour = true, 
  showSeconds = false, 
  fontFamily = 'sans' 
}: ClockProps) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 根据 prop 决定字体类名
  const getFontClass = () => {
    switch (fontFamily) {
      case 'serif': return 'font-serif'; // 对应 Tailwind 默认或自定义 serif
      case 'mono': return 'font-mono';   // 对应 JetBrains Mono
      default: return 'font-sans';       // 对应 Roboto/Inter
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: showSeconds ? '2-digit' : undefined,
      hour12: !use24Hour
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
      {/* 这里的 style 是为了让字体切换更明显，确保覆盖 */}
      <h1 className="text-8xl md:text-9xl font-bold tracking-tight" 
          style={{ fontFamily: fontFamily === 'serif' ? '"Lora", serif' : fontFamily === 'mono' ? '"JetBrains Mono", monospace' : '"Roboto", sans-serif' }}>
        {formatTime(time)}
      </h1>
      <p className="text-2xl mt-4 font-light opacity-90">
        {formatDate(time)}
      </p>
    </div>
  );
};