import { X, Check } from 'lucide-react'; // 如果你还没装图标库，看下面的提示*
import { useSettings } from '../context/SettingsContext';
import { SEARCH_ENGINES } from '../utils/constants';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsPanel = ({ isOpen, onClose }: SettingsPanelProps) => {
  const { settings, updateSetting } = useSettings();

  if (!isOpen) return null;

  return (
    // 1. 遮罩层
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      
      {/* 2. 面板主体 */}
      <div className="bg-slate-900/90 border border-white/10 w-full max-w-md rounded-2xl p-6 shadow-2xl relative text-white">
        
        {/* 标题栏 */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            {/* 这里用简单的 SVG 替代 lucide-react 以防你没装 */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* --- 选项区域 --- */}
        <div className="space-y-8">
          
          {/* 时钟设置 */}
          <section>
            <h3 className="text-sm uppercase text-white/50 font-bold mb-3 tracking-wider">Clock</h3>
            <div className="flex gap-2">
              {(['12', '24'] as const).map(fmt => (
                <button
                  key={fmt}
                  onClick={() => updateSetting('clockFormat', fmt)}
                  className={`flex-1 py-2 rounded-lg border transition-all ${
                    settings.clockFormat === fmt 
                      ? 'bg-white text-black border-white' 
                      : 'border-white/20 hover:border-white/50 text-white/70'
                  }`}
                >
                  {fmt}-Hour
                </button>
              ))}
            </div>
          </section>

          {/* 字体设置 */}
          <section>
            <h3 className="text-sm uppercase text-white/50 font-bold mb-3 tracking-wider">Typography</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'sans', label: 'Modern', font: 'font-sans' },
                { id: 'serif', label: 'Elegant', font: 'font-serif' },
                { id: 'mono', label: 'Code', font: 'font-mono' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => updateSetting('fontFamily', opt.id as any)}
                  className={`py-3 rounded-lg border transition-all ${opt.font} ${
                    settings.fontFamily === opt.id
                      ? 'bg-white text-black border-white' 
                      : 'border-white/20 hover:border-white/50 text-white/70'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          {/* 默认搜索引擎 */}
          <section>
            <h3 className="text-sm uppercase text-white/50 font-bold mb-3 tracking-wider">Search Engine</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(SEARCH_ENGINES).map(([key, engine]) => (
                <button
                  key={key}
                  onClick={() => updateSetting('searchEngine', key)}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-sm transition-all ${
                    settings.searchEngine === key
                      ? 'bg-white/10 border-white text-white'
                      : 'border-transparent hover:bg-white/5 text-white/60'
                  }`}
                >
                  <span>{engine.icon}</span>
                  {engine.name}
                </button>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};