import { useEffect, useState, useMemo } from 'react';
import { Award, X } from 'lucide-react';
import type { Achievement } from '@/types/game';

interface AchievementPopupProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export default function AchievementPopup({ achievement, onClose }: AchievementPopupProps) {
  const [visible, setVisible] = useState(true);

  // 基于成就 ID 生成确定性的礼花粒子，避免在渲染中调用 Math.random
  const particles = useMemo(() => {
    if (!achievement) return [];
    return Array.from({ length: 30 }, (_, i) => {
      const seed = achievement.id.charCodeAt(i % achievement.id.length) + i * 17;
      return {
        id: i,
        x: seed % 100,
        y: (seed * 7) % 100,
        delay: (seed % 50) / 100,
        tx: (seed % 200) - 100,
        ty: ((seed * 3) % 200) - 100,
      };
    });
  }, [achievement]);

  useEffect(() => {
    if (!achievement) return;
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 3500);
    return () => clearTimeout(timer);
  }, [achievement, onClose]);

  if (!achievement || !visible) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
      {/* 背景暗化 */}
      <div className="absolute inset-0 bg-black/40 animate-in fade-in duration-300" />

      {/* 礼花粒子 */}
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute w-2 h-2 rounded-full animate-in zoom-in"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            backgroundColor: ['#FFD700', '#FF6B35', '#FF4500', '#FFA500', '#FF1493', '#00FF7F'][p.id % 6],
            animationDelay: `${p.delay}s`,
            animation: `particleBurst 1s ease-out ${p.delay}s both`,
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
          } as React.CSSProperties}
        />
      ))}

      {/* 主弹窗 */}
      <div
        className={`
          relative z-50 bg-gray-900/95 border-2 border-yellow-500/60 rounded-2xl
          p-8 max-w-sm w-full mx-4 text-center pointer-events-auto
          animate-in zoom-in-95 duration-500
        `}
        style={{
          boxShadow: '0 0 60px rgba(255, 215, 0, 0.3), 0 0 120px rgba(255, 107, 53, 0.15)',
        }}
      >
        {/* 关闭按钮 */}
        <button
          onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
          className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        {/* 成就图标 */}
        <div className="text-6xl mb-4 animate-bounce">{achievement.icon}</div>

        {/* 标题 */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <Award size={20} className="text-yellow-400" />
          <span className="text-yellow-400 font-bold text-sm tracking-wider">成就解锁</span>
          <Award size={20} className="text-yellow-400" />
        </div>

        {/* 成就名称 */}
        <h2
          className="text-2xl font-black text-white mb-2"
          style={{ textShadow: '0 0 20px rgba(255, 215, 0, 0.5)' }}
        >
          {achievement.name}
        </h2>

        {/* 描述 */}
        <p className="text-gray-400 text-sm mb-4">{achievement.description}</p>

        {/* 奖励 */}
        <div className="inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/40 rounded-full px-5 py-2">
          <span className="text-yellow-400 text-xl font-bold">+{achievement.reward}元</span>
        </div>

        {/* 讽刺标语 */}
        <p className="text-gray-600 text-xs mt-4 italic">
          系统提示：继续闯红灯，解锁更多成就！
        </p>
      </div>

      <style>{`
        @keyframes particleBurst {
          0% { transform: scale(0) translate(0, 0); opacity: 1; }
          50% { opacity: 1; }
          100% { transform: scale(1.5) translate(var(--tx), var(--ty)); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
