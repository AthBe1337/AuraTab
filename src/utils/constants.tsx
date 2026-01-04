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
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 35 50" fill="#fff">
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