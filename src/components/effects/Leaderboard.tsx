import { useState } from 'react';
import { Trophy, ChevronDown, ChevronUp, TrendingDown, TrendingUp } from 'lucide-react';
import type { LeaderboardEntry } from '@/types/game';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  playerViolations: number;
  completedOrders: number;
}

export default function Leaderboard({ entries, playerViolations, completedOrders }: LeaderboardProps) {
  const [expanded, setExpanded] = useState(false);

  // 找到玩家条目
  const playerEntry = entries.find(e => e.isPlayer) || {
    rank: 99, name: '你', orders: completedOrders, violations: playerViolations, isPlayer: true,
  };

  if (expanded) {
    // 展开模式：显示完整排行榜
    return (
      <div className="bg-black/70 backdrop-blur rounded-lg border border-gray-700/50 p-2.5 w-[180px]">
        <button
          onClick={() => setExpanded(false)}
          className="flex items-center justify-between w-full mb-2"
        >
          <div className="flex items-center gap-1.5">
            <Trophy size={12} className="text-yellow-400" />
            <span className="text-gray-300 text-[10px] font-bold">骑手排名</span>
          </div>
          <ChevronUp size={14} className="text-gray-500" />
        </button>

        <div className="space-y-1">
          {entries.map((entry, i) => (
            <div
              key={entry.name + i}
              className={`flex items-center gap-1.5 text-[10px] rounded px-1.5 py-0.5 ${
                entry.isPlayer ? 'bg-red-900/40 border border-red-600/30' : 'bg-gray-800/30'
              }`}
            >
              <span className={`w-4 text-center font-bold ${
                i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-orange-400' : 'text-gray-500'
              }`}>
                {entry.rank}
              </span>
              <span className={`flex-1 truncate ${entry.isPlayer ? 'text-red-300 font-bold' : 'text-gray-400'}`}>
                {entry.isPlayer ? '你' : entry.name}
              </span>
              <span className="text-gray-500">{entry.violations}🚦</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 折叠模式：只显示玩家名次
  return (
    <button
      onClick={() => setExpanded(true)}
      className="bg-black/60 backdrop-blur rounded-lg border border-gray-700/50 px-2.5 py-1.5 flex items-center gap-1.5 hover:bg-black/80 transition-colors"
    >
      <Trophy size={12} className="text-yellow-400" />
      <span className="text-[10px] text-gray-300">
        排名 <span className={`font-bold ${playerEntry.rank <= 3 ? 'text-yellow-400' : playerEntry.rank <= 8 ? 'text-gray-300' : 'text-red-400'}`}>{playerEntry.rank}</span>
      </span>
      <span className="text-gray-600 text-[8px]">|</span>
      <span className="text-[10px] text-gray-400">{playerViolations}🚦</span>
      {playerEntry.rank > 8 ? (
        <TrendingDown size={10} className="text-red-500" />
      ) : (
        <TrendingUp size={10} className="text-gray-500" />
      )}
      <ChevronDown size={12} className="text-gray-600 ml-0.5" />
    </button>
  );
}
