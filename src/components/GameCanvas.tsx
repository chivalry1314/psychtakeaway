import { useEffect, useRef, useCallback, useState } from 'react';
import type { GameState, Achievement } from '@/types/game';
import { updateGame, renderGame, renderMinimap, initLevel } from '@/game/engine/GameEngine';
import { LEVELS } from '@/game/levels/levels';
import AchievementPopup from '@/components/effects/AchievementPopup';
import ComboDisplay from '@/components/effects/ComboDisplay';
import LurePopup from '@/components/effects/LurePopup';
import TauntBar from '@/components/effects/TauntBar';
import Leaderboard from '@/components/effects/Leaderboard';
import HeartbeatEffect from '@/components/effects/HeartbeatEffect';
import {
  Heart, DollarSign, Package, Clock, AlertTriangle,
  Pause, Play, Home, RotateCcw
} from 'lucide-react';

interface GameCanvasProps {
  initialState: GameState;
  onStateChange: (state: GameState) => void;
  onMainMenu: () => void;
}

const globalKeys = new Set<string>();
let globalTouch: { x: number; y: number } | null = null;

export default function GameCanvas({ initialState, onStateChange, onMainMenu }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const minimapRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const gameRef = useRef<GameState>(initialState);
  const [renderState, setRenderState] = useState<GameState>(initialState);
  const lastHudSyncRef = useRef(0);

  const showAchRef = useRef(false);
  const [lastAchievement, setLastAchievement] = useState<Achievement | null>(null);
  const shownAchIds = useRef<Set<string>>(new Set());

  // 性能优化：后台暂停
  const isVisibleRef = useRef(true);

  const forceHudUpdate = useCallback(() => {
    setRenderState({ ...gameRef.current });
    onStateChange({ ...gameRef.current });
  }, [onStateChange]);

  // ==================== 游戏循环（性能优化版）====================
  useEffect(() => {
    const gameLoop = (timestamp: number) => {
      if (!isVisibleRef.current) {
        // 后台时暂停，恢复时重置时间
        lastTimeRef.current = 0;
        animFrameRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      const canvasW = canvasRef.current.width;
      const canvasH = canvasRef.current.height;

      if (lastTimeRef.current === 0) lastTimeRef.current = timestamp;
      const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = timestamp;

      const gs = gameRef.current;
      gs.keys = globalKeys;
      gs.touchInput = globalTouch;

      if (gs.screen === 'PLAYING' && !gs.paused) {
        updateGame(gs, dt, canvasW, canvasH);

        const newlyUnlocked = gs.achievements.find(
          a => a.unlocked && a.showPopup && !shownAchIds.current.has(a.id)
        );
        if (newlyUnlocked && !showAchRef.current) {
          showAchRef.current = true;
          shownAchIds.current.add(newlyUnlocked.id);
          setLastAchievement({ ...newlyUnlocked });
        }

        if (gs.screen !== 'PLAYING') forceHudUpdate();
      }

      renderGame(ctx, gs, canvasW, canvasH);

      // 小地图降低频率：每 250ms 更新一次
      if (minimapRef.current) {
        const mc = minimapRef.current as HTMLCanvasElement & { _lastUpdate?: number };
        if (!mc._lastUpdate) mc._lastUpdate = 0;
        if (timestamp - mc._lastUpdate > 250) {
          mc._lastUpdate = timestamp;
          const mmCtx = minimapRef.current.getContext('2d');
          if (mmCtx) renderMinimap(mmCtx, gs, 0, 0, 150, 120);
        }
      }

      // HUD 同步从 100ms 改为 500ms（2fps 足够显示数字变化）
      if (timestamp - lastHudSyncRef.current > 500) {
        lastHudSyncRef.current = timestamp;
        setRenderState({ ...gameRef.current });
      }

      animFrameRef.current = requestAnimationFrame(gameLoop);
    };

    lastTimeRef.current = 0;
    animFrameRef.current = requestAnimationFrame(gameLoop);
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [forceHudUpdate]);

  // 后台暂停：切出页面时暂停游戏循环
  useEffect(() => {
    const onVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
      if (!document.hidden) {
        lastTimeRef.current = 0; // 重置时间防止 dt 爆炸
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  // 组件挂载/卸载时清空全局输入状态，防止切关或重启时方向键卡住
  useEffect(() => {
    globalKeys.clear();
    globalTouch = null;
    return () => {
      globalKeys.clear();
      globalTouch = null;
    };
  }, []);

  // 键盘输入
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      globalKeys.add(e.key.toLowerCase());
      if (e.key === 'p' || e.key === 'Escape') {
        gameRef.current.paused = !gameRef.current.paused;
        forceHudUpdate();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      globalKeys.delete(e.key.toLowerCase());
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [forceHudUpdate]);

  // Canvas尺寸
  useEffect(() => {
    const resize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // 触摸输入
  useEffect(() => {
    let trackingTouchId: number | null = null;
    let startX = 0;
    let startY = 0;

    const onTouchStart = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.clientX < window.innerWidth * 0.5 && trackingTouchId === null) {
          trackingTouchId = t.identifier;
          startX = t.clientX;
          startY = t.clientY;
          globalTouch = { x: 0, y: 0 };
          e.preventDefault();
          break;
        }
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (trackingTouchId === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === trackingTouchId) {
          const dx = t.clientX - startX;
          const dy = t.clientY - startY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 10) {
            globalTouch = { x: dx / dist, y: dy / dist };
          }
          e.preventDefault();
          break;
        }
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === trackingTouchId) {
          trackingTouchId = null;
          globalTouch = null;
          break;
        }
      }
    };

    window.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', onTouchEnd);

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
    };
  }, []);

  // 暂停/恢复/重启
  const handlePause = useCallback(() => {
    gameRef.current.paused = true;
    forceHudUpdate();
  }, [forceHudUpdate]);
  const handleResume = useCallback(() => {
    gameRef.current.paused = false;
    forceHudUpdate();
  }, [forceHudUpdate]);
  const handleRestart = useCallback(() => {
    const gs = gameRef.current;
    initLevel(gs, gs.currentLevel);
    gs.paused = false;
    globalKeys.clear();
    globalTouch = null;
    showAchRef.current = false;
    shownAchIds.current.clear();
    setLastAchievement(null);
    forceHudUpdate();
  }, [forceHudUpdate]);
  const handleLureClose = useCallback(() => {
    gameRef.current.showLurePopup = false;
  }, []);
  const handleAchClose = useCallback(() => {
    showAchRef.current = false;
    setLastAchievement(null);
  }, []);

  const gs = renderState;
  const activeOrders = gs.orders.filter(o => o.status === 'PENDING' || o.status === 'PICKED_UP');
  const level = LEVELS[gs.currentLevel - 1];

  return (
    <div className="fixed inset-0 bg-black" style={{ touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}>
      <HeartbeatEffect intensity={gs.heartbeatIntensity} />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" style={{ touchAction: 'none' }} />

      {/* 触摸控制区域提示 */}
      {gs.screen === 'PLAYING' && !gs.paused && (
        <div className="fixed z-40 pointer-events-none" style={{ left: 0, bottom: 0, width: '50%', height: '60%' }}>
          <div className="absolute bottom-8 left-8 w-24 h-24 rounded-full border-2 border-white/20 bg-white/5 flex items-center justify-center" style={{ backdropFilter: 'blur(2px)' }}>
            <span className="text-white/30 text-xs text-center">触摸此区域<br />控制移动</span>
          </div>
        </div>
      )}

      {/* 左上：状态 */}
      <div className="absolute top-3 left-3 z-20 space-y-1.5 pointer-events-none">
        <div className="flex items-center gap-1 bg-black/60 backdrop-blur rounded-lg px-2.5 py-1.5">
          {[1, 2, 3].map(i => (
            <Heart key={i} size={16} className={i <= Math.ceil(gs.player.health) ? 'text-red-500 fill-red-500' : 'text-gray-600'} />
          ))}
        </div>
        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur rounded-lg px-2.5 py-1.5">
          <DollarSign size={14} className="text-yellow-400" />
          <span className="text-yellow-400 font-bold text-sm">¥{gs.todayIncome}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur rounded-lg px-2.5 py-1.5">
          <Package size={14} className="text-blue-400" />
          <span className="text-blue-400 font-bold text-xs">{gs.completedOrders}/{level?.targetOrders || 0}单</span>
        </div>
        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur rounded-lg px-2.5 py-1.5">
          <AlertTriangle size={14} className="text-orange-400" />
          <span className="text-orange-400 font-bold text-xs">违规 {gs.violations}次</span>
        </div>
        <ComboDisplay streak={gs.violationStreak} />
      </div>

      {/* 右上：第X天 + 暂停 + 小地图 + 排行榜 */}
      <div className="absolute top-3 right-3 z-20 space-y-2">
        <div className="flex items-center gap-2">
          <div className="bg-black/60 backdrop-blur rounded-lg px-2 py-1 text-white text-xs font-bold">
            第{gs.currentLevel}天
          </div>
          <button onClick={handlePause} className="flex items-center gap-1.5 bg-black/60 backdrop-blur hover:bg-black/80 rounded-lg px-2.5 py-1.5 text-white transition-colors">
            <Pause size={14} /><span className="text-xs">暂停</span>
          </button>
        </div>
        <canvas ref={minimapRef} width={150} height={120} className="rounded-lg border border-gray-600/50 bg-black/60" />
        <Leaderboard entries={gs.leaderboard} playerViolations={gs.violations} completedOrders={gs.completedOrders} />
      </div>

      {/* 右下：订单 */}
      <div className="absolute bottom-3 right-4 z-20 space-y-1 max-w-[200px] pointer-events-none">
        {activeOrders.slice(0, 3).map(order => (
          <div key={order.id} className={`rounded-lg px-2.5 py-1.5 backdrop-blur text-xs ${order.status === 'PENDING' ? 'bg-green-900/60 border border-green-700/50' : 'bg-red-900/60 border border-red-700/50'}`}>
            <div className="flex items-center gap-1.5 text-white">
              {order.status === 'PENDING'
                ? <><span className="text-green-400 font-bold">取</span><span>{order.restaurantName}</span></>
                : <><span className="text-red-400 font-bold">送</span><span>{order.customerName}</span></>
              }
            </div>
            {level?.showTimer !== false && (
              <div className={`text-[10px] mt-0.5 ${order.timeRemaining < 20 ? 'text-red-400 animate-pulse' : 'text-gray-400'}`}>
                <Clock size={9} className="inline mr-0.5" />剩余 {Math.ceil(order.timeRemaining)}秒
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 中下：系统通知 */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 space-y-1 w-full max-w-sm px-4 pointer-events-none">
        {gs.notifications.slice(-2).map(n => (
          <div key={n.id} className={`rounded-lg px-3 py-1 text-[11px] font-medium text-center backdrop-blur ${n.type === 'danger' ? 'bg-red-900/80 text-red-200 border border-red-700/50' : n.type === 'warning' ? 'bg-yellow-900/80 text-yellow-200 border border-yellow-700/50' : n.type === 'success' ? 'bg-green-900/80 text-green-200 border border-green-700/50' : 'bg-blue-900/80 text-blue-200 border border-blue-700/50'}`}>
            {n.text}
          </div>
        ))}
      </div>

      {/* 催命弹幕 */}
      <TauntBar messages={gs.tauntMessages} />

      {/* 逆行警告 */}
      {gs.player.isWrongWay && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="bg-red-900/80 border-2 border-red-500 rounded-lg px-5 py-2.5 animate-pulse">
            <span className="text-red-200 font-bold">⚠️ 逆行警告！速度已降低</span>
          </div>
        </div>
      )}

      {/* 覆盖层 */}
      <AchievementPopup key={lastAchievement?.id ?? 'none'} achievement={lastAchievement} onClose={handleAchClose} />
      {gs.showLurePopup && (
        <LurePopup show={gs.showLurePopup} redLightTime={parseFloat(gs.lurePopupText.replace(/[^0-9]/g, '')) || 10} onProceed={handleLureClose} />
      )}

      {/* 暂停菜单 */}
      {gs.paused && gs.screen === 'PLAYING' && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-xs mx-4">
            <h2 className="text-xl font-bold text-white text-center mb-5">暂停</h2>
            <div className="space-y-2.5">
              <button onClick={handleResume} className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors">
                <Play size={16} /> 继续游戏
              </button>
              <button onClick={handleRestart} className="w-full flex items-center justify-center gap-2 py-2.5 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-lg transition-colors">
                <RotateCcw size={16} /> 重新开始
              </button>
              <button onClick={onMainMenu} className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors">
                <Home size={16} /> 返回主菜单
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
