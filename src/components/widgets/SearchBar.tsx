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
    <div className="w-full max-w-2xl mt-8 px-4 relative z-50"> {/* z-50 保证下拉菜单在最上层 */}
      <div className="relative group flex items-center">
        {/* 背景模糊层 */}
        <div className="absolute inset-0 bg-white/20 backdrop-blur-md rounded-full transition-all duration-300 group-hover:bg-white/30 shadow-lg"></div>
        
        {/* --- 搜索引擎切换按钮 --- */}
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center justify-center w-12 h-full py-4 pl-6 pr-2 text-white/90 hover:text-white font-bold cursor-pointer outline-none"
            title={`Current: ${currentEngine.name}`}
          >
            {/* 显示当前图标 */}
            <span className="text-xl">{currentEngine.icon}</span>
            {/* 小箭头 */}
            <svg className={`w-3 h-3 ml-1 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>

          {/* 下拉菜单 */}
          {isMenuOpen && (
            <div className="absolute top-full left-4 mt-2 w-40 bg-slate-800/90 backdrop-blur-xl rounded-xl shadow-xl overflow-hidden border border-white/10 animate-fade-in origin-top-left">
              {Object.entries(SEARCH_ENGINES).map(([key, engine]) => (
                <button
                  key={key}
                  onClick={() => {
                    updateSetting('searchEngine', key); // <--- 关键修改
                    setIsMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm text-white hover:bg-white/10 flex items-center gap-3 transition-colors
                    ${settings.searchEngine === key ? 'bg-white/20' : ''}`}
                >
                  <span>{engine.icon}</span>
                  {engine.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* --- 输入框 --- */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleSearch}
          placeholder={`Search with ${currentEngine.name}...`}
          className="flex-1 py-4 pr-8 bg-transparent text-white placeholder-white/60 text-xl border-none outline-none rounded-r-full font-light tracking-wide relative z-10"
          autoFocus
        />
      </div>
    </div>
  );
};