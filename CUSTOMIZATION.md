# 自定义指南 - Customization Guide

本指南详细说明如何自定义生日惊喜网站的各个部分。

## 📸 自定义照片

### 1. 准备照片
- 格式：JPG 或 PNG
- 推荐尺寸：1920x1080 或更小
- 数量：至少 5 张

### 2. 添加照片
将照片复制到 `assets/photos/` 目录，命名为：
- `photo1.jpg`
- `photo2.jpg`
- `photo3.jpg`
- `photo4.jpg`
- `photo5.jpg`

### 3. 添加更多照片
如果有超过 5 张照片，编辑 `js/scenes/photowall.js`:

```javascript
this.photos = [
    'assets/photos/photo1.jpg',
    'assets/photos/photo2.jpg',
    'assets/photos/photo3.jpg',
    'assets/photos/photo4.jpg',
    'assets/photos/photo5.jpg',
    'assets/photos/photo6.jpg', // 新增
    'assets/photos/photo7.jpg', // 新增
];
```

## ⏰ 自定义时间轴

编辑 `js/scenes/timeline.js` 文件中的 `timelineData` 数组：

```javascript
timelineData: [
    { 
        date: '2020-01-15', 
        text: '我们第一次相遇，你的笑容让我心动' 
    },
    { 
        date: '2020-03-20', 
        text: '第一次牵手，感觉世界都变得温暖' 
    },
    // 添加你们的回忆...
    { 
        date: '2024-12-01', 
        text: '今天是你的生日，我准备了这个惊喜' 
    },
],
```

### 格式说明
- `date`: 日期格式为 'YYYY-MM-DD'
- `text`: 描述文字，建议不超过 30 个字

## 🎆 自定义祝福语

编辑 `js/scenes/fireworks.js` 文件中的 `blessings` 数组：

```javascript
blessings: [
    '生日快乐',
    '永远幸福',
    '心想事成',
    '爱你一万年',
    // 添加你的祝福语...
    '越来越漂亮',
    '天天好心情',
],
```

## 💝 自定义名字

编辑 `js/scenes/finale.js` 文件中的 `showName()` 方法：

```javascript
showName() {
    const nameElement = document.getElementById('finale-name');
    if (nameElement) {
        nameElement.textContent = '宝贝'; // 改成你想要的名字
        nameElement.style.opacity = '1';
    }
    // ...
}
```

## 🕯️ 自定义蜡烛数量

编辑 `js/scenes/candles.js` 文件中的 `initCandles()` 方法：

```javascript
initCandles() {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const candleCount = 25; // 改成对应的年龄
    // ...
}
```

## 🎨 自定义颜色主题

### 修改背景渐变
编辑 `css/styles.css` 文件：

```css
#loading-screen {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    /* 改成你喜欢的颜色 */
}
```

### 修改文字颜色
```css
.fade-in-text {
    color: #ffffff; /* 改成你喜欢的颜色 */
}
```

## 🎵 添加背景音乐

### 1. 准备音乐文件
- 格式：MP3 或 OGG
- 放入 `assets/audio/` 目录
- 例如：`assets/audio/birthday-song.mp3`

### 2. 在 HTML 中添加
编辑 `index.html`，在 `<body>` 标签内添加：

```html
<audio id="background-music" loop>
    <source src="assets/audio/birthday-song.mp3" type="audio/mpeg">
</audio>
```

### 3. 控制播放
音乐会在第六层（finale）自动播放。

如果想在其他场景播放，编辑对应的场景文件，在 `activate()` 方法中添加：

```javascript
activate() {
    // ...现有代码...
    
    // 播放音乐
    const audio = document.getElementById('background-music');
    if (audio) {
        audio.play();
    }
}
```

## 📝 自定义文字内容

### 开场文字
编辑 `index.html` 中的：

```html
<h1 class="fade-in-text">有个人想对你说...</h1>
```

### 最后的告白
编辑 `index.html` 中的：

```html
<p class="finale-message">往后余生，都是你</p>
```

## 🎭 自定义动画时间

### 调整场景切换速度
编辑各个场景文件中的 `transitionTimer` 值：

```javascript
// 在场景文件中找到类似代码
setTimeout(() => {
    if (this.isActive) {
        this.transitionTimer = 60; // 60帧 = 1秒，120帧 = 2秒
    }
}, 3000); // 等待3秒后开始切换
```

### 调整动画速度
编辑 `css/styles.css` 中的动画持续时间：

```css
.fade-in-text {
    animation: fadeIn 3s ease-in; /* 3秒改成你想要的时间 */
}
```

## 🎪 高级自定义

### 添加新的手势
编辑 `js/camera.js`，在 `detectGestures()` 方法中添加：

```javascript
detectCustomGesture() {
    // 实现你的手势检测逻辑
    // 返回 true 或 false
}
```

然后在场景中注册：

```javascript
CameraModule.on('custom_gesture', () => {
    // 手势触发后的操作
});
```

### 添加新的场景
1. 创建新的场景文件 `js/scenes/newscene.js`
2. 参考现有场景的结构
3. 在 `index.html` 中添加对应的 HTML 结构
4. 在 `js/main.js` 中注册新场景

## 💡 实用技巧

### 1. 测试单个场景
在浏览器控制台输入：
```javascript
App.goToScene(0); // 跳转到第一个场景
```

### 2. 查看调试信息
打开浏览器控制台（F12），查看 debug 面板的信息。

### 3. 禁用某些场景
在 `js/main.js` 中注释掉不需要的场景：

```javascript
this.scenes = [
    StarfieldScene,
    // PhotoWallScene,  // 注释掉不需要的场景
    TimelineScene,
    FireworksScene,
    CandlesScene,
    FinaleScene
];
```

## 📱 移动端优化

### 调整文字大小
编辑 `css/styles.css` 中的移动端样式：

```css
@media (max-width: 768px) {
    .fade-in-text {
        font-size: 24px; /* 调整为适合的大小 */
    }
}
```

## 🎯 性能优化

### 减少粒子数量
如果运行卡顿，可以减少粒子数量：

```javascript
// 在 starfield.js 中
this.particles = ParticleSystem.createStarField(
    1000, // 从 2000 减少到 1000
    this.canvas.width, 
    this.canvas.height
);
```

## 🛠️ 故障排除

### 某个功能不工作
1. 检查浏览器控制台是否有错误
2. 确认文件路径正确
3. 验证语法没有错误

### 手势识别不灵敏
调整手势检测阈值：

```javascript
// 在 camera.js 中
detectArmsSpread() {
    // ...
    return distance > 200; // 从 300 减少到 200，更容易触发
}
```

---

**提示**: 修改后记得刷新浏览器并清除缓存（Ctrl+Shift+R 或 Cmd+Shift+R）

祝你自定义愉快！🎨
