import { useState } from 'react';
import { ChevronRight, Bot, User } from 'lucide-react';
import type { DialogueLine } from '@/types/game';

interface StoryDialogueProps {
  dialogue: DialogueLine[];
  onComplete: () => void;
}

export default function StoryDialogue({ dialogue, onComplete }: StoryDialogueProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentLine = dialogue[currentIndex];
  const isLast = currentIndex >= dialogue.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (!currentLine) return null;

  const isSystem = currentLine.isSystem;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="max-w-2xl w-full mx-4">
        {/* 对话卡片 */}
        <div
          className={`
            rounded-xl border p-6 transition-all duration-300
            ${isSystem
              ? 'bg-green-900/20 border-green-700/40'
              : 'bg-gray-800/90 border-gray-600'
            }
          `}
        >
          {/* 说话者 */}
          <div className="flex items-center gap-3 mb-4">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center
              ${isSystem ? 'bg-green-600' : 'bg-blue-600'}
            `}>
              {isSystem ? <Bot size={20} className="text-white" /> : <User size={20} className="text-white" />}
            </div>
            <div>
              <span className={`
                font-bold text-sm
                ${isSystem ? 'text-green-400' : 'text-blue-400'}
              `}>
                {isSystem ? '「系统通知」' : currentLine.speaker}
              </span>
            </div>
          </div>

          {/* 对话内容 */}
          <p className="text-white text-lg leading-relaxed mb-6 min-h-[60px]">
            {currentLine.text}
          </p>

          {/* 进度和按钮 */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {dialogue.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentIndex ? 'bg-red-500' : i < currentIndex ? 'bg-gray-500' : 'bg-gray-700'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500
                         text-white font-bold rounded-lg transition-all duration-300
                         hover:scale-105"
            >
              <span>{isLast ? '开始工作' : '下一条'}</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* 打字效果提示 */}
        <div className="text-center mt-4 text-gray-500 text-sm">
          点击按钮继续...
        </div>
      </div>
    </div>
  );
}
