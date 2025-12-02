# 部署指南 - Deployment Guide

## 本地开发 (Local Development)

### 使用 Python 运行
```bash
cd birthday-surprise
python -m http.server 8000
# 访问 http://localhost:8000
```

### 使用 Node.js 运行
```bash
cd birthday-surprise
npx http-server -p 8000
# 访问 http://localhost:8000
```

## 部署到 GitHub Pages

1. 在 GitHub 仓库设置中启用 GitHub Pages
2. 选择分支 (main 或 gh-pages)
3. 选择根目录或 /docs 目录
4. 保存设置
5. 访问 `https://your-username.github.io/birthday-surprise`

**注意**: GitHub Pages 使用 HTTPS，摄像头访问会更可靠。

## 部署到 Netlify

1. 登录 [Netlify](https://www.netlify.com)
2. 点击 "New site from Git"
3. 连接 GitHub 仓库
4. 构建设置保持默认（无需构建步骤）
5. 点击 "Deploy site"
6. 获得一个 `https://*.netlify.app` 域名

## 部署到 Vercel

1. 登录 [Vercel](https://vercel.com)
2. 点击 "New Project"
3. 导入 GitHub 仓库
4. 保持默认设置
5. 点击 "Deploy"
6. 获得一个 `https://*.vercel.app` 域名

## 自定义域名

如果你有自己的域名，可以在以上平台的设置中添加自定义域名。

**重要**: 确保使用 HTTPS，以便摄像头功能正常工作。

## 性能优化建议

### 1. 图片优化
- 压缩照片文件（推荐 JPG 格式，质量 80-90%）
- 使用适当的尺寸（不超过 1920x1080）

### 2. 资源压缩
如果需要更快的加载速度，可以使用 CDN 或压缩工具：

```bash
# 安装压缩工具
npm install -g terser uglifycss

# 压缩 JavaScript
terser js/main.js -o js/main.min.js -c -m

# 压缩 CSS
uglifycss css/styles.css --output css/styles.min.css
```

然后在 HTML 中引用压缩后的文件。

### 3. 缓存优化
在服务器配置中设置适当的缓存头：

```
Cache-Control: public, max-age=31536000
```

## 故障排除

### 问题：摄像头无法访问
**解决方案**:
- 确保网站使用 HTTPS
- 检查浏览器权限设置
- 尝试不同的浏览器（推荐 Chrome 或 Edge）

### 问题：加载缓慢
**解决方案**:
- 压缩图片文件
- 使用 CDN 加速
- 检查网络连接

### 问题：手势识别不准确
**解决方案**:
- 确保光线充足
- 保持适当距离（1-2米）
- 手势幅度要大

## 安全建议

1. **不要提交敏感信息**: 确保照片和个人信息不含敏感内容
2. **设置仓库为私有**: 如果不想公开，可以将 GitHub 仓库设为私有
3. **添加访问密码**: 考虑在网站前添加简单的密码保护

## 技术支持

如遇到问题：
1. 检查浏览器控制台错误信息
2. 查看 GitHub Issues
3. 参考项目 README.md

---

祝你部署顺利！🎉
