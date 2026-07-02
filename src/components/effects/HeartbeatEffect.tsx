import { useMemo } from 'react';

interface HeartbeatEffectProps {
  intensity: number; // 0-1
}

/**
 * 心跳效果 - 使用 CSS animation 替代 JS 计算
 * 大幅降低 GPU/CPU 负载
 */
export default function HeartbeatEffect({ intensity }: HeartbeatEffectProps) {
  // 用 useMemo 缓存样式计算（只在 intensity 变化时重新计算）
  const style = useMemo(() => {
    if (intensity < 0.15) return null;
    const opacity = Math.min(intensity * 0.35, 0.4);
    // CSS animation 的 duration 随 intensity 变化（越紧迫跳得越快）
    const duration = Math.max(0.4, 1.2 - intensity);
    return {
      opacity,
      animationDuration: `${duration}s`,
    };
  }, [intensity]);

  if (!style) return null;

  return (
    <div className="fixed inset-0 z-10 pointer-events-none heartbeat-container"
      style={{
        background: `radial-gradient(ellipse at center, transparent 40%, rgba(230, 57, 70, ${style.opacity}) 100%)`,
        boxShadow: `inset 0 0 ${40 + intensity * 60}px rgba(230, 57, 70, ${style.opacity * 0.8})`,
        animation: `heartbeatPulse ${style.animationDuration}s ease-in-out infinite`,
      }}
    />
  );
}
