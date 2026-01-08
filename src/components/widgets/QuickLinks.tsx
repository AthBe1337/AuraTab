import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useSettings } from '../../context/SettingsContext';
import type { QuickLink } from '../../context/SettingsContext';
import { Globe, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// --- Favicon 组件 ---
const FaviconImage = ({ url, title, className }: { url: string, title: string, className?: string }) => {
  const domain = new URL(url).hostname;
  const cacheKey = `favicon_cache_${domain}`;
  
  // 图片源列表
  const sources = [
    `/api/favicon/${domain}.ico`,
  ];

  const [imgSrc, setImgSrc] = useState<string>('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadIcon = async () => {
      // 1. 尝试从本地缓存读取
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setImgSrc(cached);
        setLoading(false);
        return;
      }

      // 2. 如果没有缓存，尝试轮询下载
      for (const source of sources) {
        if (!isMounted) return;
        try {
          // 发起请求获取图片数据
          const response = await fetch(source);
          if (!response.ok) continue;

          // 转为 Blob
          const blob = await response.blob();
          
          // 验证是否是有效图片
          if (!blob.type.startsWith('image/')) continue;

          // 转为 Base64
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });

          // 存入缓存并显示
          if (isMounted) {
            // 简单处理：如果 Base64 太长（超过 100KB）就不存了，防止撑爆 localStorage
            if (base64.length < 100 * 1024) {
               localStorage.setItem(cacheKey, base64);
            }
            setImgSrc(base64);
            setLoading(false);
            return; // 成功找到一个，直接退出循环
          }
        } catch (e) {
          // 抓取失败 (可能是 CORS 限制，或者网络问题)
          // console.warn(`Failed to fetch icon from ${source}`, e);
          continue;
        }
      }

      if (isMounted) {
        setImgSrc(sources[0]); // 默认用第一个源
        setLoading(false);
      }
    };

    loadIcon();

    return () => { isMounted = false; };
  }, [url, cacheKey]); // 依赖项

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    if (!target.src.startsWith('data:')) {
      setIsError(true);
    }
  };

  if (isError) {
    return (
      <div className={`${className} flex items-center justify-center bg-white/10`}>
        <Globe size={18} className="text-white/50" />
      </div>
    );
  }

  // 加载中显示一个透明占位或骨架屏
  if (loading) {
    return <div className={`${className} bg-white/5 animate-pulse rounded`} />;
  }

  return (
    <img 
      src={imgSrc} 
      alt={title} 
      className={className}
      onError={handleImgError}
    />
  );
};

// --- 1. 子组件：可拖拽的单个链接 ---
interface SortableLinkProps {
  link: QuickLink;
  onEdit: (link: QuickLink) => void;
  onDelete: (id: string) => void;
}

const SortableLink = ({ link, onEdit, onDelete }: SortableLinkProps) => {
  const { t } = useTranslation();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: link.id });

  // --- 1. 将状态定义移到最前面，以便在 style 中使用 ---
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // --- 2. 修改 style：当菜单打开时，赋予极高的 zIndex ---
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // 关键逻辑：
    // - 拖拽中：z-50 (保证拖拽物体在最上层)
    // - 菜单打开：z-40 (保证弹出的菜单盖住后面的兄弟元素)
    // - 默认：auto
    zIndex: isDragging ? 50 : (isMenuOpen ? 40 : 'auto'), 
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const, // 确保 zIndex 生效
  };

  // ... useEffect (点击外部关闭菜单) 保持不变 ...
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isMenuOpen) return;
    const distance = Math.sqrt(
      Math.pow(e.clientX - startPos.x, 2) + 
      Math.pow(e.clientY - startPos.y, 2)
    );
    if (distance < 5) {
      window.location.href = link.url;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group relative flex flex-col items-center gap-2 w-20 touch-none outline-none"
    >
      <div
        role="button"
        onPointerDown={handlePointerDown}
        onClick={handleClick}
        className="flex flex-col items-center gap-2 w-full cursor-pointer"
      >
        {/* 图标容器 */}
        <div className="relative w-16 h-16 flex items-center justify-center 
                        bg-black/20 hover:bg-black/40 
                        backdrop-blur-md 
                        rounded-2xl 
                        border border-white/10 hover:border-white/30 
                        shadow-lg hover:shadow-2xl 
                        transition-all duration-300 group-hover:-translate-y-1">
          
          <FaviconImage 
            url={link.url}
            title={link.title}
            className="w-8 h-8 rounded opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-300 pointer-events-none" 
          />

          {/* --- 右上角菜单触发按钮 --- */}
          <div 
            ref={menuRef}
            className="absolute -top-2 -right-2 z-20"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all shadow-sm
                ${isMenuOpen 
                  ? 'bg-slate-800 text-white opacity-100' 
                  : 'bg-black/50 text-white/70 opacity-0 group-hover:opacity-100 hover:bg-black/80'}`}
            >
               <MoreVertical size={14} />
            </button>

            {/* --- 下拉菜单 --- */}
            {isMenuOpen && (
              // 这里的 z-30 是相对于父级 (div.relative) 的
              // 但因为父级现在的 zIndex 已经是 40 了，所以这个菜单会高于页面上其他 zIndex 为 auto 的元素
              <div className="absolute top-7 left-1/2 -translate-x-1/2 w-24 bg-slate-800 border border-white/10 rounded-lg shadow-xl overflow-hidden animate-fade-in flex flex-col z-30">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    onEdit(link);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-white/80 hover:bg-white/10 hover:text-white transition-colors text-left"
                >
                  <Edit2 size={12} /> {t('quickLinks.edit') || 'Edit'}
                </button>
                <div className="h-[1px] bg-white/10 mx-1"></div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    onDelete(link.id);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-left"
                >
                  <Trash2 size={12} /> {t('quickLinks.delete') || 'Delete'}
                </button>
              </div>
            )}
          </div>

        </div>
        
        {/* 标题 */}
        <span className="text-xs text-white/80 font-medium truncate max-w-full 
                         drop-shadow-md select-none mt-1 px-2 py-0.5 rounded-md 
                         bg-black/0 group-hover:bg-black/30 transition-colors duration-300">
          {link.title}
        </span>
      </div>
    </div>
  );
};

// --- 2. 主组件 ---
export const QuickLinks = () => {
  const { t } = useTranslation();
  const { settings, updateSetting } = useSettings();
  
  // 模态框状态管理
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    editingId: string | null;
  }>({
    isOpen: false,
    mode: 'add',
    editingId: null
  });

  // 表单状态
  const [titleInput, setTitleInput] = useState('');
  const [urlInput, setUrlInput] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, 
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      const oldIndex = settings.quickLinks.findIndex((item) => item.id === active.id);
      const newIndex = settings.quickLinks.findIndex((item) => item.id === over?.id);
      const newLinks = arrayMove(settings.quickLinks, oldIndex, newIndex);
      updateSetting('quickLinks', newLinks);
    }
  };

  // --- 操作处理 ---

  // 打开添加模态框
  const openAddModal = () => {
    setTitleInput('');
    setUrlInput('');
    setModalState({ isOpen: true, mode: 'add', editingId: null });
  };

  // 打开编辑模态框
  const openEditModal = (link: QuickLink) => {
    setTitleInput(link.title);
    setUrlInput(link.url);
    setModalState({ isOpen: true, mode: 'edit', editingId: link.id });
  };

  // 保存（添加或更新）
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput || !urlInput) return;

    let finalUrl = urlInput;
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl;
    }

    if (modalState.mode === 'add') {
      // 添加逻辑
      const newLink: QuickLink = {
        id: Date.now().toString(),
        title: titleInput,
        url: finalUrl
      };
      updateSetting('quickLinks', [...settings.quickLinks, newLink]);
    } else if (modalState.mode === 'edit' && modalState.editingId) {
      // 编辑逻辑
      const updatedLinks = settings.quickLinks.map(link => 
        link.id === modalState.editingId 
          ? { ...link, title: titleInput, url: finalUrl }
          : link
      );
      updateSetting('quickLinks', updatedLinks);
    }

    setModalState({ ...modalState, isOpen: false });
  };

  // 删除逻辑
  const handleDelete = (id: string) => {
    const updated = settings.quickLinks.filter(link => link.id !== id);
    updateSetting('quickLinks', updated);
  };

  return (
    <div className="mt-10 w-full max-w-4xl px-4 z-20">
      
      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter} 
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-wrap justify-center gap-6">
          <SortableContext 
            items={settings.quickLinks.map(l => l.id)} 
            strategy={rectSortingStrategy}
          >
            {settings.quickLinks.map((link) => (
              <SortableLink 
                key={link.id} 
                link={link} 
                onEdit={openEditModal}
                onDelete={handleDelete} 
              />
            ))}
          </SortableContext>

          {/* --- 添加按钮 --- */}
          <button
            onClick={openAddModal}
            className="group flex flex-col items-center gap-2 w-20 outline-none"
          >
            <div className="relative w-16 h-16 flex items-center justify-center 
                            bg-black/20 hover:bg-black/40 
                            backdrop-blur-md 
                            rounded-2xl 
                            border border-dashed border-white/10 group-hover:border-white/30 
                            shadow-lg group-hover:shadow-2xl 
                            transition-all duration-300 group-hover:-translate-y-1">
              <span className="text-3xl text-white/40 group-hover:text-white/90 font-light transition-colors">+</span>
            </div>
            
            <span className="text-xs text-white/80 font-medium truncate max-w-full 
                             drop-shadow-md select-none mt-1 px-2 py-0.5 rounded-md 
                             bg-black/0 group-hover:bg-black/30 transition-colors duration-300">
              {t('quickLinks.add') || 'Add Link'}
            </span>
          </button>
        </div>
      </DndContext>

      {/* --- 通用模态框 (添加/编辑) --- */}
      {modalState.isOpen && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" 
          onClick={() => setModalState({ ...modalState, isOpen: false })}
        >
           <div 
             className="bg-slate-900 border border-white/10 p-6 rounded-xl w-80 shadow-2xl relative"
             onClick={e => e.stopPropagation()}
           >
            <h3 className="text-white font-bold mb-4">
              {modalState.mode === 'add' ? t('quickLinks.addTitle') || 'Add Shortcut' : t('quickLinks.editTitle') || 'Edit Shortcut'}
            </h3>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder={t('quickLinks.titleLabel') || 'Title'}
                  value={titleInput}
                  onChange={e => setTitleInput(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:border-white/40 outline-none text-sm"
                  autoFocus
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder={t('quickLinks.urlLabel') || 'URL'}
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:border-white/40 outline-none text-sm"
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button 
                  type="button" 
                  onClick={() => setModalState({ ...modalState, isOpen: false })} 
                  className="flex-1 py-2 text-xs text-white/60 hover:bg-white/5 rounded-lg"
                >
                  {t('quickLinks.cancel') || 'Cancel'}
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2 text-xs bg-white text-black font-bold rounded-lg hover:bg-gray-200"
                >
                  {modalState.mode === 'add' ? t('quickLinks.add') || 'Add' : t('quickLinks.save') || 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};