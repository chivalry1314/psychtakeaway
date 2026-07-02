import { useState } from 'react';
import Home from './pages/Home';
import GettingStarted from './pages/GettingStarted';
import GameGuide from './pages/GameGuide';
import Deployment from './pages/Deployment';

const pages = [
  { id: 'home', title: '首页', component: Home },
  { id: 'start', title: '快速开始', component: GettingStarted },
  { id: 'guide', title: '游戏指南', component: GameGuide },
  { id: 'deploy', title: '部署说明', component: Deployment },
];

export default function App() {
  const [active, setActive] = useState('home');
  const Page = pages.find(p => p.id === active)?.component || Home;

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* 侧边栏 */}
      <aside className="w-full md:w-64 bg-gray-900 border-b md:border-b-0 md:border-r border-gray-800 flex-shrink-0">
        <div className="p-6">
          <h1 className="text-xl font-black text-white tracking-tight">红灯，绿灯，命</h1>
          <p className="text-gray-500 text-xs mt-1">在线文档</p>
        </div>
        <nav className="px-4 pb-4 md:pb-0 space-y-1">
          {pages.map(p => (
            <button
              key={p.id}
              onClick={() => setActive(p.id)}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active === p.id
                  ? 'bg-red-600/20 text-red-400 border border-red-600/30'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              }`}
            >
              {p.title}
            </button>
          ))}
        </nav>
      </aside>

      {/* 主内容 */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <Page />
        </div>
      </main>
    </div>
  );
}
