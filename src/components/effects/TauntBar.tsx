import { MessageCircle, Angry, AlertCircle } from 'lucide-react';
import type { TauntMessage } from '@/types/game';

interface TauntBarProps {
  messages: TauntMessage[];
}

export default function TauntBar({ messages }: TauntBarProps) {
  const visibleMessages = messages.slice(-3);

  if (visibleMessages.length === 0) return null;

  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 w-full max-w-sm px-4 pointer-events-none space-y-1.5">
      {visibleMessages.map((msg, i) => (
        <div
          key={msg.id}
          className={`
            flex items-center gap-2 rounded-lg px-3 py-1.5 backdrop-blur
            animate-in slide-in-from-bottom-2 fade-in duration-300
            ${msg.intensity >= 5 ? 'bg-red-900/80 border border-red-600/60' :
              msg.intensity >= 4 ? 'bg-orange-900/70 border border-orange-600/50' :
              msg.intensity >= 3 ? 'bg-yellow-900/60 border border-yellow-700/40' :
              'bg-gray-800/60 border border-gray-700/40'}
          `}
          style={{ animationDelay: `${i * 100}ms` }}
        >
          {msg.intensity >= 5 ? (
            <Angry size={13} className="text-red-400 flex-shrink-0" />
          ) : msg.intensity >= 3 ? (
            <AlertCircle size={13} className="text-orange-400 flex-shrink-0" />
          ) : (
            <MessageCircle size={13} className="text-gray-400 flex-shrink-0" />
          )}
          <span className={`text-xs font-medium ${msg.intensity >= 5 ? 'text-red-200' : msg.intensity >= 3 ? 'text-orange-200' : 'text-gray-300'}`}>
            <span className="opacity-60 mr-1">{msg.customerName}:</span>
            {msg.text}
          </span>
        </div>
      ))}
    </div>
  );
}
