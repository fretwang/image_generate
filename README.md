# AI Image Generator

一个基于AI的图像生成应用，支持文本转图像功能，使用外部API服务。

## 功能特性

- 🎨 AI图像生成 - 通过文本描述生成图像
- 👤 用户认证系统 - 支持邮箱注册/登录和Google OAuth
- 📧 邮件发送 - 验证码和密码重置邮件
- 🔄 邮件重发功能 - 支持重新发送验证邮件
- 🔐 忘记密码 - 完整的密码重置流程
- 💰 积分系统 - 基于积分的使用计费
- 🖼️ 图片画廊 - 查看和管理生成的图像
- 📱 响应式设计 - 支持移动端和桌面端

## API服务配置

### 外部API服务

本应用使用外部API服务处理所有后端功能：
- 用户认证和管理
- 邮件发送服务
- 积分系统
- AI图像生成

## Google OAuth 配置

### 1. 创建Google OAuth应用

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Google+ API 和 Gmail API
4. 创建OAuth 2.0客户端ID凭据
5. 设置授权重定向URI：
   - 开发环境: `http://localhost:5173`
   - 生产环境: `https://tupian.life`

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填入你的Google OAuth配置：

```bash
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret_here
VITE_GOOGLE_REDIRECT_URI=https://tupian.life/
```

### 3. 获取Google OAuth凭据

1. **Client ID**: 在Google Cloud Console的凭据页面可以找到
2. **Client Secret**: 创建OAuth客户端时生成，请妥善保管
3. **Redirect URI**: 必须与Google Console中配置的完全一致

## 开发指南

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

## 技术栈

- **前端**: React + TypeScript + Tailwind CSS
- **后端**: 外部API服务
- **认证**: Google OAuth 2.0
- **状态管理**: React Context
- **图标**: Lucide React
- **构建工具**: Vite

## 注意事项

1. **API配置**: 需要配置正确的API服务器地址
2. **邮件服务**: 邮件发送由外部API处理
3. **安全性**: Client Secret应该在生产环境中通过服务端处理，不应暴露在前端代码中
4. **HTTPS**: 生产环境必须使用HTTPS，Google OAuth要求安全连接
5. **域名验证**: 确保重定向URI与Google Console中配置的完全匹配
6. **令牌管理**: 访问令牌有过期时间，建议实现刷新令牌机制

## 故障排除

### 用户无法登录/注册问题
1. **邮箱未验证**: 系统会自动提示重新发送验证邮件
2. **忘记密码**: 点击登录页面的"忘记密码"链接
3. **验证码过期**: 验证码有效期10分钟，过期后需重新获取
4. **邮件未收到**: 检查垃圾邮件文件夹，或点击重新发送

### 邮件发送失败
1. 检查API服务器是否正常运行
2. 确认邮件服务配置正确
3. 检查邮件是否被归类为垃圾邮件
4. 查看API服务器日志

### Google登录失败
1. 检查Client ID和Client Secret是否正确
2. 确认重定向URI配置是否匹配
3. 检查浏览器控制台的错误信息
4. 确保Google OAuth应用状态为"已发布"

### 开发环境问题
1. 确保使用 `http://localhost:5173` 而不是 `127.0.0.1`
2. 检查防火墙是否阻止了OAuth回调
3. 清除浏览器缓存和localStorage

## 许可证

MIT License