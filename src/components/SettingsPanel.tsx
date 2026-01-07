import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react'; 
import { FaTrash, FaPlus } from 'react-icons/fa'; 
import { useSettings } from '../context/SettingsContext';
import { SEARCH_ENGINES, BACKGROUND_FILTERS } from '../utils/constants';
import { bgDB } from '../utils/db';
import { ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsPanel = ({ isOpen, onClose }: SettingsPanelProps) => {
  const { t } = useTranslation();
  const { settings, updateSetting } = useSettings();
  const [history, setHistory] = useState<any[]>([]);
  const bg = settings.background;

  useEffect(() => {
    if (isOpen) {
      bgDB.getAll().then(setHistory);
    }
  }, [isOpen]);

  const updateBg = (patch: Partial<typeof settings.background>) => {
    updateSetting('background', { ...bg, ...patch });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const newRecord = await bgDB.add(file); 
    const updatedHistory = await bgDB.getAll();
    setHistory(updatedHistory);
    updateBg({ type: 'local', activeLocalId: newRecord.id });
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await bgDB.delete(id);
    const updatedHistory = await bgDB.getAll();
    setHistory(updatedHistory);
    if (bg.activeLocalId === id) {
      updateBg({ type: 'builtin', activeLocalId: '' });
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <style>{`
        /* 1. 设置滚动条整体宽度 */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px; /* 稍微宽一点，为了容纳透明边框 */
        }
        
        /* 2. 轨道背景完全透明 */
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          margin-top: 4px;    /* 上下留白，防止顶头 */
          margin-bottom: 4px; /* 防止触底 */
        }

        /* 3. 滑块样式 */
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: transparent; /* 默认透明 */
          border-radius: 20px;
          border: 2px solid transparent; /* 透明边框 */
          background-clip: content-box;  /* 让背景色只在内容区显示，从而利用 border 制造内缩效果 */
          transition: background-color 0.3s;
        }

        /* 4. 只有鼠标悬浮在容器上时，才显示滑块 */
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.15); /* 淡淡的白色 */
        }

        /* 5. 鼠标按住滑块时加深颜色 */
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(255, 255, 255, 0.3);
        }
      `}</style>

      <div 
        className="bg-slate-900/95 border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl relative text-white max-h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        
        {/* --- Header --- */}
        <div className="flex-none flex justify-between items-center px-6 py-5 border-b border-white/10 bg-slate-900/50 backdrop-blur-md z-10">
          <h2 className="text-xl font-bold tracking-tight">{t('settings.title') || "Settings"}</h2>
          <button 
            onClick={onClose} 
            className="p-1 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* --- Scrollable Content (独立滚动区域) --- */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
          
          {/* --- 背景设置区域 --- */}
          <section>
            <h3 className="text-xs uppercase text-white/50 font-bold mb-4 tracking-wider">{t('settings.background') || "Background Source"}</h3>
            
            <div className="flex gap-2 mb-6">
              {['builtin', 'custom', 'local'].map((tt) => (
                <button 
                  key={tt}
                  onClick={() => updateBg({ type: tt as any })}
                  className={`flex-1 py-2 text-sm rounded-lg border capitalize transition-all ${
                    bg.type === tt ? 'bg-blue-600 border-transparent text-white shadow-lg' : 'border-white/20 hover:bg-white/10 text-white/70'
                  }`}
                >
                  {tt === 'builtin' ? t('settings.builtin') || "Bing Daily" : (tt === 'custom' ? t('settings.custom') || "Custom URL" : t('settings.local') || "Local Gallery")}
                </button>
              ))}
            </div>

            {bg.type === 'custom' && (
              <div className="mb-4 animate-fade-in">
                <input 
                  type="text" 
                  value={bg.customUrl}
                  onChange={(e) => updateBg({ customUrl: e.target.value })}
                  placeholder={t('settings.customUrl') || "Paste your custom image URL here..."}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none placeholder-white/20"
                />
              </div>
            )}

            {bg.type === 'local' && (
              <div className="space-y-4 mb-6 animate-fade-in">
                <div className="grid grid-cols-4 gap-3">
                  <button 
                    onClick={() => document.getElementById('bg-upload')?.click()}
                    className="aspect-square rounded-lg border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-1 hover:border-blue-500 hover:text-blue-500 hover:bg-white/5 transition-colors text-white/40"
                    title={t('settings.upload') || "Upload Image"}
                  >
                    <FaPlus size={16} />
                    <span className="text-[10px] font-medium">{t('quickLinks.add') || "Add"}</span>
                    <input id="bg-upload" type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </button>

                  {history.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => updateBg({ activeLocalId: item.id })}
                      className={`group relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                        bg.activeLocalId === item.id ? 'border-blue-500 shadow-blue-500/20 shadow-lg' : 'border-transparent hover:border-white/30'
                      }`}
                    >
                      <img 
                        src={URL.createObjectURL(item.file)} 
                        alt="bg-preview"
                        className="w-full h-full object-cover"
                        onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                      />
                      {bg.activeLocalId === item.id && (
                        <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                          <div className="bg-blue-500 rounded-full p-1 shadow-lg">
                            <Check size={12} className="text-white" />
                          </div>
                        </div>
                      )}
                      <button 
                        onClick={(e) => handleDelete(item.id, e)}
                        className="absolute top-1 right-1 p-1.5 bg-red-500/90 hover:bg-red-600 rounded-md opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100 shadow-sm"
                        title={t('settings.delete') || "Delete"}
                      >
                        <FaTrash size={10} className="text-white" />
                      </button>
                    </div>
                  ))}
                </div>
                {history.length === 0 && (
                  <p className="text-center text-xs text-white/30 py-2">{t('settings.noImages') || "No images uploaded yet."}</p>
                )}
              </div>
            )}

            <div className="mb-6">
              <div className="text-xs text-white/60 mb-3 font-medium">{t('settings.tint') || "Tint Filter"}</div>
              <div className="flex gap-3 overflow-x-auto py-1 -mx-2 px-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {BACKGROUND_FILTERS.map((filter) => {
                  const isActive = (bg.maskColor || '#000000') === filter.color;
                  return (
                    <button
                      key={filter.id}
                      onClick={() => updateBg({ maskColor: filter.color })}
                      className={`relative w-8 h-8 rounded-full border shrink-0 transition-transform hover:scale-110 focus:outline-none ${
                        isActive ? 'border-white scale-110' : 'border-white/10'
                      }`}
                      style={{ backgroundColor: filter.color }}
                      title={t(`filters.${filter.id}`) || filter.name}
                    >
                      {isActive && (
                         <span className="absolute inset-0 flex items-center justify-center text-white drop-shadow-md">
                           <Check size={14} strokeWidth={3} />
                         </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4 p-4 bg-white/5 rounded-xl border border-white/5">
              <div className="flex items-center gap-4">
                <span className="text-xs text-white/60 w-16 font-medium">{t('settings.blur') || "Blur"}</span>
                <input 
                  type="range" min="0" max="20" 
                  value={bg.blur} 
                  onChange={(e) => updateBg({ blur: Number(e.target.value) })}
                  className="flex-1 accent-blue-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer hover:bg-white/20 transition-colors"
                />
                <span className="text-xs text-white/40 w-6 text-right">{bg.blur}px</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-white/60 w-16 font-medium">{t('settings.dim') || "Dim"}</span>
                <input 
                  type="range" min="10" max="100" 
                  value={bg.brightness} 
                  onChange={(e) => updateBg({ brightness: Number(e.target.value) })}
                  className="flex-1 accent-blue-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer hover:bg-white/20 transition-colors"
                />
                <span className="text-xs text-white/40 w-6 text-right">{100 - bg.brightness}%</span>
              </div>
            </div>
          </section>

          <hr className="border-white/10" />

          {/* --- 时钟设置 --- */}
          <section>
            <h3 className="text-xs uppercase text-white/50 font-bold mb-4 tracking-wider">{t('settings.clock') || "Clock Format"}</h3>
            <div className="flex gap-2 p-1 bg-black/20 rounded-xl">
              {(['12', '24'] as const).map(fmt => (
                <button
                  key={fmt}
                  onClick={() => updateSetting('clockFormat', fmt)}
                  className={`flex-1 py-2 text-sm rounded-lg transition-all font-medium ${
                    settings.clockFormat === fmt 
                      ? 'bg-white/10 text-white shadow-sm' 
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                    {fmt === '12' ? t('settings.12h') || "12-Hour" : t('settings.24h') || "24-Hour"}
                </button>
              ))}
            </div>
          </section>

          {/* --- 字体设置 --- */}
          <section>
            <h3 className="text-xs uppercase text-white/50 font-bold mb-4 tracking-wider">{t('settings.font') || "Typography"}</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'sans', label: 'Modern', font: 'font-sans' },
                { id: 'serif', label: 'Elegant', font: 'font-serif' },
                { id: 'mono', label: 'Code', font: 'font-mono' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => updateSetting('fontFamily', opt.id as any)}
                  className={`py-3 rounded-xl border text-sm transition-all ${opt.font} ${
                    settings.fontFamily === opt.id
                      ? 'bg-blue-600 border-transparent text-white' 
                      : 'border-white/10 hover:border-white/30 text-white/60 hover:bg-white/5'
                  }`}
                >
                    {t(`settings.${opt.id === 'sans' ? 'modern' : opt.id === 'serif' ? 'elegant' : 'code'}`) || opt.label}
                </button>
              ))}
            </div>
          </section>

          {/* --- 搜索引擎 --- */}
          <section>
            <h3 className="text-xs uppercase text-white/50 font-bold mb-4 tracking-wider">{t('settings.search') || "Default Search"}</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(SEARCH_ENGINES).map(([key, engine]) => (
                <button
                  key={key}
                  onClick={() => updateSetting('searchEngine', key)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-sm transition-all ${
                    settings.searchEngine === key
                      ? 'bg-white/10 border-white/50 text-white'
                      : 'border-transparent bg-white/5 hover:bg-white/10 text-white/60'
                  }`}
                >
                  <span className="text-lg">{engine.icon}</span>
                  <span className="font-medium">{t(`settings.${key}`) || engine.name}</span>
                </button>
              ))}
            </div>
          </section>

          {/* --- 天气服务设置 --- */}
          <section>
            <h3 className="text-xs uppercase text-white/50 font-bold mb-4 tracking-wider">{t('settings.weather') || "Weather Service (QWeather)"}</h3>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <label className="block text-xs text-white/60 mb-2">
                API Key
              </label>
              <input
                type="text"
                value={settings.weatherApiHost}
                onChange={(e) => updateSetting('weatherApiHost', e.target.value)}
                placeholder={t('settings.placeholderHost') || "Paste your host URL here..."}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none placeholder-white/20 font-mono tracking-wide mb-1"
              />
              <input 
                type="password"
                value={settings.weatherApiKey}
                onChange={(e) => updateSetting('weatherApiKey', e.target.value)}
                placeholder={t('settings.placeholderKey') || "Paste your API key here..."}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none placeholder-white/20 font-mono tracking-wide"
              />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] text-white/40">
                  {t('settings.weatherProvider') || "Data provided by QWeather (HeFeng)"}
                </span>
                <a 
                  href="https://console.qweather.com/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {t('settings.getKey') || "Get Free Key"} <ExternalLink size={10} />
                </a>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};