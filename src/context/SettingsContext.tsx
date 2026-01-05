import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface AppSettings {
  theme: 'dark' | 'light';
  clockFormat: '12' | '24';
  fontFamily: 'sans' | 'serif' | 'mono';
  searchEngine: string;
  quickLinks: QuickLink[];
  background: BackgroundSettings;
  weatherApiKey: string; // <--- 新增
  weatherApiHost: string;
}

export interface BackgroundSettings {
  type: 'builtin' | 'custom' | 'local',
  customUrl: string,
  activeLocalId: string, // 新增：存储 IndexedDB 中的图片 ID
  blur: number,
  brightness: number,
  maskColor: string
}

// 1. 定义单个链接的数据结构
export interface QuickLink {
  id: string;
  title: string;
  url: string;
}

// 2. 更新 AppSettings 接口
export interface AppSettings {
  theme: 'dark' | 'light';
  clockFormat: '12' | '24';
  fontFamily: 'sans' | 'serif' | 'mono';
  searchEngine: string;
  quickLinks: QuickLink[];
  background: BackgroundSettings;
}

// 3. 更新默认设置 (给几个常用的作为初始值)
const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  clockFormat: '24',
  fontFamily: 'sans',
  searchEngine: 'google',
  quickLinks: [
    { id: '1', title: 'GitHub', url: 'https://github.com' },
    { id: '2', title: 'YouTube', url: 'https://youtube.com' },
    { id: '3', title: 'Gmail', url: 'https://mail.google.com' },
  ],
  background: {
    type: 'builtin',
    customUrl: 'https://images.unsplash.com/photo-1477346611705-65d1883cee1e?q=80&w=1920&auto=format&fit=crop',
    activeLocalId: '',
    blur: 0,
    brightness: 60,
    maskColor: '#000000',
  },
  weatherApiKey: '',
  weatherApiHost: '' // 你可以根据需要更改这个默认值
};

interface SettingsContextType {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// 3. Provider 组件
export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  // 初始化时从 localStorage 读取，如果没有则用默认值
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('aura-settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  // 监听 settings 变化，自动保存到 localStorage
  useEffect(() => {
    localStorage.setItem('aura-settings', JSON.stringify(settings));
  }, [settings]);

  // 提供一个通用的更新函数
  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
};

// 4. 自定义 Hook，方便组件调用
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within a SettingsProvider');
  return context;
};