import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { SEARCH_ENGINES } from '../../utils/constants';
import { useSettings } from '../../context/SettingsContext'; // 引入

export const SearchBar = () => {
  const { settings, updateSetting } = useSettings(); // 使用全局设置
  const [query, setQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentEngine = SEARCH_ENGINES[settings.searchEngine] || SEARCH_ENGINES['google'];

  const handleSearch = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      window.location.href = `${currentEngine.url}${encodeURIComponent(query)}`;
    }
  };

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full max-w-2xl mt-8 px-4 relative z-40">
      
      {/* --- 视觉容器 --- 
         改动点：
         1. bg-black/20: 使用黑色半透明，提升白字对比度
         2. backdrop-blur-xl: 加大模糊半径
         3. border border-white/10: 增加微弱描边，划清界限
         4. shadow-2xl: 增加深重阴影，制造悬浮感
      */}
      <div className="relative group flex items-center 
                      bg-black/20 hover:bg-black/30 
                      backdrop-blur-xl 
                      border border-white/10 hover:border-white/20
                      rounded-full shadow-2xl transition-all duration-300">
        
        {/* 搜索引擎切换按钮 */}
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center justify-center w-14 h-full py-4 pl-5 pr-3 
                       text-white/80 hover:text-white font-bold cursor-pointer outline-none border-r border-white/10" // 加了右边框分割
            title={`Current: ${currentEngine.name}`}
          >
            <span className="text-xl drop-shadow-md">{currentEngine.icon}</span>
            <svg className={`w-3 h-3 ml-2 transition-transform opacity-60 ${isMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>

          {/* 下拉菜单 (也升级一下样式) */}
          {isMenuOpen && (
            <div className="absolute top-full left-0 mt-3 w-48 
                            bg-slate-900/80 backdrop-blur-xl 
                            rounded-xl border border-white/10 shadow-2xl 
                            overflow-hidden animate-fade-in origin-top-left py-2">
              {Object.entries(SEARCH_ENGINES).map(([key, engine]) => (
                <button
                  key={key}
                  onClick={() => {
                    updateSetting('searchEngine', key);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/10 flex items-center gap-3 transition-colors
                    ${settings.searchEngine === key ? 'bg-white/10 text-white font-medium' : ''}`}
                >
                  <span className="w-5 text-center">{engine.icon}</span>
                  {engine.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 输入框 */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleSearch}
          placeholder={`Search with ${currentEngine.name}...`}
          // text-shadow-sm 让文字本身也有阴影，更清晰
          className="flex-1 py-4 px-4 bg-transparent text-white placeholder-white/40 
                     text-lg border-none outline-none rounded-r-full 
                     font-light tracking-wide drop-shadow-sm"
          autoFocus
        />
        
        {/* 右侧装饰：搜索图标 */}
        <div className="pr-6 opacity-50 group-hover:opacity-100 transition-opacity">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        </div>

      </div>
    </div>
  );
};