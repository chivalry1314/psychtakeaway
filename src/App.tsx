import { useState, useCallback } from 'react';
import type { GameState } from '@/types/game';
import {
  createInitialState,
  initLevel,
  loadSave,
  saveSave,
} from '@/game/engine/GameEngine';
import MainMenu from '@/components/menus/MainMenu';
import HelpDialog from '@/components/menus/HelpDialog';
import LevelSelect from '@/components/menus/LevelSelect';
import StoryDialogue from '@/components/menus/StoryDialogue';
import GameCanvas from '@/components/GameCanvas';
import GameOver from '@/components/menus/GameOver';
import LevelComplete from '@/components/menus/LevelComplete';
import AchievementHall from '@/components/menus/AchievementHall';
import { LEVELS } from '@/game/levels/levels';

export default function App() {
  const save = loadSave();
  const [state, setState] = useState<GameState>(() => {
    const s = createInitialState();
    s.unlockedLevel = save.unlockedLevel;
    s.stats = save.stats;
    return s;
  });
  const [showHelp, setShowHelp] = useState(false);

  // 导航
  const goToMainMenu = useCallback(() => {
    setState(prev => {
      saveSave(prev.unlockedLevel, prev.stats);
      return { ...prev, screen: 'MAIN_MENU', paused: false };
    });
  }, []);

  const goToLevelSelect = useCallback(() => {
    setState(prev => ({ ...prev, screen: 'LEVEL_SELECT' }));
  }, []);

  const goToAchievements = useCallback(() => {
    setState(prev => {
      saveSave(prev.unlockedLevel, prev.stats);
      return { ...prev, screen: 'ACHIEVEMENT_HALL', paused: false };
    });
  }, []);

  const selectLevel = useCallback((levelId: number) => {
    const level = LEVELS[levelId - 1];
    if (!level) return;
    setState(prev => ({
      ...prev,
      currentLevel: levelId,
      currentDialogue: level.openingDialogue,
      dialogueIndex: 0,
      screen: 'STORY',
    }));
  }, []);

  const startLevel = useCallback(() => {
    setState(prev => {
      const newState = { ...prev };
      initLevel(newState, newState.currentLevel);
      newState.screen = 'PLAYING';
      newState.paused = false;
      return newState;
    });
  }, []);

  // GameCanvas 状态变更回调
  const handleGameStateChange = useCallback((newState: GameState) => {
    setState(newState);
  }, []);

  // 下一关
  const goToNextLevel = useCallback(() => {
    setState(prev => {
      const nextLevel = prev.currentLevel + 1;
      const level = LEVELS[nextLevel - 1];
      const newUnlocked = Math.max(prev.unlockedLevel, nextLevel);
      saveSave(newUnlocked, prev.stats);
      if (level) {
        return {
          ...prev,
          currentLevel: nextLevel,
          unlockedLevel: newUnlocked,
          currentDialogue: level.openingDialogue,
          dialogueIndex: 0,
          screen: 'STORY' as const,
        };
      }
      return { ...prev, screen: 'MAIN_MENU' as const, unlockedLevel: newUnlocked };
    });
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden bg-black">
      {/* 主菜单 */}
      {state.screen === 'MAIN_MENU' && (
        <MainMenu
          onStart={goToLevelSelect}
          onHelp={() => setShowHelp(true)}
          onAchievements={goToAchievements}
        />
      )}

      {showHelp && <HelpDialog onClose={() => setShowHelp(false)} />}

      {/* 关卡选择 */}
      {state.screen === 'LEVEL_SELECT' && (
        <LevelSelect
          unlockedLevel={state.unlockedLevel}
          onSelectLevel={selectLevel}
          onBack={goToMainMenu}
        />
      )}

      {/* 剧情对话 */}
      {state.screen === 'STORY' && state.currentDialogue.length > 0 && (
        <StoryDialogue dialogue={state.currentDialogue} onComplete={startLevel} />
      )}

      {/* 游戏画面 - 核心玩法 */}
      {(state.screen === 'PLAYING' || state.screen === 'PAUSED') && (
        <GameCanvas
          initialState={state}
          onStateChange={handleGameStateChange}
          onMainMenu={goToMainMenu}
        />
      )}

      {/* 游戏结束覆盖层 */}
      {state.screen === 'GAME_OVER' && (
        <GameOver
          reason={state.gameOverReason || '你在送外卖途中倒下了。'}
          todayIncome={state.todayIncome}
          violations={state.violations}
          crashes={state.crashes}
          completedOrders={state.completedOrders}
          onRestart={() => {
            setState(prev => {
              const newState = { ...prev };
              initLevel(newState, newState.currentLevel);
              newState.screen = 'PLAYING';
              newState.paused = false;
              return newState;
            });
          }}
          onMainMenu={goToMainMenu}
        />
      )}

      {/* 关卡结算覆盖层 */}
      {state.screen === 'LEVEL_COMPLETE' && (
        <LevelComplete
          levelId={state.currentLevel}
          levelName={LEVELS[state.currentLevel - 1]?.name || ''}
          todayIncome={state.todayIncome}
          rentCost={state.rentCost}
          violations={state.violations}
          completedOrders={state.completedOrders}
          economyEvents={state.economyEvents}
          onNextLevel={goToNextLevel}
          onMainMenu={goToMainMenu}
          onViewAchievements={state.currentLevel === 10 ? goToAchievements : undefined}
        />
      )}

      {/* 成就殿堂 */}
      {state.screen === 'ACHIEVEMENT_HALL' && (
        <AchievementHall stats={state.stats} onMainMenu={goToMainMenu} />
      )}
    </div>
  );
}
