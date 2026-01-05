import { 
  Sun, 
  CloudSun, 
  Cloud, 
  CloudRain, 
  CloudLightning, 
  Snowflake, 
  CloudFog, 
  Moon 
} from 'lucide-react';

// Open-Meteo WMO Weather Codes
// https://open-meteo.com/en/docs
export const getWeatherIcon = (code: number, isDay: boolean = true) => {
  const props = { size: 20, className: "text-white drop-shadow-md" };

  // 0: Clear sky
  if (code === 0) {
    return isDay ? <Sun {...props} className="text-yellow-400 drop-shadow-md" /> : <Moon {...props} />;
  }

  // 1, 2, 3: Mainly clear, partly cloudy, and overcast
  if (code >= 1 && code <= 3) {
    return isDay ? <CloudSun {...props} /> : <Cloud {...props} />;
  }

  // 45, 48: Fog
  if (code === 45 || code === 48) {
    return <CloudFog {...props} />;
  }

  // 51-67: Drizzle & Rain
  if (code >= 51 && code <= 67) {
    return <CloudRain {...props} />;
  }

  // 71-77: Snow
  if (code >= 71 && code <= 77) {
    return <Snowflake {...props} />;
  }

  // 80-82: Rain showers
  if (code >= 80 && code <= 82) {
    return <CloudRain {...props} />;
  }

  // 85-86: Snow showers
  if (code >= 85 && code <= 86) {
    return <Snowflake {...props} />;
  }

  // 95-99: Thunderstorm
  if (code >= 95 && code <= 99) {
    return <CloudLightning {...props} />;
  }

  return <Sun {...props} />;
};

export const getWeatherDesc = (code: number) => {
  const codes: Record<number, string> = {
    0: 'Clear',
    1: 'Mainly Clear',
    2: 'Partly Cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Fog',
    51: 'Drizzle',
    53: 'Drizzle',
    55: 'Drizzle',
    61: 'Rain',
    63: 'Rain',
    65: 'Heavy Rain',
    71: 'Snow',
    73: 'Snow',
    75: 'Heavy Snow',
    95: 'Thunderstorm',
  };
  return codes[code] || 'Unknown';
};