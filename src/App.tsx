import { useState } from 'react';
import { Clock } from './components/widgets/Clock';
import { SearchBar } from './components/widgets/SearchBar';
import { QuickLinks } from './components/widgets/QuickLinks';
import { SettingsPanel } from './components/SettingsPanel';
import { SettingsProvider } from './context/SettingsContext';
import { Background } from './components/Background';
import { WeatherWidget } from './components/widgets/WeatherWidget';

// 创建一个内部组件来使用 Context (因为 App 自身是 Provider 的外层，无法直接在 App 里 useSettings)
const MainLayout = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center 
                    from-indigo-900 via-purple-900 to-slate-900 relative overflow-hidden">
      
      <Background />

      <WeatherWidget />

      {/* 设置按钮 (左下角) */}
      <button 
        onClick={() => setIsSettingsOpen(true)}
        className="absolute bottom-6 left-6 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all"
        title="Settings"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
      </button>

      <main className="flex flex-col items-center w-full animate-fade-in">
        <Clock />
        <SearchBar />
        <QuickLinks />
      </main>

      {/* 设置面板组件 */}
      <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

    </div>
  );
};

function App() {
  return (
    <SettingsProvider>
      <MainLayout />
    </SettingsProvider>
  );
}

export default App;