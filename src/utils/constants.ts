// 定义搜索引擎的数据结构
export type SearchEngine = {
  name: string;
  url: string;
  icon: string;
};

export const SEARCH_ENGINES: Record<string, SearchEngine> = {
  google: {
    name: 'Google',
    url: 'https://www.google.com/search?q=',
    icon: 'G' // 后面可以用 SVG 图标替换
  },
  bing: {
    name: 'Bing',
    url: 'https://www.bing.com/search?q=',
    icon: 'b'
  },
  baidu: {
    name: 'Baidu',
    url: 'https://www.baidu.com/s?wd=',
    icon: '度'
  },
  duckduckgo: {
    name: 'DuckDuckGo',
    url: 'https://duckduckgo.com/?q=',
    icon: '🦆'
  }
};