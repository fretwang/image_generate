# 客户端部署指南

## 🚀 部署步骤

### 1. 环境配置

在新服务器上创建 `.env` 文件：

```bash
# 复制环境变量模板
cp .env.example .env
```

然后编辑 `.env` 文件，配置你的域名和API：

```env
# API服务器配置 (必需)
VITE_API_BASE_URL=https://fretwang.com/api

# Google OAuth 配置
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret_here
VITE_GOOGLE_REDIRECT_URI=https://your-new-domain.com/
```

### 2. Google OAuth 重新配置

由于域名变更，需要更新Google OAuth设置：

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 选择你的项目
3. 进入 "APIs & Services" > "Credentials"
4. 编辑你的OAuth 2.0客户端ID
5. 在"授权重定向URI"中添加新域名：
   ```
   https://your-new-domain.com/
   ```
6. 保存更改

### 3. 安装依赖

```bash
npm install
```

### 4. 构建生产版本

```bash
npm run build
```

### 5. 部署选项

#### 选项A: 使用Nginx (推荐)

1. 将 `dist/` 目录内容复制到网站根目录
2. 配置Nginx：

```nginx
server {
    listen 80;
    server_name your-new-domain.com;
    
    # 重定向到HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-new-domain.com;
    
    # SSL证书配置
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    root /var/www/your-site/dist;
    index index.html;
    
    # SPA路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 静态资源缓存
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 选项B: 使用Apache

1. 将 `dist/` 目录内容复制到网站根目录
2. 创建 `.htaccess` 文件：

```apache
RewriteEngine On
RewriteBase /

# Handle Angular and Vue.js routes
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# HTTPS重定向
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

#### 选项C: 使用Node.js服务器

创建简单的Express服务器：

```javascript
// server.js
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```

### 6. SSL证书配置

确保新域名有有效的SSL证书：

```bash
# 使用Let's Encrypt (免费)
sudo certbot --nginx -d your-new-domain.com
```

### 7. 防火墙配置

确保服务器防火墙允许HTTP和HTTPS流量：

```bash
# Ubuntu/Debian
sudo ufw allow 80
sudo ufw allow 443

# CentOS/RHEL
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## 🔧 配置检查清单

- [ ] 创建并配置 `.env` 文件
- [ ] 更新Google OAuth重定向URI
- [ ] 安装Node.js依赖
- [ ] 构建生产版本
- [ ] 配置Web服务器
- [ ] 设置SSL证书
- [ ] 配置防火墙
- [ ] 测试所有功能

## 🧪 测试步骤

1. 访问新域名，确保页面正常加载
2. 测试Google登录功能
3. 测试邮箱注册/登录
4. 测试AI图像生成功能
5. 检查所有API调用是否正常

## 🚨 常见问题

### Google登录失败
- 检查重定向URI是否正确配置
- 确认域名使用HTTPS
- 验证Client ID是否正确

### API调用失败
- 检查 `VITE_API_BASE_URL` 配置
- 确认API服务器可访问
- 检查CORS设置

### 页面刷新404错误
- 确保Web服务器配置了SPA路由支持
- 检查 `.htaccess` 或Nginx配置

## 📝 注意事项

1. **HTTPS必需**: Google OAuth要求使用HTTPS
2. **域名匹配**: 重定向URI必须完全匹配
3. **环境变量**: 确保所有必需的环境变量都已配置
4. **API访问**: 确认新服务器可以访问API服务器
5. **缓存清理**: 部署后清理浏览器缓存测试