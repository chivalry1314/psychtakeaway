import { useEffect, useState } from 'react';
import { AlertTriangle, ChevronRight, Shield } from 'lucide-react';

interface LurePopupProps {
  show: boolean;
  redLightTime: number;
  onProceed: () => void;
}

export default function LurePopup({ show, redLightTime, onProceed }: LurePopupProps) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!show) return;
    const interval = setInterval(() => setPulse(p => !p), 600);
    return () => clearInterval(interval);
  }, [show]);

  if (!show) return null;

  const savedTime = Math.floor(redLightTime * 0.83);

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/30" />

      <div
        className={`
          relative z-40 max-w-xs w-full mx-4 rounded-xl overflow-hidden
          pointer-events-auto transform transition-transform duration-200
          ${pulse ? 'scale-105' : 'scale-100'}
        `}
        style={{
          boxShadow: '0 0 40px rgba(255, 107, 53, 0.4)',
        }}
      >
        {/* 头部 - 系统提示 */}
        <div className="bg-green-800/90 px-4 py-2 flex items-center gap-2">
          <AlertTriangle size={14} className="text-green-300" />
          <span className="text-green-300 text-xs font-bold">系统智能推荐</span>
        </div>

        {/* 内容 */}
        <div className="bg-gray-900/95 px-5 py-4">
          <p className="text-gray-300 text-sm mb-1">
            前方红灯 · 预计等待 <span className="text-red-400 font-bold">{Math.ceil(redLightTime)}秒</span>
          </p>

          <div className="bg-red-900/20 rounded-lg p-2 mb-3 text-center">
            <p className="text-red-400 text-xs">
              等红灯可能导致超时扣款 <span className="font-bold">-20元</span>
            </p>
          </div>

          {/* 两个按钮 - 巨大的对比 */}
          <div className="space-y-2">
            {/* 冲过去 - 巨大发光 */}
            <button
              onClick={onProceed}
              className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-all animate-pulse"
              style={{
                boxShadow: '0 0 20px rgba(255, 107, 53, 0.5)',
                fontSize: '16px',
              }}
            >
              <ChevronRight size={20} />
              冲过去！节省{savedTime}秒
              <span className="text-yellow-300 text-xs">(推荐)</span>
            </button>

            {/* 等红灯 - 小且灰暗 */}
            <button
              onClick={onProceed}
              className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-gray-500 text-xs rounded-lg flex items-center justify-center gap-1 transition-colors"
            >
              <Shield size={12} />
              安全等红灯（可能超时）
            </button>
          </div>

          {/* 统计数据 */}
          <p className="text-gray-600 text-[10px] text-center mt-2">
            92%的Top骑手选择了冲过去 · 本区域平均闯红灯率87%
          </p>
        </div>
      </div>
    </div>
  );
}
