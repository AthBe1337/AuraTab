import { useState } from 'react';
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

// --- 1. 子组件：可拖拽的单个链接 ---
const SortableLink = ({ link, onDelete }: { link: QuickLink; onDelete: (id: string, e: React.MouseEvent) => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleClick = (e: React.MouseEvent) => {
    const distance = Math.sqrt(
      Math.pow(e.clientX - startPos.x, 2) + 
      Math.pow(e.clientY - startPos.y, 2)
    );

    if (distance < 5) {
      window.location.href = link.url;
    }
  };

  const getFavicon = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      //return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
      return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
    } catch (e) {
      return '';
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
          
          <img 
            src={getFavicon(link.url)} 
            alt={link.title} 
            className="w-8 h-8 rounded opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-300 pointer-events-none" 
          />

          {/* 删除按钮 */}
          <button
            onPointerDown={(e) => e.stopPropagation()} 
            onClick={(e) => onDelete(link.id, e)}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 cursor-pointer z-10 shadow-sm"
            title="Remove"
          >
            ×
          </button>
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
  const { settings, updateSetting } = useSettings();
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');

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

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newUrl) return;

    let finalUrl = newUrl;
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl;
    }

    const newLink: QuickLink = {
      id: Date.now().toString(),
      title: newTitle,
      url: finalUrl
    };

    updateSetting('quickLinks', [...settings.quickLinks, newLink]);
    setNewTitle('');
    setNewUrl('');
    setIsAdding(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
                onDelete={handleDelete} 
              />
            ))}
          </SortableContext>

          {/* --- 添加按钮 (样式升级) --- */}
          <button
            onClick={() => setIsAdding(true)}
            className="group flex flex-col items-center gap-2 w-20 outline-none"
          >
            {/* 图标容器：样式与 SortableLink 保持一致，但保留 border-dashed */}
            <div className="relative w-16 h-16 flex items-center justify-center 
                            bg-black/20 hover:bg-black/40 
                            backdrop-blur-md 
                            rounded-2xl 
                            border border-dashed border-white/10 group-hover:border-white/30 
                            shadow-lg group-hover:shadow-2xl 
                            transition-all duration-300 group-hover:-translate-y-1">
              <span className="text-3xl text-white/40 group-hover:text-white/90 font-light transition-colors">+</span>
            </div>
            
            {/* 标签：样式与 SortableLink 完全一致 */}
            <span className="text-xs text-white/80 font-medium truncate max-w-full 
                             drop-shadow-md select-none mt-1 px-2 py-0.5 rounded-md 
                             bg-black/0 group-hover:bg-black/30 transition-colors duration-300">
              Add
            </span>
          </button>
        </div>
      </DndContext>

      {isAdding && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" 
          onClick={() => setIsAdding(false)}
        >
           <div 
             className="bg-slate-900 border border-white/10 p-6 rounded-xl w-80 shadow-2xl relative"
             onClick={e => e.stopPropagation()}
           >
            <h3 className="text-white font-bold mb-4">Add Shortcut</h3>
            <form onSubmit={handleAddLink} className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Title"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:border-white/40 outline-none text-sm"
                  autoFocus
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="URL"
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
        </div>,
        document.body
      )}

    </div>
  );
};