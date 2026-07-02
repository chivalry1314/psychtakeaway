import { ArrowLeft, Lock, Star, Bike, AlertTriangle } from 'lucide-react';
import { LEVELS } from '@/game/levels/levels';

interface LevelSelectProps {
  unlockedLevel: number;
  onSelectLevel: (levelId: number) => void;
  onBack: () => void;
}

export default function LevelSelect({ unlockedLevel, onSelectLevel, onBack }: LevelSelectProps) {
  return (
    <div className="fixed inset-0 z-50 bg-gray-900 overflow-y-auto">
      {/* 头部 */}
      <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>返回</span>
          </button>
          <h1 className="text-xl font-bold text-white">工作日程表</h1>
          <div className="w-20" />
        </div>
      </div>

      {/* 关卡列表 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 主题说明 */}
        <div className="mb-8 p-4 bg-red-900/20 border border-red-800/40 rounded-lg">
          <p className="text-red-300 text-sm flex items-center gap-2">
            <AlertTriangle size={16} />
            <span>每一天的工作压力都会增加。房租在涨，时间在缩短，规则在收紧。</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {LEVELS.map((level) => {
            const isUnlocked = level.id <= unlockedLevel;
            const isCompleted = level.id < unlockedLevel;

            return (
              <button
                key={level.id}
                onClick={() => isUnlocked && onSelectLevel(level.id)}
                disabled={!isUnlocked}
                className={`
                  relative p-5 rounded-xl border text-left transition-all duration-300
                  ${isUnlocked
                    ? 'border-gray-600 hover:border-red-500 hover:bg-gray-800/50 cursor-pointer'
                    : 'border-gray-800 bg-gray-800/20 cursor-not-allowed opacity-50'
                  }
                  ${isCompleted ? 'bg-green-900/10 border-green-800/40' : ''}
                `}
              >
                {/* 状态图标 */}
                {!isUnlocked && (
                  <div className="absolute top-4 right-4 text-gray-600">
                    <Lock size={20} />
                  </div>
                )}
                {isCompleted && (
                  <div className="absolute top-4 right-4 text-green-400">
                    <Star size={20} fill="currentColor" />
                  </div>
                )}

                {/* 关卡信息 */}
                <div className="flex items-start gap-4">
                  <div className={`
                    w-12 h-12 rounded-lg flex items-center justify-center text-lg font-black
                    ${isUnlocked ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-500'}
                  `}>
                    {isUnlocked ? level.id : '?'}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold text-lg ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                      {level.name}
                    </h3>
                    <p className={`text-sm mt-0.5 ${isUnlocked ? 'text-gray-400' : 'text-gray-600'}`}>
                      {level.theme}
                    </p>
                    <p className={`text-xs mt-2 ${isUnlocked ? 'text-gray-500' : 'text-gray-700'}`}>
                      {level.description}
                    </p>

                    {/* 关卡数据 */}
                    {isUnlocked && (
                      <div className="flex flex-wrap gap-3 mt-3 text-xs">
                        <span className="flex items-center gap-1 text-blue-400">
                          <Bike size={12} />
                          目标{level.targetOrders}单
                        </span>
                        <span className="text-orange-400">
                          房租 ¥{level.rentCost}
                        </span>
                        {level.specialMechanic && (
                          <span className="text-yellow-400 bg-yellow-900/30 px-2 py-0.5 rounded">
                            {level.specialMechanic}
                          </span>
                        )}
                        {level.weather === 'RAIN' && (
                          <span className="text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded">
                            雨天
                          </span>
                        )}
                        {level.weather === 'NIGHT' && (
                          <span className="text-purple-400 bg-purple-900/30 px-2 py-0.5 rounded">
                            夜晚
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
