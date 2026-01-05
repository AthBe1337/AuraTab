import { useState, useEffect } from 'react';
import { MapPin, Loader2, AlertCircle } from 'lucide-react';
import { getWeatherIcon, getWeatherDesc } from '../../utils/weatherUtils';

interface WeatherData {
  temp: number;
  code: number;
  isDay: boolean;
  city: string;
}

export const WeatherWidget = () => {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Not supported');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;

          // 1. 获取天气 (Open-Meteo)
          const weatherPromise = fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,is_day`
          ).then(res => res.json());

          // 2. 获取城市名 (BigDataCloud Free API)
          // 这是一个不需要 Key 的免费反向地理编码服务
          const cityPromise = fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          ).then(res => res.json());

          const [weatherData, cityData] = await Promise.all([weatherPromise, cityPromise]);

          setData({
            temp: Math.round(weatherData.current.temperature_2m),
            code: weatherData.current.weather_code,
            isDay: weatherData.current.is_day === 1,
            city: cityData.city || cityData.locality || 'Unknown',
          });
          
          setLoading(false);
        } catch (err) {
          setError('Failed to load');
          setLoading(false);
        }
      },
      (err) => {
        setError('Location denied');
        setLoading(false);
      }
    );
  }, []);

  // 错误状态：只显示一个小图标，不打扰用户
  if (error) {
    return (
      <div className="absolute top-6 right-6 z-30 group">
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white/50 hover:bg-red-500/20 hover:text-red-200 transition-colors cursor-help">
          <AlertCircle size={18} />
        </div>
        {/* Hover 显示具体错误 */}
        <div className="absolute top-12 right-0 w-max px-3 py-1 bg-black/80 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {error}
        </div>
      </div>
    );
  }

  // 加载状态：骨架屏
  if (loading) {
    return (
      <div className="absolute top-6 right-6 z-30 flex items-center gap-3 px-4 py-2 bg-black/20 backdrop-blur-md border border-white/10 rounded-full h-[50px] w-[140px] animate-pulse">
        <div className="w-6 h-6 bg-white/10 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-2 bg-white/10 rounded w-1/2" />
          <div className="h-2 bg-white/10 rounded w-3/4" />
        </div>
      </div>
    );
  }

  const CityName = ({ name }: { name: string }) => {
    // 简单的长度判断，超过 9 个字符视为过长
    const isLong = name.length > 9;

    if (!isLong) {
      return <span className="max-w-[80px] truncate">{name}</span>;
    }

    return (
      // 1. 外层限制宽度，隐藏溢出
      <div className="w-[80px] overflow-hidden whitespace-nowrap mask-linear-fade">
        {/* 2. 内层 flex 容器，包含两份文字 */}
        <div className="flex w-fit animate-marquee pause-on-hover">
          {/* 第一份文字 */}
          <span className="mr-6">{name}</span>
          {/* 第二份文字 (用于无缝衔接) */}
          <span className="mr-6">{name}</span>
        </div>
      </div>
    );
  };

  if (!data) return null;

  return (
    <div className="absolute top-6 right-6 z-30 animate-fade-in">
      <div className="flex items-center gap-4 px-5 py-3 
                      bg-black/20 hover:bg-black/30 
                      backdrop-blur-xl 
                      border border-white/10 
                      rounded-full shadow-2xl 
                      transition-all duration-300 group select-none">
        
        {/* 左侧：天气图标 + 温度 */}
        <div className="flex items-center gap-3 pr-4 border-r border-white/10">
          <div className="transition-transform group-hover:scale-110 duration-300">
            {getWeatherIcon(data.code, data.isDay)}
          </div>
          <span className="text-2xl font-bold text-white tracking-tighter drop-shadow-md">
            {data.temp}°
          </span>
        </div>

        {/* 右侧：城市 + 描述 */}
        <div className="flex flex-col items-start gap-0.5 min-w-[60px]">
          <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-white/50 font-bold overflow-hidden h-4"> {/* 固定高度防止跳动 */}
            <MapPin size={10} className="shrink-0" />
            
            {/* 使用新的 CityName 组件 */}
            <CityName name={data.city} />
            
          </div>
          <span className="text-xs text-white/90 font-medium">
            {getWeatherDesc(data.code)}
          </span>
        </div>

      </div>
    </div>
  );
};