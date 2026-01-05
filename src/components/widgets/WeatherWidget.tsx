import { useState, useEffect } from 'react';
import { MapPin, AlertCircle, Settings } from 'lucide-react'; // 引入 Settings 图标
import { getWeatherIcon } from '../../utils/weatherUtils';
import { useSettings } from '../../context/SettingsContext'; // 引入 useSettings

interface WeatherData {
  temp: number;
  iconCode: string;
  text: string;
  city: string;
}

export const WeatherWidget = () => {
  const { settings } = useSettings(); // 获取全局设置
  const apiKey = settings.weatherApiKey; // 获取 Key
  const apiHost = settings.weatherApiHost || 'https://devapi.qweather.com'; // 获取 Host，提供默认值

  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false); // 默认为 false，有了 Key 才开始 load
  const [error, setError] = useState('');

  // 智能滚动组件 (保持不变)
  const CityName = ({ name }: { name: string }) => {
    const isLong = name.length > 9;
    if (!isLong) return <span className="max-w-[80px] truncate">{name}</span>;
    return (
      <div className="w-[80px] overflow-hidden whitespace-nowrap mask-linear-fade">
        <div className="flex w-fit animate-marquee pause-on-hover">
          <span className="mr-6">{name}</span>
          <span className="mr-6">{name}</span>
        </div>
      </div>
    );
  };

  useEffect(() => {
    // 1. 如果没有配置 Key，设置特定的错误状态并停止
    if (!apiKey) {
      setError('No API Key');
      setLoading(false);
      return;
    }

    if (!navigator.geolocation) {
      setError('Not supported');
      return;
    }

    setLoading(true); // 开始加载
    setError('');     // 清除旧错误

    const fetchData = async (pos: GeolocationPosition) => {
      try {
        const lat = pos.coords.latitude.toFixed(2);
        const lon = pos.coords.longitude.toFixed(2);
        const locationStr = `${lon},${lat}`;

        // 使用配置的 apiKey
        const cityRes = await fetch(
          `https://${apiHost}/geo/v2/city/lookup?location=${locationStr}&key=${apiKey}`
        );
        const cityJson = await cityRes.json();
        
        if (cityJson.code !== '200') {
           // 处理 Key 无效的情况
           if(cityJson.code === '401' || cityJson.code === '403') throw new Error('Invalid Key');
           throw new Error('Geo API Error');
        }
        const cityName = cityJson.location?.[0]?.name || 'Unknown';

        const weatherRes = await fetch(
          `https://${apiHost}/v7/weather/now?location=${locationStr}&key=${apiKey}`
        );
        const weatherJson = await weatherRes.json();

        if (weatherJson.code !== '200') throw new Error('Weather API Error');

        setData({
          temp: parseInt(weatherJson.now.temp),
          iconCode: weatherJson.now.icon,
          text: weatherJson.now.text,
          city: cityName,
        });
        setLoading(false);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'API Error');
        setLoading(false);
      }
    };

    navigator.geolocation.getCurrentPosition(
      fetchData,
      () => {
        setError('Loc Denied');
        setLoading(false);
      }
    );
  }, [apiKey]); // 关键：当 apiKey 变化时重新执行 useEffect

  // --- 错误/未配置状态渲染 ---
  if (error) {
    return (
      <div className="absolute top-6 right-6 z-30 group animate-fade-in">
        {/* 这里做了一个交互优化：如果没有 Key，图标变成设置齿轮，提示用户去配置 */}
        <div className={`w-10 h-10 flex items-center justify-center rounded-full backdrop-blur-md border transition-colors cursor-help
          ${error === 'No API Key' 
            ? 'bg-blue-500/20 border-blue-500/30 text-blue-200 hover:bg-blue-500/40' 
            : 'bg-black/20 border-white/10 text-white/50 hover:bg-red-500/20 hover:text-red-200'
          }`}
        >
          {error === 'No API Key' ? <Settings size={18} /> : <AlertCircle size={18} />}
        </div>
        
        {/* Hover 提示文字 */}
        <div className="absolute top-12 right-0 w-max px-3 py-1 bg-black/80 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10 shadow-xl">
          {error === 'No API Key' ? 'Setup Weather Key' : error}
        </div>
      </div>
    );
  }

  // --- 加载状态 (骨架屏) ---
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

  if (!data) return null;

  return (
    <div className="absolute top-6 right-6 z-30 animate-fade-in">
      {/* 正常的渲染逻辑保持不变 */}
      <div className="flex items-center gap-4 px-5 py-3 
                      bg-black/20 hover:bg-black/30 
                      backdrop-blur-xl 
                      border border-white/10 
                      rounded-full shadow-2xl 
                      transition-all duration-300 group select-none">
        
        <div className="flex items-center gap-3 pr-4 border-r border-white/10">
          <div className="transition-transform group-hover:scale-110 duration-300">
            {getWeatherIcon(data.iconCode)}
          </div>
          <span className="text-2xl font-bold text-white tracking-tighter drop-shadow-md">
            {data.temp}°
          </span>
        </div>

        <div className="flex flex-col items-start gap-0.5 min-w-[60px]">
          <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-white/50 font-bold overflow-hidden h-4">
            <MapPin size={10} className="shrink-0" />
            <CityName name={data.city} />
          </div>
          <span className="text-xs text-white/90 font-medium">
            {data.text}
          </span>
        </div>

      </div>
    </div>
  );
};