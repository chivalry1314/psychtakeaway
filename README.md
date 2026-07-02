# 红灯，绿灯，命

> “这不是游戏，这是生存。”

一个基于 React + TypeScript + Vite 开发的隐喻向小游戏。你扮演一名外卖骑手，在红绿灯、算法时限、逆行捷径与催命弹幕之间奔忙。游戏通过夸张的机制与叙事，表现外卖骑手在系统压力下的生存困境。

---

## 技术栈

- **React 19** + **TypeScript**
- **Vite 7**（构建与开发服务器）
- **Tailwind CSS 3.4** + **shadcn/ui** 组件库
- **Lucide React** 图标

---

## 在线地址

本项目通过 GitHub Actions 自动部署到 GitHub Pages：

- 🎮 游戏本体：`https://<用户名>.github.io/<仓库名>/`
- 📖 在线文档：`https://<用户名>.github.io/<仓库名>/docs/`

> 将 `<用户名>` 和 `<仓库名>` 替换为你的 GitHub 用户名和仓库名即可访问。

## 本地运行

### 环境要求

- Node.js 20 或更高版本（推荐 22 LTS）
- npm 10 或更高版本

### 安装依赖

```bash
npm install
```

> 如果安装过程中遇到依赖冲突，可尝试：
> ```bash
> npm install --legacy-peer-deps
> ```

### 启动开发服务器

```bash
npm run dev
```

默认运行在 [http://localhost:3000](http://localhost:3000)，打开浏览器即可游玩。

### 构建生产版本

```bash
npm run build
```

构建产物输出到 `dist/` 目录，可通过 `npm run preview` 本地预览。

---

## 游戏操作

| 操作 | 说明 |
|------|------|
| `W` / `A` / `S` / `D` 或方向键 | 控制骑手移动 |
| `P` / `Esc` | 暂停 / 继续 |
| 触摸屏幕左半区域（移动端） | 虚拟摇杆控制移动 |

### 基本规则

1. 从餐厅取餐，再送到顾客手中。
2. 注意红绿灯：闯红灯会扣分、扣血，并积累“违规连击”。
3. 等红灯太久会被系统催单、扣钱。
4. 部分关卡有单行道，逆行会降低速度。
5. 完成目标订单数并赚取足够收入即可过关。

---

## 项目结构

```
psychtakeaway/
├── public/assets/          # 静态资源（图片、音效等）
├── src/
│   ├── components/         # React 组件
│   │   ├── ui/             # shadcn/ui 组件
│   │   ├── menus/          # 菜单、弹窗、结算界面
│   │   ├── effects/        # 特效组件（弹幕、成就、心跳等）
│   │   ├── GameCanvas.tsx  # 游戏主画布与 HUD
│   │   └── VirtualJoystick.tsx
│   ├── game/
│   │   ├── engine/         # 游戏循环、物理、渲染逻辑
│   │   └── levels/         # 关卡配置
│   ├── hooks/              # 自定义 Hooks
│   ├── types/              # TypeScript 类型定义
│   ├── App.tsx             # 应用根组件
│   ├── main.tsx            # 入口文件
│   └── index.css           # 全局样式与主题变量
├── docs/                   # 在线文档站点
├── .github/workflows/      # GitHub Actions 自动部署
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── tsconfig.json
```

---

## 脚本说明

| 脚本 | 作用 |
|------|------|
| `npm run dev` | 启动游戏开发服务器（热更新） |
| `npm run dev:docs` | 启动文档开发服务器 |
| `npm run build` | 执行 TypeScript 检查并构建游戏生产包 |
| `npm run build:docs` | 构建在线文档 |
| `npm run preview` | 本地预览生产构建 |
| `npm run lint` | 运行 ESLint 检查代码 |

---

## 自动部署

仓库已配置 `.github/workflows/deploy.yml`，每次向 `main` 或 `master` 分支推送代码时：

1. GitHub Actions 自动安装依赖。
2. 同时构建游戏本体与在线文档。
3. 将文档产物合并到游戏本体的 `dist/docs/` 目录。
4. 统一部署到 GitHub Pages。

### 首次启用 Pages

1. 进入 GitHub 仓库的 **Settings → Pages**。
2. 在 **Build and deployment** 中选择 **GitHub Actions** 作为 Source。
3. 保存后，向主分支推送任意提交即可触发首次部署。

## 已知问题

- `npm run lint` 目前会在 `src/components/ui/` 下的部分 shadcn/ui 生成组件报出规则警告（如 `react-refresh/only-export-components`、`react-hooks/set-state-in-effect` 等）。这些警告不影响开发服务器运行与生产构建，属于 shadcn/ui 模板代码与当前 ESLint 严格规则之间的差异。
- 项目使用 React 19 与较新的 `eslint-plugin-react-hooks`，部分传统写法会被新规则标记，核心游戏逻辑已做相应调整。

---

## 许可证

私有项目，仅供学习与交流。
