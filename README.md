# Happy Birthday Vue 3 Refactor

这是对原始生日贺卡项目的 `Vue 3 + Vite` 重构版本。

这次重构的目标有三件事：

- 把原本堆在单个 `index.html` 里的逻辑拆成可维护的 Vue 组件和 composables
- 保留原项目的核心体验：粒子蛋糕、倒计时、吹蜡烛、翻页贺卡
- 提升多端适配和回退能力，保证桌面、平板、手机都能正常进入流程

## 分支说明

- `master` 保持原始实现
- 本次重构在独立分支中进行，不直接改动 `master`
- 重构结果用于推送到远端 `Refactor` 分支

## 技术栈

- `Vue 3`
- `Vite`
- `Three.js`
- `MediaPipe Hands`（通过 CDN 按需加载，避免打包兼容问题）
- `Web Audio API`

## 当前功能

- 开场引导页
- 手势检测触发倒计时
- 手势不可用时自动倒计时回退
- 3D 粒子蛋糕场景
- 麦克风吹蜡烛交互
- 麦克风不可用时：
  - 桌面端支持空格键
  - 移动端支持长按屏幕
- 实时蛋糕主题配色调整
- 翻转式生日贺卡
- 贺卡关闭后可重新打开
- 响应式布局，兼容桌面和移动端视口

## 项目结构

```text
.
├─ public/
│  └─ icon.svg
├─ src/
│  ├─ components/
│  │  ├─ ControlHud.vue
│  │  ├─ StartOverlay.vue
│  │  └─ SurpriseCard.vue
│  ├─ composables/
│  │  ├─ useAudioBlow.js
│  │  ├─ useBirthdayScene.js
│  │  └─ useHandTracking.js
│  ├─ utils/
│  │  ├─ createParticleTargets.js
│  │  └─ loadExternalScript.js
│  ├─ App.vue
│  ├─ content.js
│  ├─ main.js
│  ├─ styles.css
│  ├─ 1.jpg
│  ├─ happy-birthday-155461.mp3
│  └─ icon.svg
├─ index.html
└─ vite.config.js
```

## 本地运行

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发环境

```bash
npm run dev
```

### 3. 构建生产版本

```bash
npm run build
```

### 4. 本地预览生产包

```bash
npm run preview
```

## 使用要求

请不要直接双击 `index.html` 用 `file://` 打开。

摄像头和麦克风权限需要运行在 `http://` 或 `https://` 环境下，否则浏览器会限制相关 API。

推荐方式：

- 本地开发用 `npm run dev`
- 部署后通过 `Vercel / Netlify / GitHub Pages / Nginx` 等静态站点服务访问

## 多端交互说明

### 桌面端

- 鼠标拖动可旋转蛋糕
- 空格键可模拟吹蜡烛
- 摄像头权限允许后可用手势触发倒计时

### 移动端

- 手指拖动可旋转蛋糕
- 长按屏幕可模拟吹蜡烛
- 摄像头不可用时会自动进入倒计时回退流程

## 资源说明

- `src/happy-birthday-155461.mp3`：背景音乐
- `src/1.jpg`：贺卡封面图

如果要替换素材，直接替换同名文件即可；如果文件名改变，需要同步更新导入路径。

## 迁移说明

原项目的主要问题是：

- 逻辑集中在单文件里，维护成本高
- 状态切换和事件监听耦合严重
- 桌面与移动端交互策略混在一起

重构后将职责拆开：

- `useBirthdayScene.js` 负责 Three.js 粒子场景
- `useAudioBlow.js` 负责音频、吹气进度和输入回退
- `useHandTracking.js` 负责摄像头与手势识别
- 组件只负责展示和交互

## 已验证内容

- `npm run build` 已通过
- 桌面视口页面可正常加载
- 移动视口页面可正常加载
- 页面无控制台错误

## 后续可继续优化

- 将 MediaPipe 和 Three.js 做按需懒加载，进一步减小首屏包体积
- 增加自定义祝福文案配置
- 增加更多贺卡模板和主题
- 为关键流程补自动化 E2E 检查
