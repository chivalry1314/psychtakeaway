import { useRef, useCallback, useState, useEffect } from 'react';
import { Move } from 'lucide-react';

interface VirtualJoystickProps {
  onMove: (dx: number, dy: number) => void;
  onEnd: () => void;
}

/**
 * 虚拟摇杆 - 直接在window级别追踪触摸，不依赖React事件冒泡
 * 这样可以避免被其他元素（如Canvas、特效层）遮挡导致的事件丢失
 */
export default function VirtualJoystick({ onMove, onEnd }: VirtualJoystickProps) {
  const [active, setActive] = useState(false);
  const [stickPos, setStickPos] = useState({ x: 0, y: 0 });
  const trackingRef = useRef<{ touchId: number; startX: number; startY: number } | null>(null);

  const MAX_DIST = 45;

  // 计算摇杆区域在屏幕上的位置（用于判断触摸点是否在摇杆内）
  const getJoystickArea = () => {
    const size = 112; // w-28 = 7rem = 112px
    const left = 32;  // left-8 = 2rem = 32px
    const bottom = 80; // bottom-20 = 5rem = 80px
    const top = window.innerHeight - bottom - size;
    return { left, top, right: left + size, bottom: top + size, cx: left + size / 2, cy: top + size / 2 };
  };

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const area = getJoystickArea();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (t.clientX >= area.left - 20 && t.clientX <= area.right + 20 &&
          t.clientY >= area.top - 20 && t.clientY <= area.bottom + 20) {
        // 触摸在摇杆区域内
        trackingRef.current = { touchId: t.identifier, startX: t.clientX, startY: t.clientY };
        setActive(true);
        setStickPos({ x: 0, y: 0 });
        e.preventDefault();
        break;
      }
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!trackingRef.current) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (t.identifier === trackingRef.current.touchId) {
        let dx = t.clientX - trackingRef.current.startX;
        let dy = t.clientY - trackingRef.current.startY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > MAX_DIST) {
          dx = (dx / dist) * MAX_DIST;
          dy = (dy / dist) * MAX_DIST;
        }

        setStickPos({ x: dx, y: dy });

        const outX = dist > 8 ? dx / MAX_DIST : 0;
        const outY = dist > 8 ? dy / MAX_DIST : 0;
        onMove(outX, outY);
        e.preventDefault();
        break;
      }
    }
  }, [onMove]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!trackingRef.current) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === trackingRef.current.touchId) {
        trackingRef.current = null;
        setActive(false);
        setStickPos({ x: 0, y: 0 });
        onEnd();
        break;
      }
    }
  }, [onEnd]);

  // 使用原生window事件，避免React事件系统的问题
  useJoystickTouchEvents(handleTouchStart, handleTouchMove, handleTouchEnd);

  return (
    <div
      className="fixed z-40 select-none"
      style={{
        left: 32,
        bottom: 80,
        width: 112,
        height: 112,
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        pointerEvents: 'none', // 让事件穿透，我们在window级别处理
      }}
    >
      {/* 底座 */}
      <div
        className={`
          w-28 h-28 rounded-full border-2 flex items-center justify-center
          transition-all duration-150
          ${active ? 'bg-white/20 border-white/50' : 'bg-white/10 border-white/30'}
        `}
        style={{ backdropFilter: 'blur(4px)' }}
      >
        {!active && <Move size={20} className="text-white/40" />}
      </div>
      {/* 摇杆头 */}
      <div
        className={`
          absolute top-1/2 left-1/2 rounded-full
          transition-all duration-75
          ${active ? 'bg-red-500/80 shadow-lg shadow-red-500/30 scale-110' : 'bg-white/30 scale-100'}
        `}
        style={{
          width: 48,
          height: 48,
          marginTop: -24,
          marginLeft: -24,
          transform: `translate(${stickPos.x}px, ${stickPos.y}px)`,
        }}
      />
    </div>
  );
}

/** 在window级别注册触摸事件 */
function useJoystickTouchEvents(
  onStart: (e: TouchEvent) => void,
  onMove: (e: TouchEvent) => void,
  onEnd: (e: TouchEvent) => void,
) {
  const startRef = useRef(onStart);
  const moveRef = useRef(onMove);
  const endRef = useRef(onEnd);

  // 保持回调引用最新
  useEffect(() => {
    startRef.current = onStart;
    moveRef.current = onMove;
    endRef.current = onEnd;
  }, [onStart, onMove, onEnd]);

  useEffect(() => {
    const wrapStart = (e: TouchEvent) => startRef.current(e);
    const wrapMove = (e: TouchEvent) => moveRef.current(e);
    const wrapEnd = (e: TouchEvent) => endRef.current(e);

    window.addEventListener('touchstart', wrapStart, { passive: false });
    window.addEventListener('touchmove', wrapMove, { passive: false });
    window.addEventListener('touchend', wrapEnd, { passive: false });
    window.addEventListener('touchcancel', wrapEnd, { passive: false });

    return () => {
      window.removeEventListener('touchstart', wrapStart);
      window.removeEventListener('touchmove', wrapMove);
      window.removeEventListener('touchend', wrapEnd);
      window.removeEventListener('touchcancel', wrapEnd);
    };
  }, []);
}
