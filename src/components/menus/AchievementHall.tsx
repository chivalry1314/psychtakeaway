import { Home, Trophy, HelpCircle, AlertTriangle } from 'lucide-react';
import type { GameStats, Achievement } from '@/types/game';
import { createAchievements } from '@/game/engine/GameEngine';

interface AchievementHallProps {
  stats: GameStats;
  onMainMenu: () => void;
}

const allAchievements: Achievement[] = createAchievements();

function getSystemComment(stats: GameStats) {
  const v = stats.totalViolations;
  const streak = stats.maxViolationStreak;
  if (v >= 50) {
    return `系统评价：你是本区域效率最高的骑手。现实评价：你已经不记得红灯长什么样了。最高连闯 ${streak} 次，平台应该给你颁一面锦旗。`;
  }
  if (v >= 20) {
    return `系统评价：平台核心骨干，值得全体骑手学习。现实评价：你和交警都很熟悉彼此，最高连闯 ${streak} 次。`;
  }
  if (v >= 1) {
    return `系统评价：懂得变通的优秀员工。现实评价：规则是别人守的，房租是你交的。累计闯红灯 ${v} 次，最高连闯 ${streak} 次。`;
  }
  return '系统评价：罕见的守法骑手。现实评价：你的订单超时了，房租也快要交不起了。系统正在考虑降低你的派单优先级。';
}

export default function AchievementHall({ stats, onMainMenu }: AchievementHallProps) {
  const unlockedIds = new Set(stats.unlockedAchievementIds);
  const unlockedCount = unlockedIds.size;
  const totalRent = stats.totalOrdersCompleted * 50; // 粗略估算，仅作讽刺展示
  const netIncome = stats.totalOrdersCompleted * 8 - totalRent; // 讽刺性估算

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-950">
      <div className="min-h-screen px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          {/* 标题 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-900/30 border-2 border-yellow-600 mb-4">
              <Trophy size={32} className="text-yellow-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              系统荣誉墙
            </h1>
            <p className="text-gray-500 mt-2">你的“优秀”档案 · 仅供平台内部表彰</p>
          </div>

          {/* 数据看板 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <StatCard label="累计闯红灯" value={stats.totalViolations} color="text-red-400" />
            <StatCard label="最高连闯" value={stats.maxViolationStreak} color="text-orange-400" />
            <StatCard label="完成单数" value={stats.totalOrdersCompleted} color="text-blue-400" />
            <StatCard label="累计事故" value={stats.totalCrashes} color="text-purple-400" />
          </div>

          {/* 系统评语 */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <AlertTriangle size={22} className="text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-yellow-400 font-bold mb-2">系统评语</h2>
                <p className="text-gray-300 leading-relaxed">{getSystemComment(stats)}</p>
              </div>
            </div>
          </div>

          {/* 成就列表 */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">解锁成就</h2>
              <span className="text-sm text-gray-500">{unlockedCount} / {allAchievements.length}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allAchievements.map(ach => {
                const unlocked = unlockedIds.has(ach.id);
                return (
                  <div
                    key={ach.id}
                    className={`relative rounded-xl border p-4 transition-all ${
                      unlocked
                        ? 'bg-gray-900 border-yellow-600/40'
                        : 'bg-gray-900/40 border-gray-800 grayscale opacity-70'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`text-4xl ${unlocked ? '' : 'opacity-40'}`}>
                        {unlocked ? ach.icon : <HelpCircle size={36} className="text-gray-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className={`font-bold ${unlocked ? 'text-white' : 'text-gray-500'}`}>
                            {unlocked ? ach.name : '???'}
                          </h3>
                          {unlocked && (
                            <span className="text-xs text-yellow-400 bg-yellow-900/30 px-2 py-0.5 rounded-full border border-yellow-700/40">
                              +{ach.reward}元
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mt-1">
                          {unlocked ? ach.description : '条件未公开，继续“努力”即可解锁。'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 讽刺性财务总结 */}
          <div className="bg-red-950/20 border border-red-900/40 rounded-xl p-6 mb-8">
            <h2 className="text-red-300 font-bold mb-3">职业生涯财务简报</h2>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex justify-between">
                <span>平台口头表扬</span>
                <span className="text-green-400">无价</span>
              </div>
              <div className="flex justify-between">
                <span>累计房租（估算）</span>
                <span className="text-red-400">-{totalRent}元</span>
              </div>
              <div className="flex justify-between border-t border-red-900/30 pt-2">
                <span>净收入（估算）</span>
                <span className={netIncome >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {netIncome >= 0 ? '+' : ''}{netIncome}元
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3 italic">
              * 以上数据仅供讽刺展示，平台不会为任何事故、罚款或健康损耗负责。
            </p>
          </div>

          {/* 返回按钮 */}
          <button
            onClick={onMainMenu}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-gray-800 hover:bg-gray-700
                       text-white font-bold rounded-lg transition-colors"
          >
            <Home size={18} />
            <span>回到主菜单</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
      <div className="text-gray-500 text-xs mb-1">{label}</div>
      <div className={`text-2xl font-black ${color}`}>{value}</div>
    </div>
  );
}
