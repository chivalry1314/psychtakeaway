import { useEffect, useState } from 'react';
import { AlertTriangle, RotateCcw, Home, Skull } from 'lucide-react';

interface GameOverProps {
  reason: string;
  todayIncome: number;
  violations: number;
  crashes: number;
  completedOrders: number;
  onRestart: () => void;
  onMainMenu: () => void;
}

export default function GameOver({
  reason, todayIncome, violations, crashes, completedOrders, onRestart, onMainMenu
}: GameOverProps) {
  const [showContent, setShowContent] = useState(false);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowContent(true), 500);
    const t2 = setTimeout(() => setShowStats(true), 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      {/* 裂纹效果背景 */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/30 via-black to-black" />
      </div>

      <div className="relative z-10 max-w-lg w-full mx-4 text-center">
        {/* 图标 */}
        <div className={`transition-all duration-1000 ${showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-900/30 border-2 border-red-600 mb-6">
            <Skull size={40} className="text-red-500" />
          </div>
        </div>

        {/* 标题 */}
        <h1
          className={`text-4xl font-black text-red-500 mb-4 transition-all duration-1000 ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ textShadow: '0 0 20px rgba(230,57,70,0.5)' }}
        >
          游戏结束
        </h1>

        {/* 原因 */}
        <p
          className={`text-gray-300 text-lg mb-8 leading-relaxed transition-all duration-1000 delay-300 ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {reason}
        </p>

        {/* 统计数据 */}
        <div
          className={`grid grid-cols-2 gap-3 mb-8 transition-all duration-1000 delay-500 ${
            showStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="bg-gray-900/80 border border-gray-700 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">今日收入</div>
            <div className="text-yellow-400 text-2xl font-bold">¥{todayIncome}</div>
          </div>
          <div className="bg-gray-900/80 border border-gray-700 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">完成单数</div>
            <div className="text-blue-400 text-2xl font-bold">{completedOrders}单</div>
          </div>
          <div className="bg-gray-900/80 border border-gray-700 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">闯红灯</div>
            <div className="text-orange-400 text-2xl font-bold">{violations}次</div>
          </div>
          <div className="bg-gray-900/80 border border-gray-700 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">事故</div>
            <div className="text-red-400 text-2xl font-bold">{crashes}次</div>
          </div>
        </div>

        {/* 反思文案 */}
        <div
          className={`bg-red-900/20 border border-red-800/40 rounded-lg p-4 mb-8 transition-all duration-1000 delay-700 ${
            showStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <p className="text-red-300 text-sm">
            <AlertTriangle size={14} className="inline mr-1" />
            在现实中，2023年外卖骑手交通事故死亡人数超过数百人。
            每一次闯红灯，都是在用生命赌一个好评。
          </p>
        </div>

        {/* 按钮 */}
        <div
          className={`flex gap-3 justify-center transition-all duration-1000 delay-1000 ${
            showStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <button
            onClick={onRestart}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500
                       text-white font-bold rounded-lg transition-colors"
          >
            <RotateCcw size={18} />
            再试一次
          </button>
          <button
            onClick={onMainMenu}
            className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600
                       text-white font-bold rounded-lg transition-colors"
          >
            <Home size={18} />
            主菜单
          </button>
        </div>
      </div>
    </div>
  );
}
