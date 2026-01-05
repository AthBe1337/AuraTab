import { 
  Sun, 
  CloudSun, 
  Cloud, 
  CloudRain, 
  CloudLightning, 
  Snowflake, 
  CloudFog, 
  Moon,
  Wind
} from 'lucide-react';

// 和风天气代码映射
// https://dev.qweather.com/docs/resource/icons/
export const getWeatherIcon = (code: string) => {
  const c = parseInt(code);
  const props = { size: 20, className: "text-white drop-shadow-md" };

  // 100: 晴
  if (c === 100 || c === 150) {
    return <Sun {...props} className="text-yellow-400 drop-shadow-md" />;
  }
  // 150: 晴 (夜晚) - 和风通常用 150 表示夜晚晴，但有时也混用
  if (c === 150 || c === 153) {
    return <Moon {...props} />;
  }

  // 101-104: 多云/阴
  if (c >= 101 && c <= 104) {
    return <CloudSun {...props} />; // 或者根据日夜判断，这里简化
  }
  
  // 300-399: 雨
  if (c >= 300 && c <= 399) {
    return <CloudRain {...props} />;
  }

  // 400-499: 雪
  if (c >= 400 && c <= 499) {
    return <Snowflake {...props} />;
  }

  // 500-515: 雾/霾
  if (c >= 500 && c <= 515) {
    return <CloudFog {...props} />;
  }

  // 200-213: 风/飓风
  if (c >= 200 && c <= 213) {
    return <Wind {...props} />;
  }

  // 雷阵雨
  if (c === 302 || c === 303 || c === 304) {
    return <CloudLightning {...props} />;
  }

  return <Cloud {...props} />; // 默认
};