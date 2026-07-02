export default function Home() {
  return (
    <div>
      <h1 className="text-3xl font-black text-white mb-4">红灯，绿灯，命</h1>
      <p className="text-gray-300 mb-6">
        一款基于 React + TypeScript + Vite 开发的隐喻向小游戏。你扮演一名外卖骑手，在红绿灯、算法时限、逆行捷径与催命弹幕之间奔忙。
      </p>

      <div className="bg-gray-900 border-l-4 border-red-600 rounded-r-lg p-5 mb-8">
        <p className="text-gray-300 italic mb-0">“这不是游戏，这是生存。”</p>
      </div>

      <h2 className="text-xl font-bold text-white mt-8 mb-3">核心特色</h2>
      <ul className="list-disc list-inside text-gray-300 space-y-2">
        <li>键盘 + 触摸屏双端操作支持</li>
        <li>多关卡渐进式难度与叙事</li>
        <li>交通灯、单行道、催单弹幕等机制</li>
        <li>收入结算与“房租”隐喻系统</li>
        <li>自动构建并部署到 GitHub Pages</li>
      </ul>

      <h2 className="text-xl font-bold text-white mt-8 mb-3">在线体验</h2>
      <p className="text-gray-300">
        游戏本体与本文档均通过 GitHub Actions 自动部署到 GitHub Pages。每次向主分支推送代码，系统会自动重新构建并发布。
      </p>
    </div>
  );
}
