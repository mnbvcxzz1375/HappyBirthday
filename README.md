# Happy Birthday 🎂 — 交互式 3D 电子贺卡

<p>
<img src="https://img.shields.io/github/stars/mnbvcxzz1375/HappyBirthday" alt="stars" />
<img src="https://img.shields.io/github/issues/mnbvcxzz1375/HappyBirthday" alt="issues" />
<img src="https://img.shields.io/github/forks/mnbvcxzz1375/HappyBirthday" alt="forks" />
<img src="https://img.shields.io/github/license/mnbvcxzz1375/HappyBirthday" alt="license" />
<a href="https://app.netlify.com/sites/friendly-paprenjak-ad64b7/deploys"><img src="https://api.netlify.com/api/v1/badges/39d29171-f3b1-4172-932e-1f657058303a/deploy-status" alt="Netlify Status" /></a>
</p>

中文｜[English](./README_EN.md)

一个基于浏览器的生日惊喜页面：3D 粒子蛋糕、手势识别、吹蜡烛动画、可翻转祝福卡片……  
适合做给朋友/对象/家人的专属生日网页。

> 打开链接、允许摄像头和麦克风，就能在浏览器里享受完整的互动体验。

---

## 在线演示

- Demo 地址：<https://happybirthdayhyl.netlify.app/>
> 国内网络访问可能稍慢，建议在网络较好的环境或使用代理访问。


## 使用方法

+ 修改歌曲：将下载好的歌放在src文件夹下，将`index.html`176行的代码，修改为你的歌曲。
   - `<source src="./src/你的歌曲" type="audio/mpeg">`
   - 
+ 修改贺卡中的图片：将下载好的图片放在src文件夹下或者到网上照一张图片右键点击复制链接，将`index.html`266行的代码，修改为你的图片，其他图片的操作类似。
   - 下载的图片：`<img src="./src/你的图片" class="w-full h-full object-cover" alt="Gift">`
   - 复制的链接：`<img src="你复制的图片的链接" class="w-full h-full object-cover" alt="Gift">`
+ 修改卡片内容：看到`index.html`的760行开始有注释标注好，哪些是第一个卡片，哪些是第二个卡片。

+ 替换HTML里面的内容替换为你自己的内容，然后在 github pages 或者其它一些托管网站上部署(如 netlify / Vercel)即可。
+ Netlify 部署（国内用户推荐，不被墙）

   [![Deploy with NEtlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/mnbvcxzz1375/HappyBirthday)
+ 要是出现摄像头和声音问题，可以打开开发者面板（`F12`）看看哪些出问题了

---

## 功能特性

- 🎉 **3D 粒子生日蛋糕**
  - 使用 Three.js 渲染粒子场景，支持蛋糕/文字等不同构型
  - 鼠标拖拽 / 触屏滑动/手势识别滑动 可旋转视角

- 🖐️ **手势驱动的进入动画**
  - 基于 MediaPipe Hands 做手势识别
  - 可通过举手等动作触发自动倒计时，进入互动模式

- 💨 **“吹蜡烛”交互**
  - 基于 Web Audio API 分析麦克风音量
  - 对着麦克风吹气，进度条会逐渐填满
  - 支持键盘空格键 / 移动端长按屏幕模拟吹气

- 💌 **可翻转祝福卡片**
  - 吹蜡烛完成后触发庆祝动画
  - 展示可翻转的生日祝福卡片，可自行修改内容

- 🎨 **实时配色面板**
  - 页面右上角 settings 面板可调节蛋糕配色
  - 支持底层颜色 / 顶层颜色 / 奶油颜色等多项配置

- 📱 **多端兼容**
  - 优先适配桌面浏览器（体验最佳）
  - 支持移动端访问（部分设备可能存在权限或音频输出差异，见下方说明）

---

## 技术栈

- **Three.js** — 3D 场景与粒子渲染
- **MediaPipe Hands** — 手势检测与跟踪
- **Web Audio API** — 麦克风音量采集与“吹气”判定
- **Tailwind CSS** — 快速构建页面样式
- **Google Fonts** 等前端资源

---

## 环境要求

- 现代浏览器（推荐：Chrome / Edge / Firefox 最新版）
- 若开启手势或吹蜡烛互动：
  - 需要 **摄像头** 权限（手势识别）
  - 需要 **麦克风** 权限（吹气检测，或使用按键/长按代替）

> ⚠️ 注意：  
> 本地部署直接用 `file://` 打开 `index.html` 会触发浏览器安全策略，导致摄像头/麦克风不可用。  
> 请务必通过 HTTP/HTTPS 本地服务器访问。

---

## 快速开始

### 方式一：VS Code + Live Server（推荐）

1. 使用 VS Code 打开本项目根目录（包含 `index.html`）。
2. 安装并启用 VS Code 插件 **“Live Server”**。
3. 在 `index.html` 上右键选择 **“Open with Live Server”**。
4. 浏览器会自动打开 `http://127.0.0.1:xxxx/index.html`（端口以实际为准）。

### 方式二：任意静态服务器（以 http-server 为例）

确保已安装 Node.js 和 npm，进入项目根目录后运行：

```bash
# 若尚未安装 http-server
npm install -g http-server

# 启动本地静态服务器（示例端口 5500）
http-server -c-1 . -p 5500
# 然后在浏览器访问
# http://localhost:5500/index.html
```

## 其他：
- 部署展示的是根目录下的`index.html`文件，请自行修改为实际文件名。
- 在根目录下还有`index_c.html`文件，这是另外一个风格的页面。存在一些问题，比如蛋糕效果并未很好的呈现。有时间可以自行修改。
- 本项目对手机等移动设备兼容性不好。安卓设备不适用手机自带浏览器，大概率麦克风以及摄像头权限会无法获取。Apple设备能正常使用。但是都存在一个问题就是，生日歌是通过听筒播放的。如要重构推荐，适用框架重构，可能会避免出现以上的问题。（好像是我手机的问题🥲）
