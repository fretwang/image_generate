# 客户端需要调用的服务器接口定义

## 🔗 接口列表

### 1. 用户认证相关

#### 1.1 用户注册
```
POST /api/auth/register
Content-Type: application/json

请求体:
{
  "email": "user@example.com",
  "password": "password123",
  "name": "用户姓名"
}

响应:
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "用户姓名",
      "avatar": "头像URL",
      "email_verified": false,
      "created_at": "2024-01-01T00:00:00Z"
    }
  },
  "message": "注册成功，请查收验证邮件"
}
```

#### 1.2 用户登录
```
POST /api/auth/login
Content-Type: application/json

请求体:
{
  "email": "user@example.com",
  "password": "password123"
}

成功响应:
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "用户姓名",
      "avatar": "头像URL",
      "email_verified": true
    },
    "token": "JWT_TOKEN"
  },
  "message": "登录成功"
}

邮箱未验证响应:
{
  "success": false,
  "error": "EMAIL_NOT_VERIFIED",
  "message": "邮箱未验证，请先验证邮箱",
  "data": {
    "email": "user@example.com"
  }
}
```

#### 1.3 Google OAuth登录
```
POST /api/auth/google
Content-Type: application/json

请求体:
{
  "code": "google_auth_code",
  "state": "random_state"
}

响应:
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@gmail.com",
      "name": "Google User",
      "avatar": "https://lh3.googleusercontent.com/...",
      "google_id": "google_user_id",
      "email_verified": true
    },
    "token": "JWT_TOKEN"
  },
  "message": "Google登录成功"
}
```

#### 1.4 发送验证邮件
```
POST /api/auth/send-verification
Content-Type: application/json

请求体:
{
  "email": "user@example.com",
  "type": "verification", // 或 "password_reset"
  "name": "用户姓名" // 可选
}

响应:
{
  "success": true,
  "message": "验证邮件发送成功",
  "data": {
    "email": "user@example.com",
    "expires_in": 600 // 10分钟
  }
}
```

#### 1.5 验证邮箱
```
POST /api/auth/verify-email
Content-Type: application/json

请求体:
{
  "email": "user@example.com",
  "code": "123456",
  "type": "verification" // 或 "password_reset"
}

响应:
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "用户姓名",
      "avatar": "头像URL",
      "email_verified": true
    },
    "token": "JWT_TOKEN" // 验证成功后自动登录
  },
  "message": "邮箱验证成功"
}
```

#### 1.6 重置密码
```
POST /api/auth/reset-password
Content-Type: application/json

请求体:
{
  "email": "user@example.com",
  "code": "123456",
  "new_password": "newpassword123"
}

响应:
{
  "success": true,
  "message": "密码重置成功"
}
```

### 2. 积分系统相关

#### 2.1 获取用户积分
```
GET /api/credits/balance
Authorization: Bearer JWT_TOKEN

响应:
{
  "success": true,
  "data": {
    "balance": 150,
    "user_id": "uuid"
  }
}
```

#### 2.2 获取交易记录
```
GET /api/credits/transactions?page=1&limit=20
Authorization: Bearer JWT_TOKEN

响应:
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "type": "recharge", // 或 "consume"
        "amount": 100,
        "description": "充值100积分",
        "payment_method": "wechat", // 可选
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20
  }
}
```

#### 2.3 充值积分
```
POST /api/credits/recharge
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

请求体:
{
  "amount": 20, // 人民币金额
  "payment_method": "wechat" // 支付方式
}

响应:
{
  "success": true,
  "data": {
    "transaction_id": "uuid",
    "credits_added": 200, // 1元=10积分
    "new_balance": 350,
    "payment_url": "https://pay.example.com/..." // 可选，支付链接
  },
  "message": "充值成功"
}
```

#### 2.4 消费积分
```
POST /api/credits/consume
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

请求体:
{
  "amount": 10,
  "description": "生成AI图片"
}

响应:
{
  "success": true,
  "data": {
    "transaction_id": "uuid",
    "new_balance": 140
  },
  "message": "积分消费成功"
}
```

### 3. AI图片生成相关

#### 3.1 生成图片
```
POST /api/images/generate
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

请求体:
{
  "prompt": "一只可爱的小猫在花园里玩耍",
  "style": "realistic", // realistic, cartoon, oil-painting, 3d-render, watercolor, cyberpunk
  "transparent": false,
  "count": 4 // 生成图片数量
}

响应:
{
  "success": true,
  "data": {
    "images": [
      {
        "id": "uuid",
        "url": "https://cdn.example.com/image1.jpg",
        "prompt": "一只可爱的小猫在花园里玩耍",
        "style": "realistic",
        "transparent": false,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "credits_consumed": 10,
    "remaining_credits": 140
  },
  "message": "图片生成成功"
}
```

#### 3.2 获取生成历史
```
GET /api/images/history?page=1&limit=20
Authorization: Bearer JWT_TOKEN

响应:
{
  "success": true,
  "data": {
    "history": [
      {
        "id": "uuid",
        "prompt": "一只可爱的小猫在花园里玩耍",
        "style": "realistic",
        "transparent": false,
        "images": [
          {
            "id": "uuid",
            "url": "https://cdn.example.com/image1.jpg",
            "created_at": "2024-01-01T00:00:00Z"
          }
        ],
        "credits_used": 10,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20
  }
}
```

### 4. 用户信息相关

#### 4.1 获取用户信息
```
GET /api/user/profile
Authorization: Bearer JWT_TOKEN

响应:
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "用户姓名",
      "avatar": "头像URL",
      "email_verified": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

#### 4.2 更新用户信息
```
PUT /api/user/profile
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

请求体:
{
  "name": "新姓名",
  "avatar": "新头像URL"
}

响应:
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "新姓名",
      "avatar": "新头像URL",
      "email_verified": true,
      "updated_at": "2024-01-01T00:00:00Z"
    }
  },
  "message": "用户信息更新成功"
}
```

## 🔒 认证机制

### JWT Token格式
```json
{
  "user_id": "uuid",
  "email": "user@example.com",
  "exp": 1640995200,
  "iat": 1640908800
}
```

### 请求头格式
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📝 通用错误格式

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "错误描述",
  "details": {} // 可选，详细错误信息
}
```

### 常见错误码
- `INVALID_CREDENTIALS` - 登录凭据无效
- `EMAIL_NOT_VERIFIED` - 邮箱未验证
- `USER_NOT_FOUND` - 用户不存在
- `EMAIL_ALREADY_EXISTS` - 邮箱已存在
- `INVALID_VERIFICATION_CODE` - 验证码无效
- `INSUFFICIENT_CREDITS` - 积分不足
- `UNAUTHORIZED` - 未授权
- `VALIDATION_ERROR` - 参数验证错误
- `INTERNAL_ERROR` - 服务器内部错误

## 🚀 配置说明

在 `.env` 文件中配置你的API服务器地址：
```
VITE_API_BASE_URL=http://localhost:3000/api
```

或者生产环境：
```
VITE_API_BASE_URL=https://your-api-server.com/api
```