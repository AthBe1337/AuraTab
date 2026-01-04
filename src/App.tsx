import { useState } from 'react';
import { Clock } from './components/widgets/Clock';
import { SearchBar } from './components/widgets/SearchBar';

function App() {
  // --- 临时状态，用于测试功能 ---
  const [is24Hour, setIs24Hour] = useState(true);
  const [font, setFont] = useState<'sans' | 'serif' | 'mono'>('sans');

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center 
                    bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 relative">
      
      {/* --- 临时调试工具栏 (右上角) --- */}
      <div className="absolute top-4 right-4 flex gap-2 bg-black/20 p-2 rounded-lg backdrop-blur-sm z-50">
        <button onClick={() => setIs24Hour(!is24Hour)} className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs text-white">
          {is24Hour ? '切换12h' : '切换24h'}
        </button>
        <button onClick={() => setFont('sans')} className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs text-white">Sans</button>
        <button onClick={() => setFont('serif')} className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs text-white">Serif</button>
        <button onClick={() => setFont('mono')} className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs text-white">Mono</button>
      </div>

      <main className="flex flex-col items-center w-full animate-fade-in transition-all duration-700">
        {/* 将状态传递给 Clock */}
        <Clock use24Hour={is24Hour} fontFamily={font} />
        
        <SearchBar />
      </main>

      <footer className="absolute bottom-4 text-white/40 text-sm font-light">
        AuraTab
      </footer>
    </div>
  );
}

export default App;