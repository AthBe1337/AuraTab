import { useState, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next'; 

export const SearchBar = () => {
  const { t } = useTranslation(); 
  const [query, setQuery] = useState('');

  const handleSearch = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      if (typeof chrome !== 'undefined' && chrome.search) {
        chrome.search.query({
          text: query,
          disposition: 'CURRENT_TAB'
        });
      } else {
        console.warn('Chrome API unavailable, falling back to Google');
        window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mt-8 px-4 relative z-40">
      
      <div className="relative group flex items-center 
                      bg-black/20 hover:bg-black/30 
                      backdrop-blur-xl 
                      border border-white/10 hover:border-white/20
                      rounded-full shadow-2xl transition-all duration-300">
        
        {/* 左侧装饰：通用搜索图标 */}
        <div className="pl-5 pr-2 opacity-70">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        </div>

        {/* 输入框 */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleSearch}
          // Placeholder 变得更加通用
          placeholder={t('settings.search_common') || "Search the web..."}
          className="flex-1 py-4 px-2 bg-transparent text-white placeholder-white/40 
                     text-lg border-none outline-none rounded-r-full 
                     font-light tracking-wide drop-shadow-sm"
          autoFocus
        />
        
        {/* 右侧占位或额外操作 (可选，目前留空保持对称或添加清除按钮) */}
        {query && (
          <button 
            onClick={() => setQuery('')}
            className="pr-5 pl-2 opacity-50 hover:opacity-100 transition-opacity cursor-pointer text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </button>
        )}

      </div>
    </div>
  );
};