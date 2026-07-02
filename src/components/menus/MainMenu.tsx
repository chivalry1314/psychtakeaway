import { useState } from 'react';
import { Play, HelpCircle, AlertTriangle, Trophy } from 'lucide-react';

interface MainMenuProps {
  onStart: () => void;
  onHelp: () => void;
  onAchievements: () => void;
}

export default function MainMenu({ onStart, onHelp, onAchievements }: MainMenuProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* 背景图 */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(assets/images/menu_bg.png)' }}
      />
      {/* 暗色遮罩 */}
      <div className="absolute inset-0 bg-black/60" />

      {/* 内容 */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
        {/* 警告标志 */}
        <div className="flex items-center gap-2 mb-4 text-yellow-400 animate-pulse">
          <AlertTriangle size={20} />
          <span className="text-sm tracking-wider">本游戏包含对现实社会的隐喻</span>
          <AlertTriangle size={20} />
        </div>

        {/* 标题 */}
        <h1
          className="text-5xl md:text-7xl font-black text-white mb-2 tracking-tight"
          style={{
            textShadow: '0 0 20px rgba(230,57,70,0.5), 0 4px 8px rgba(0,0,0,0.8)',
          }}
        >
          红灯，绿灯，命
        </h1>

        {/* 副标题 */}
        <p
          className="text-lg md:text-xl text-gray-300 mb-12 italic"
          style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
        >
          &ldquo;这不是游戏，这是生存。&rdquo;
        </p>

        {/* 主按钮 */}
        <button
          onClick={onStart}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className={`
            relative px-12 py-5 text-xl font-bold text-white rounded-lg
            transition-all duration-300 transform
            ${hovered ? 'scale-110 -translate-y-1' : 'scale-100'}
          `}
          style={{
            background: 'linear-gradient(135deg, #E63946 0%, #d62839 50%, #E63946 100%)',
            boxShadow: hovered
              ? '0 0 30px rgba(230,57,70,0.6), 0 8px 20px rgba(0,0,0,0.4)'
              : '0 4px 15px rgba(0,0,0,0.3)',
            border: '2px solid rgba(255,255,255,0.2)',
          }}
        >
          <div className="flex items-center gap-3">
            <Play size={24} fill="white" />
            <span>开始接单</span>
          </div>
          {/* 闪光效果 */}
          <div
            className="absolute inset-0 rounded-lg overflow-hidden"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
              transform: hovered ? 'translateX(100%)' : 'translateX(-100%)',
              transition: 'transform 0.6s ease',
            }}
          />
        </button>

        {/* 次要按钮 */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6">
          <button
            onClick={onAchievements}
            className="flex items-center justify-center gap-2 px-6 py-3 text-yellow-400 hover:text-yellow-300
                       border border-yellow-700/60 hover:border-yellow-500/80 rounded-lg
                       transition-all duration-300 hover:bg-yellow-900/20"
          >
            <Trophy size={18} />
            <span>成就殿堂</span>
          </button>
          <button
            onClick={onHelp}
            className="flex items-center justify-center gap-2 px-6 py-3 text-gray-300 hover:text-white
                       border border-gray-600 hover:border-gray-400 rounded-lg
                       transition-all duration-300 hover:bg-white/10"
          >
            <HelpCircle size={18} />
            <span>游戏说明</span>
          </button>
        </div>

        {/* 底部信息 */}
        <div className="absolute bottom-8 text-center text-gray-500 text-sm">
          <p>使用 WASD 或方向键移动 · 靠近目标自动交互</p>
          <p className="mt-1">改编自真实事件 · 向所有劳动者致敬</p>
        </div>
      </div>
    </div>
  );
}
