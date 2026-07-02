import { useEffect, useState } from 'react';
import { CheckCircle, Home, ArrowRight, AlertTriangle, Receipt, Trophy } from 'lucide-react';
import type { EconomyEvent } from '@/types/game';

interface LevelCompleteProps {
  levelId: number;
  levelName: string;
  todayIncome: number;
  rentCost: number;
  violations: number;
  completedOrders: number;
  economyEvents: EconomyEvent[];
  onNextLevel: () => void;
  onMainMenu: () => void;
  onViewAchievements?: () => void;
}

export default function LevelComplete({
  levelId, levelName, todayIncome, rentCost, violations, completedOrders,
  economyEvents, onNextLevel, onMainMenu, onViewAchievements
}: LevelCompleteProps) {
  const [showDetail, setShowDetail] = useState(false);
  const [animIncome, setAnimIncome] = useState(0);

  const finalIncome = todayIncome - rentCost;
  const canContinue = finalIncome >= 0;

  useEffect(() => {
    const t = setTimeout(() => setShowDetail(true), 800);
    return () => clearTimeout(t);
  }, []);

  // 数字动画
  useEffect(() => {
    if (!showDetail) return;
    const duration = 1000;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimIncome(Math.floor(finalIncome * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [showDetail, finalIncome]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/90 backdrop-blur-sm overflow-y-auto pt-6 sm:pt-8">
      <div className="max-w-md w-full mx-4 my-4 sm:my-6">
        {/* 头部 */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-900/30 border-2 border-green-600 mb-2">
            <Receipt size={24} className="text-green-400" />
          </div>
          <h1 className="text-xl font-bold text-white">第{levelId}天结算</h1>
          <p className="text-gray-400 text-xs mt-0.5">{levelName}</p>
        </div>

        {/* 工资条 */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
          {/* 工资条标题 */}
          <div className="bg-gray-800 px-5 py-3 border-b border-gray-700 flex items-center gap-2">
            <Receipt size={16} className="text-gray-400" />
            <span className="text-gray-300 font-medium text-sm">工资条</span>
          </div>

          {/* 收入明细 */}
          <div className="px-5 py-4 space-y-2">
            {economyEvents.filter(e => e.amount > 0).map((e, i) => (
              <div
                key={i}
                className={`flex justify-between text-sm transition-all duration-500 ${
                  showDetail ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <span className="text-gray-400">{e.description}</span>
                <span className="text-green-400 font-medium">+{e.amount}元</span>
              </div>
            ))}

            {/* 支出明细 */}
            {economyEvents.filter(e => e.amount < 0).map((e, i) => (
              <div
                key={`neg-${i}`}
                className={`flex justify-between text-sm transition-all duration-500 ${
                  showDetail ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                }`}
                style={{ transitionDelay: `${(economyEvents.filter(e => e.amount > 0).length + i) * 100}ms` }}
              >
                <span className="text-gray-400">{e.description}</span>
                <span className="text-red-400 font-medium">{e.amount}元</span>
              </div>
            ))}

            {/* 房租 */}
            <div
              className={`flex justify-between text-sm pt-2 border-t border-gray-700 transition-all duration-500 ${
                showDetail ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
              }`}
              style={{ transitionDelay: `${economyEvents.length * 100}ms` }}
            >
              <span className="text-gray-300 font-medium">房租扣除</span>
              <span className="text-red-400 font-bold">-{rentCost}元</span>
            </div>
          </div>

          {/* 总计 */}
          <div className="bg-gray-800 px-5 py-4 border-t border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-gray-300 font-bold">最终结余</span>
              <span className={`text-3xl font-black ${canContinue ? 'text-green-400' : 'text-red-400'}`}>
                ¥{animIncome}
              </span>
            </div>
          </div>
        </div>

        {/* 统计 */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-3 text-center">
            <div className="text-gray-400 text-xs">完成单数</div>
            <div className="text-blue-400 font-bold text-lg">{completedOrders}</div>
          </div>
          <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-3 text-center">
            <div className="text-gray-400 text-xs">闯红灯</div>
            <div className="text-orange-400 font-bold text-lg">{violations}</div>
          </div>
          <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-3 text-center">
            <div className="text-gray-400 text-xs">收入</div>
            <div className="text-yellow-400 font-bold text-lg">¥{todayIncome}</div>
          </div>
        </div>

        {/* 结果判定 */}
        {canContinue ? (
          <div className="mt-4 bg-green-900/20 border border-green-700/40 rounded-lg p-4 text-center">
            <p className="text-green-300 text-sm">
              <CheckCircle size={14} className="inline mr-1" />
              你赚够了房租，可以继续明天的"工作"。
            </p>
          </div>
        ) : (
          <div className="mt-4 bg-red-900/20 border border-red-700/40 rounded-lg p-4 text-center">
            <p className="text-red-300 text-sm">
              <AlertTriangle size={14} className="inline mr-1" />
              收入不足以支付房租。在现实里，这意味着被房东赶出去。
            </p>
          </div>
        )}

        {/* 按钮 */}
        <div className="flex gap-3 mt-6">
          {canContinue && levelId < 10 ? (
            <button
              onClick={onNextLevel}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-500
                         text-white font-bold rounded-lg transition-colors"
            >
              <span>下一天</span>
              <ArrowRight size={18} />
            </button>
          ) : canContinue && levelId === 10 ? (
            <div className="flex flex-col gap-3 w-full">
              {onViewAchievements && (
                <button
                  onClick={onViewAchievements}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-yellow-700 hover:bg-yellow-600
                             text-yellow-100 font-bold rounded-lg transition-colors border border-yellow-500/40"
                >
                  <Trophy size={18} />
                  <span>查看生涯总结</span>
                </button>
              )}
              <button
                onClick={onMainMenu}
                className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-500
                           text-white font-bold rounded-lg transition-colors"
              >
                <span>通关完成 / 回到主菜单</span>
                <CheckCircle size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={onMainMenu}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-700 hover:bg-gray-600
                         text-white font-bold rounded-lg transition-colors"
            >
              <Home size={18} />
              <span>离开城市</span>
            </button>
          )}
          <button
            onClick={onMainMenu}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700
                       text-gray-300 rounded-lg transition-colors"
          >
            <Home size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
