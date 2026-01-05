import { ReactNode } from 'react';
import { SiBaidu, SiDuckduckgo } from 'react-icons/si';
import { FcGoogle } from 'react-icons/fc';

// 定义搜索引擎的数据结构
export type SearchEngine = {
  name: string;
  url: string;
  icon: ReactNode;
};

export const SEARCH_ENGINES: Record<string, SearchEngine> = {
  google: {
    name: 'Google',
    url: 'https://www.google.com/search?q=',
    icon: <FcGoogle className="text-xl" />
  },
  bing: {
    name: 'Bing',
    url: 'https://www.bing.com/search?q=',
    icon: (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 35 50" 
        // 1. 修改颜色：从 #fff 改为 #008373 (Bing 品牌色) 或 currentColor
        fill="#008373" 
        // 2. 添加尺寸类：保持与其他图标一致
        className="text-xl h-[1em] w-auto" 
      >
        <path d="M0 0v44.400391L10 50l25-14.382812V24.25l-22.177734-7.761719 4.33789 10.820313 6.923828 3.224609L10 38.642578V3.5z"/>
      </svg>
    )
  },
  baidu: {
    name: 'Baidu',
    url: 'https://www.baidu.com/s?wd=',
    icon: <SiBaidu className="text-xl text-[#2932E1]" />
  },
  duckduckgo: {
    name: 'DuckDuckGo',
    url: 'https://duckduckgo.com/?q=',
    icon: <SiDuckduckgo className="text-xl text-[#DE5833]" />
  }
};

export const BACKGROUND_FILTERS = [
  { id: 'obsidian', name: 'Obsidian', color: '#000000' },       // 纯黑
  { id: 'midnight', name: 'Midnight', color: '#0f172a' },       // 深岩蓝 (Slate 900)
  { id: 'violet',   name: 'Nebula',   color: '#3b0764' },       // 深紫 (Purple 950)
  { id: 'forest',   name: 'Forest',   color: '#052e16' },       // 深绿 (Green 950)
  { id: 'ocean',    name: 'Abyss',    color: '#082f49' },       // 深海蓝 (Sky 950)
  { id: 'wine',     name: 'Wine',     color: '#450a0a' },       // 深酒红 (Red 950)
  { id: 'chocolate',name: 'Coffee',   color: '#431407' },       // 深咖色 (Orange 950)
];