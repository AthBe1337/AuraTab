import { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import type { QuickLink } from '../../context/SettingsContext';

export const QuickLinks = () => {
  const { settings, updateSetting } = useSettings();
  const [isAdding, setIsAdding] = useState(false);
  
  // 表单状态
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');

  // 获取 favicon 的黑科技 (利用 Google 服务)
  const getFavicon = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch (e) {
      return ''; // URL 无效时返回空
    }
  };

  // 添加链接
  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newUrl) return;

    // 自动补全 https
    let finalUrl = newUrl;
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl;
    }

    const newLink: QuickLink = {
      id: Date.now().toString(), // 简单的 ID 生成
      title: newTitle,
      url: finalUrl
    };

    updateSetting('quickLinks', [...settings.quickLinks, newLink]);
    
    // 重置并关闭
    setNewTitle('');
    setNewUrl('');
    setIsAdding(false);
  };

  // 删除链接
  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault(); // 防止触发点击链接
    e.stopPropagation();
    const updated = settings.quickLinks.filter(link => link.id !== id);
    updateSetting('quickLinks', updated);
  };

  return (
    <div className="mt-10 w-full max-w-4xl px-4">
      
      {/* 图标网格 */}
      <div className="flex flex-wrap justify-center gap-6">
        {settings.quickLinks.map((link) => (
          <a
            key={link.id}
            href={link.url}
            className="group flex flex-col items-center gap-2 w-20 transition-transform hover:-translate-y-1"
          >
            {/* 图标容器 (Glassmorphism) */}
            <div className="relative w-14 h-14 flex items-center justify-center bg-white/10 backdrop-blur-md rounded-2xl border border-white/5 shadow-lg group-hover:bg-white/20 transition-all">
              <img 
                src={getFavicon(link.url)} 
                alt={link.title} 
                className="w-8 h-8 rounded-sm opacity-90 group-hover:opacity-100"
                onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,...'; }} // 可选：处理加载失败
              />

              {/* 删除按钮 (仅 hover 显示) */}
              <button
                onClick={(e) => handleDelete(link.id, e)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                title="Remove"
              >
                ×
              </button>
            </div>
            
            {/* 标题 */}
            <span className="text-xs text-white/70 font-medium truncate max-w-full shadow-black/50 drop-shadow-md">
              {link.title}
            </span>
          </a>
        ))}

        {/* 添加按钮 */}
        <button
          onClick={() => setIsAdding(true)}
          className="flex flex-col items-center gap-2 w-20 transition-transform hover:-translate-y-1"
        >
          <div className="w-14 h-14 flex items-center justify-center bg-white/5 backdrop-blur-sm rounded-2xl border border-dashed border-white/20 hover:border-white/40 hover:bg-white/10 transition-all">
            <span className="text-2xl text-white/50 font-light">+</span>
          </div>
          <span className="text-xs text-white/50 font-medium">Add</span>
        </button>
      </div>

      {/* --- 添加链接的模态框 --- */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsAdding(false)}>
          <div className="bg-slate-900 border border-white/10 p-6 rounded-xl w-80 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-white font-bold mb-4">Add Shortcut</h3>
            <form onSubmit={handleAddLink} className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Title (e.g. GitHub)"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:border-white/40 outline-none text-sm"
                  autoFocus
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="URL (e.g. github.com)"
                  value={newUrl}
                  onChange={e => setNewUrl(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:border-white/40 outline-none text-sm"
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-2 text-xs text-white/60 hover:bg-white/5 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 py-2 text-xs bg-white text-black font-bold rounded-lg hover:bg-gray-200">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};