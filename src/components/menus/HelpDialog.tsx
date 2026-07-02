import { X, AlertTriangle, Clock, DollarSign, Heart, Navigation } from 'lucide-react';

interface HelpDialogProps {
  onClose: () => void;
}

export default function HelpDialog({ onClose }: HelpDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-5 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <AlertTriangle size={20} className="text-yellow-400" />
            游戏说明
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-5 space-y-5 text-gray-300">
          <section>
            <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
              <Navigation size={16} className="text-blue-400" />
              操作方式
            </h3>
            <ul className="space-y-1 text-sm">
              <li><span className="text-yellow-400 font-mono">WASD</span> 或 <span className="text-yellow-400 font-mono">方向键</span> — 移动</li>
              <li>靠近 <span className="text-green-400">绿色边框</span> 的商家自动取餐</li>
              <li>靠近 <span className="text-red-400">红色边框</span> 的顾客自动送餐</li>
            </ul>
          </section>

          <section>
            <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
              <Clock size={16} className="text-orange-400" />
              核心机制
            </h3>
            <p className="text-sm leading-relaxed">
              你是一个外卖骑手。系统会给你派发订单，你需要在规定时间内从商家取餐并送到顾客手中。
              <span className="text-red-400 font-bold"> 但是 </span>
              如果严格遵守交通规则（等红灯、不逆行），你几乎不可能完成任务。
            </p>
          </section>

          <section>
            <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
              <DollarSign size={16} className="text-green-400" />
              经济系统
            </h3>
            <ul className="space-y-1 text-sm">
              <li><span className="text-green-400">+5元</span> 基础配送费</li>
              <li><span className="text-green-400">+?元</span> 准时奖（按剩余时间）</li>
              <li><span className="text-red-400">-?元</span> 超时罚款</li>
              <li><span className="text-red-400">-50元</span> 车辆刮蹭维修费</li>
            </ul>
          </section>

          <section>
            <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
              <Heart size={16} className="text-red-400" />
              生命值
            </h3>
            <p className="text-sm">
              你有3点生命。被车辆刮蹭扣除0.5点，被卡车或高速撞击直接死亡。闯红灯时屏幕边缘会泛红警告。
            </p>
          </section>

          <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-3">
            <p className="text-yellow-300 text-sm font-medium">
              ⚠️ 警告：本游戏模拟了外卖骑手面临的真实困境。游戏中鼓励违规的系统提示，正是现实中"游戏化"管理的讽刺写照。
            </p>
          </div>
        </div>

        {/* 底部 */}
        <div className="p-5 border-t border-gray-700">
          <button
            onClick={onClose}
            className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors"
          >
            我明白了
          </button>
        </div>
      </div>
    </div>
  );
}
