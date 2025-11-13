# 🔐 真实认证系统实现

## ✅ 完成状态

已完成从 Mock 认证到真实后端 API 认证的迁移！

---

## 📦 新增文件

1. **类型定义更新**: `lib/types/api-v1.ts`
   - 添加所有认证相关的类型定义

2. **认证服务**: `lib/services/auth-service.ts`
   - 封装所有认证 API 调用

3. **认证 Hook 更新**: `hooks/use-auth.ts`
   - 实现真实的后端认证逻辑

---

## 🔑 支持的认证方式

### 1. 邮箱密码注册 ✅
```typescript
const { signUp } = useAuth();

await signUp({
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  password: 'SecurePassword123',
});
```

### 2. 邮箱密码登录 ✅
```typescript
const { signIn } = useAuth();

await signIn('john@example.com', 'SecurePassword123');
```

### 3. 短信验证码登录 ✅
```typescript
const { signInWithSms } = useAuth();

// 1. 获取验证码
await authService.getSmsCode({ phone: '+1234567890' });

// 2. 使用验证码登录
await signInWithSms({
  phone: '+1234567890',
  code: '123456',
  invite_code: 'OPTIONAL',
});
```

### 4. Google 登录 ✅
```typescript
const { signInWithGoogle } = useAuth();

await signInWithGoogle('google-oauth-token');
```

### 5. 登出 ✅
```typescript
const { signOut } = useAuth();

await signOut();
```

---

## 🎯 API 端点映射

| 功能 | 后端接口 | 前端方法 | 说明 |
|------|---------|---------|------|
| **注册** | `POST /auth/register` | `signUp()` | 邮箱密码注册 |
| **登录** | `POST /auth/login` | `signIn()` | 邮箱密码登录 |
| **短信验证码** | `POST /auth/sms/code` | `authService.getSmsCode()` | 获取验证码 |
| **短信登录** | `POST /auth/login/sms` | `signInWithSms()` | 验证码登录 |
| **Google登录** | `POST /auth/google` | `signInWithGoogle()` | OAuth 登录 |
| **登出** | `POST /auth/logout` | `signOut()` | 登出并清理 |
| **获取用户信息** | `GET /auth/me` | `authService.getMe()` | 获取当前用户 |
| **更新用户** | `POST /auth/update-user` | `authService.updateUser()` | 更新资料 |
| **修改密码** | `POST /auth/changepassword` | `authService.changePassword()` | 修改密码 |
| **重置密码** | `POST /auth/resetpassword` | `authService.resetPassword()` | 找回密码 |
| **用户仪表板** | `GET /auth/dashboard` | `authService.getUserDashboard()` | 获取仪表板 |

---

## 💻 完整使用示例

### 示例 1：注册新用户

```typescript
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';

export default function RegisterPage() {
  const { signUp, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const { user, error } = await signUp({
        first_name: formData.get('firstName') as string,
        last_name: formData.get('lastName') as string,
        email: formData.get('email') as string,
        password: formData.get('password') as string,
      });

      if (error) {
        setError(error);
        return;
      }

      // 注册成功，跳转到首页
      window.location.href = '/';
    } catch (err) {
      setError('注册失败，请稍后重试');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="firstName" placeholder="名字" required />
      <input name="lastName" placeholder="姓氏" required />
      <input name="email" type="email" placeholder="邮箱" required />
      <input name="password" type="password" placeholder="密码" required />

      {error && <p className="error">{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? '注册中...' : '注册'}
      </button>
    </form>
  );
}
```

### 示例 2：登录

```typescript
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';

export default function LoginPage() {
  const { signIn, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    const { user, error: authError } = await signIn(
      formData.get('email') as string,
      formData.get('password') as string
    );

    if (authError) {
      setError(authError);
      return;
    }

    // 登录成功
    window.location.href = '/';
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" placeholder="邮箱" required />
      <input name="password" type="password" placeholder="密码" required />

      {error && <p className="error">{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? '登录中...' : '登录'}
      </button>
    </form>
  );
}
```

### 示例 3：检查认证状态

```typescript
'use client';

import { useAuth } from '@/hooks/use-auth';

export default function ProfilePage() {
  const { user, loading, signOut, isAuthenticated } = useAuth();

  if (loading) {
    return <div>加载中...</div>;
  }

  if (!isAuthenticated) {
    return <div>请先登录</div>;
  }

  return (
    <div>
      <h1>个人资料</h1>
      <p>姓名: {user?.first_name} {user?.last_name}</p>
      <p>邮箱: {user?.email}</p>
      <button onClick={signOut}>登出</button>
    </div>
  );
}
```

### 示例 4：修改密码

```typescript
import { authService } from '@/lib/services/auth-service';

async function handleChangePassword() {
  try {
    const result = await authService.changePassword({
      old_password: 'OldPassword123',
      new_password: 'NewPassword456',
    });

    if (result.result) {
      alert('密码修改成功');
    }
  } catch (error) {
    alert('密码修改失败');
  }
}
```

---

## 🔄 认证流程

### 注册流程
```
1. 用户填写注册表单
   ↓
2. 调用 signUp({ first_name, last_name, email, password })
   ↓
3. 发送 POST /auth/register
   ↓
4. 后端返回 { token }
   ↓
5. 保存 Token 到 localStorage
   ↓
6. 调用 GET /auth/me 获取完整用户信息
   ↓
7. 更新全局状态
   ↓
8. 跳转到首页
```

### 登录流程
```
1. 用户输入邮箱密码
   ↓
2. 调用 signIn(email, password)
   ↓
3. 发送 POST /auth/login
   ↓
4. 后端返回 { token, email }
   ↓
5. 保存 Token
   ↓
6. 获取完整用户信息
   ↓
7. 更新状态
   ↓
8. 跳转到首页
```

### 自动认证流程（页面刷新）
```
1. 应用启动
   ↓
2. useAuth Hook 初始化
   ↓
3. 从 localStorage 读取 Token
   ↓
4. 如果 Token 存在:
   - 设置到 API 客户端
   - 调用 GET /auth/me
   - 获取用户信息
   - 更新状态
   ↓
5. 如果 Token 无效:
   - 清理本地存储
   - 设置为未登录状态
```

---

## 🎯 关键特性

### 1. 自动 Token 管理
- ✅ Token 自动保存到 localStorage
- ✅ 自动添加到所有 API 请求的 Authorization Header
- ✅ Token 过期自动清理

### 2. 跨标签页同步
- ✅ 一个标签页登录，其他标签页自动更新
- ✅ 一个标签页登出，其他标签页同步登出

### 3. 自动用户信息加载
- ✅ 登录后自动获取完整用户信息
- ✅ 页面刷新后自动恢复登录状态
- ✅ Token 失效自动清理状态

### 4. 完整的错误处理
- ✅ 网络错误处理
- ✅ 认证失败提示
- ✅ Token 过期处理

---

## 📋 类型定义

### UserRegisterReq (注册请求)
```typescript
interface UserRegisterReq {
  first_name: string;    // 名字
  last_name: string;     // 姓氏
  email: string;         // 邮箱
  password: string;      // 密码
}
```

### LoginReq (登录请求)
```typescript
interface LoginReq {
  email: string;         // 邮箱
  password: string;      // 密码
}
```

### User (用户信息)
```typescript
interface User {
  id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  created_at?: string;
  updated_at?: string;
}
```

---

## ⚙️ 配置

### API 基础地址

确保在 `.env.local` 中配置：
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8888
```

认证接口会自动拼接前缀：
- 注册: `{API_BASE_URL}/auth/register`
- 登录: `{API_BASE_URL}/auth/login`
- 等等...

---

## 🧪 测试

### 测试注册
```bash
curl -X POST http://localhost:8888/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "password": "SecurePassword123"
  }'
```

### 测试登录
```bash
curl -X POST http://localhost:8888/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123"
  }'
```

### 测试获取用户信息
```bash
curl -X GET http://localhost:8888/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔒 安全注意事项

### 1. Token 存储
- ✅ Token 存储在 localStorage
- ⚠️ localStorage 可被 XSS 攻击访问
- 💡 建议：生产环境考虑使用 httpOnly Cookie

### 2. HTTPS
- ⚠️ 生产环境必须使用 HTTPS
- ⚠️ 确保 Token 不通过 HTTP 传输

### 3. Token 过期
- ✅ 后端应设置合理的过期时间
- ✅ 前端自动检测并清理过期 Token
- 💡 建议：实现 Token 刷新机制

---

## 📚 相关文档

- [迁移指南](./MIGRATION_GUIDE.md)
- [API 类型定义](../lib/types/api-v1.ts)
- [认证服务](../lib/services/auth-service.ts)
- [useAuth Hook](../hooks/use-auth.ts)

---

## ✅ 总结

现在你有了一个完整的认证系统：

- ✅ 支持邮箱密码注册/登录
- ✅ 支持短信验证码登录
- ✅ 支持 Google OAuth
- ✅ 自动 Token 管理
- ✅ 跨标签页同步
- ✅ 完整的用户信息管理
- ✅ 密码修改和重置
- ✅ 完整的类型定义

可以直接在项目中使用！🚀

---

**完成日期**: 2025-11-12
**版本**: v1.0.0
**状态**: ✅ 真实认证已实现，可投入使用
