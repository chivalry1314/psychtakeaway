export default function GameGuide() {
  return (
    <div>
      <h1 className="text-3xl font-black text-white mb-4">游戏指南</h1>

      <h2 className="text-xl font-bold text-white mt-8 mb-3">操作方式</h2>
      <table className="w-full text-left text-sm text-gray-300 border border-gray-800 rounded-lg overflow-hidden mb-6">
        <thead className="bg-gray-900 text-gray-100">
          <tr>
            <th className="px-4 py-3 border-b border-gray-800">操作</th>
            <th className="px-4 py-3 border-b border-gray-800">说明</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          <tr><td className="px-4 py-3 font-mono">W / A / S / D 或方向键</td><td className="px-4 py-3">控制骑手移动</td></tr>
          <tr><td className="px-4 py-3 font-mono">P / Esc</td><td className="px-4 py-3">暂停 / 继续</td></tr>
          <tr><td className="px-4 py-3">触摸屏幕左半区域</td><td className="px-4 py-3">移动端虚拟摇杆</td></tr>
        </tbody>
      </table>

      <h2 className="text-xl font-bold text-white mt-8 mb-3">基本规则</h2>
      <ol className="list-decimal list-inside text-gray-300 space-y-2">
        <li>从餐厅取餐，再送到顾客手中。</li>
        <li>注意红绿灯：闯红灯会扣分、扣血，并积累“违规连击”。</li>
        <li>等红灯太久会被系统催单、扣钱。</li>
        <li>部分关卡有单行道，逆行会降低速度。</li>
        <li>完成目标订单数并赚取足够收入即可过关。</li>
      </ol>

      <h2 className="text-xl font-bold text-white mt-8 mb-3">隐喻说明</h2>
      <p className="text-gray-300 mb-4">
        游戏中的“房租”“算法时限”“催命弹幕”等元素，是对外卖骑手在现实平台经济中生存压力的艺术化表达。随着关卡推进，系统会不断诱导你闯红灯、逆行，以换取更短的配送时间——这正是许多骑手日常面临的结构性困境。
      </p>
    </div>
  );
}
