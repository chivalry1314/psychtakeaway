export default function GettingStarted() {
  return (
    <div>
      <h1 className="text-3xl font-black text-white mb-4">快速开始</h1>

      <h2 className="text-xl font-bold text-white mt-8 mb-3">环境要求</h2>
      <ul className="list-disc list-inside text-gray-300 space-y-2">
        <li>Node.js 20 或更高版本（推荐 22 LTS）</li>
        <li>npm 10 或更高版本</li>
      </ul>

      <h2 className="text-xl font-bold text-white mt-8 mb-3">安装依赖</h2>
      <pre className="bg-gray-900 border border-gray-800 rounded-lg p-4 overflow-x-auto text-sm text-gray-300">
        <code>npm install</code>
      </pre>
      <p className="text-gray-400 text-sm mt-2">
        若遇到依赖冲突，可加上 <code>--legacy-peer-deps</code> 参数。
      </p>

      <h2 className="text-xl font-bold text-white mt-8 mb-3">启动开发服务器</h2>
      <pre className="bg-gray-900 border border-gray-800 rounded-lg p-4 overflow-x-auto text-sm text-gray-300">
        <code>npm run dev</code>
      </pre>
      <p className="text-gray-300 mt-3">
        默认运行在 <code className="bg-gray-800 px-1.5 py-0.5 rounded">http://localhost:3000</code>，打开浏览器即可游玩。
      </p>

      <h2 className="text-xl font-bold text-white mt-8 mb-3">构建生产版本</h2>
      <pre className="bg-gray-900 border border-gray-800 rounded-lg p-4 overflow-x-auto text-sm text-gray-300">
        <code>npm run build</code>
      </pre>
      <p className="text-gray-300 mt-3">
        构建产物输出到 <code className="bg-gray-800 px-1.5 py-0.5 rounded">dist/</code> 目录，可通过 <code className="bg-gray-800 px-1.5 py-0.5 rounded">npm run preview</code> 本地预览。
      </p>

      <h2 className="text-xl font-bold text-white mt-8 mb-3">常用脚本</h2>
      <table className="w-full text-left text-sm text-gray-300 border border-gray-800 rounded-lg overflow-hidden">
        <thead className="bg-gray-900 text-gray-100">
          <tr>
            <th className="px-4 py-3 border-b border-gray-800">脚本</th>
            <th className="px-4 py-3 border-b border-gray-800">作用</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          <tr><td className="px-4 py-3 font-mono">npm run dev</td><td className="px-4 py-3">启动开发服务器</td></tr>
          <tr><td className="px-4 py-3 font-mono">npm run build</td><td className="px-4 py-3">构建游戏本体</td></tr>
          <tr><td className="px-4 py-3 font-mono">npm run build:docs</td><td className="px-4 py-3">构建在线文档</td></tr>
          <tr><td className="px-4 py-3 font-mono">npm run preview</td><td className="px-4 py-3">预览生产构建</td></tr>
          <tr><td className="px-4 py-3 font-mono">npm run lint</td><td className="px-4 py-3">运行 ESLint</td></tr>
        </tbody>
      </table>
    </div>
  );
}
