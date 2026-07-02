import path from "path"
import fs from "node:fs"
import crypto from "node:crypto"
import react from "@vitejs/plugin-react"
import { VitePWA } from "vite-plugin-pwa"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

const basePath = process.env.VITE_BASE_PATH || './'

// 为 public 目录下的静态图片计算内容哈希作为 revision，
// 这样图片内容变更后 Service Worker 会自动重新下载并更新缓存。
function createImageManifestTransform(outDir: string) {
  return (manifest: { url: string; revision: string | null; size: number }[]) => {
    const updated = manifest.map((entry) => {
      if (entry.revision) return entry
      if (!/\.(png|jpg|jpeg|svg|gif|webp|ico)$/i.test(entry.url)) return entry

      const relativeUrl = entry.url.replace(/^\//, '')
      const filePath = path.resolve(outDir, relativeUrl)

      if (fs.existsSync(filePath)) {
        const hash = crypto
          .createHash('md5')
          .update(fs.readFileSync(filePath))
          .digest('hex')
        return { ...entry, revision: hash }
      }

      return entry
    })

    return { manifest: updated }
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: basePath,
  plugins: [
    inspectAttr(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: '红灯绿灯命',
        short_name: '红灯绿灯命',
        description: '外卖骑手闯关游戏',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        scope: basePath,
        start_url: basePath,
        icons: [],
      },
      workbox: {
        // 缓存所有 JS/CSS/HTML/图片，单文件上限 5MB（项目里的 PNG 有 2MB+）
        globPatterns: ['**/*.{js,css,html,png,ico,svg,webmanifest}'],
        // building.png 和 building_side.png 没有实际绘制，不预缓存
        globIgnores: ['**/building.png', '**/building_side.png'],
        // 给 public 下的图片加内容哈希 revision，图片更新后自动刷新缓存
        manifestTransforms: [createImageManifestTransform('dist')],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'game-images',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 年
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
