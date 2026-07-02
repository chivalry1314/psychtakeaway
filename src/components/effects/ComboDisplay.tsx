import { Flame, Zap } from 'lucide-react';

interface ComboDisplayProps {
  streak: number;
}

export default function ComboDisplay({ streak }: ComboDisplayProps) {
  if (streak < 2) return null;

  const isHigh = streak >= 5;
  const isExtreme = streak >= 10;

  return (
    <div
      className={`
        flex items-center gap-2 rounded-lg px-3 py-2
        ${isExtreme ? 'bg-red-900/70 border-2 border-red-500 animate-pulse' :
          isHigh ? 'bg-orange-900/60 border border-orange-500/60' :
          'bg-yellow-900/50 border border-yellow-600/40'}
      `}
    >
      {isExtreme ? (
        <Zap size={16} className="text-red-400 fill-red-400 animate-bounce" />
      ) : (
        <Flame size={16} className={`${isHigh ? 'text-orange-400' : 'text-yellow-400'} fill-current`} />
      )}
      <div className="flex flex-col">
        <span className={`font-black text-sm leading-none ${isExtreme ? 'text-red-300' : isHigh ? 'text-orange-300' : 'text-yellow-300'}`}>
          闯红灯 x{streak}
        </span>
        {streak >= 3 && (
          <span className="text-[10px] text-yellow-500/80">
            +{Math.floor(streak * 0.5)}元 Combo奖励
          </span>
        )}
      </div>
    </div>
  );
}
