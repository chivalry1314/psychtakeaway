export default function Deployment() {
  return (
    <div>
      <h1 className="text-3xl font-black text-white mb-4">部署说明</h1>

      <p className="text-gray-300 mb-6">
        本项目使用 GitHub Actions 自动部署到 GitHub Pages。每次向 <code className="bg-gray-800 px-1.5 py-0.5 rounded">main</code> 分支推送代码时，工作流会自动构建游戏本体与在线文档，并发布到同一个 GitHub Pages 站点。
      </p>

      <h2 className="text-xl font-bold text-white mt-8 mb-3">部署地址</h2>
      <ul className="list-disc list-inside text-gray-300 space-y-2">
        <li>游戏本体：<code className="bg-gray-800 px-1.5 py-0.5 rounded">https://chivalry1314.github.io/psychtakeaway/</code></li>
        <li>在线文档：<code className="bg-gray-800 px-1.5 py-0.5 rounded">https://chivalry1314.github.io/psychtakeaway/docs/</code></li>
      </ul>

      <h2 className="text-xl font-bold text-white mt-8 mb-3">工作流文件</h2>
      <p className="text-gray-300 mb-3">
        工作流位于仓库根目录的 <code className="bg-gray-800 px-1.5 py-0.5 rounded">.github/workflows/deploy.yml</code>，主要步骤如下：
      </p>
      <ol className="list-decimal list-inside text-gray-300 space-y-2">
        <li>检出代码并安装 Node.js 依赖。</li>
        <li>构建游戏本体，base path 自动设置为仓库名。</li>
        <li>构建在线文档，base path 自动设置为 <code className="bg-gray-800 px-1.5 py-0.5 rounded">/&lt;仓库名&gt;/docs/</code>。</li>
        <li>将文档构建产物复制到游戏本体的 <code className="bg-gray-800 px-1.5 py-0.5 rounded">dist/docs</code> 目录下。</li>
        <li>通过 <code className="bg-gray-800 px-1.5 py-0.5 rounded">actions/deploy-pages</code> 部署到 GitHub Pages。</li>
      </ol>

      <h2 className="text-xl font-bold text-white mt-8 mb-3">首次启用</h2>
      <ol className="list-decimal list-inside text-gray-300 space-y-2">
        <li>进入 GitHub 仓库的 <strong>Settings → Pages</strong>。</li>
        <li>在 <strong>Build and deployment</strong> 中选择 <strong>GitHub Actions</strong> 作为 Source。</li>
        <li>保存后，向 <code className="bg-gray-800 px-1.5 py-0.5 rounded">main</code> 分支推送任意提交，即可触发首次部署。</li>
      </ol>

      <h2 className="text-xl font-bold text-white mt-8 mb-3">本地构建文档</h2>
      <pre className="bg-gray-900 border border-gray-800 rounded-lg p-4 overflow-x-auto text-sm text-gray-300">
        <code>npm run build:docs</code>
      </pre>
      <p className="text-gray-300 mt-3">
        文档构建产物位于 <code className="bg-gray-800 px-1.5 py-0.5 rounded">docs/dist/</code>。
      </p>
    </div>
  );
}
