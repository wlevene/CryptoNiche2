# API 客户端测试指南

> **测试日期**: 2025-11-13
> **目的**: 验证自动 JWT token 管理和 401 错误处理

---

## 🧪 测试环境准备

### 前置条件

1. ✅ 后端服务运行在 `http://localhost:7881`
2. ✅ 前端服务运行在 `http://localhost:3000`
3. ✅ `.env.local` 配置正确：
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:7881
   ```

### 准备测试账号

创建一个测试用户或使用现有账号：
- 邮箱: `test@example.com`
- 密码: `Test123456`

---

## 📋 测试场景

### 场景 1: 登录和 Token 自动保存

**目的**: 验证登录后 token 正确保存并自动添加到后续请求

**步骤**:
1. 打开浏览器开发者工具 → Console 和 Network 标签
2. 访问 `http://localhost:3000`
3. 点击 "Sign In" 按钮
4. 输入邮箱和密码
5. 点击登录

**预期结果**:
```
✅ Console 输出:
   - "User info loaded: { id: '...', email: 'test@example.com', ... }"

✅ Network 请求:
   - POST /auth/login
   - Response: { token: "eyJhbGc...", ... }

✅ LocalStorage 检查:
   - auth_token: "eyJhbGc..."
   - auth_user: "{ id: '...', email: 'test@example.com', ... }"

✅ UI 变化:
   - 导航栏显示 "Profile" 和用户头像
   - "Sign In" 和 "Sign Up" 按钮消失
```

**验证方法**:
```javascript
// 在浏览器 Console 中执行
console.log('Token:', localStorage.getItem('auth_token'));
console.log('User:', localStorage.getItem('auth_user'));
```

---

### 场景 2: Token 自动添加到 API 请求

**目的**: 验证访问需要认证的接口时，token 自动添加到请求头

**步骤**:
1. 确保已登录（完成场景 1）
2. 点击导航栏的 "Profile"
3. 点击 "Favorites" 标签页
4. 打开 Network 标签观察请求

**预期结果**:
```
✅ Network 请求:
   GET /core/favorites
   Headers:
   {
     "Authorization": "Bearer eyJhbGc...",
     "Content-Type": "application/json"
   }

✅ Response:
   200 OK
   {
     "items": [...],
   }

✅ UI 显示:
   - 收藏列表正确显示
   - 或显示 "No favorites yet"（如果没有收藏）
```

**验证方法**:
在 Network 标签中点击 `/core/favorites` 请求：
- 查看 Request Headers
- 确认存在 `Authorization: Bearer <token>`

---

### 场景 3: 401 错误自动处理

**目的**: 验证 token 过期或无效时，系统自动清理并重定向

**步骤**:

#### 方法 A: 手动删除 token（模拟过期）

1. 确保已登录
2. 在 Console 中执行：
   ```javascript
   localStorage.setItem('auth_token', 'invalid_token_12345');
   ```
3. 访问 Profile 页面
4. 点击 "Alerts" 标签页
5. 尝试创建新告警

**预期结果**:
```
✅ Console 输出:
   - "401 Unauthorized: Clearing auth data and redirecting to home"
   - "Received auth:unauthorized event, clearing user state"

✅ LocalStorage 被清空:
   - auth_token: null
   - auth_user: null

✅ 自动重定向:
   - 页面自动跳转到 "/"

✅ UI 更新:
   - 导航栏显示 "Sign In" 和 "Sign Up" 按钮
   - "Profile" 和用户头像消失
```

#### 方法 B: 等待 token 自然过期

1. 登录后等待 token 过期（取决于后端配置的过期时间）
2. 刷新页面或访问需要认证的页面
3. 观察是否自动处理

---

### 场景 4: 创建 Alert（需要认证）

**目的**: 验证创建告警时 token 正确传递

**步骤**:
1. 确保已登录
2. 访问 Profile → Alerts 标签页
3. 点击 "New Alert" 按钮
4. 填写表单：
   - 选择货币: BTC
   - Alert Type: Price Change Percentage
   - Percentage: 5.0
   - Direction: Both
   - Frequency: Immediate
5. 点击 "Create Alert"
6. 观察 Network 请求

**预期结果**:
```
✅ Network 请求:
   POST /api/v1/currency/alerts
   Headers:
   {
     "Authorization": "Bearer eyJhbGc...",
     "Content-Type": "application/json"
   }
   Body:
   {
     "crypto_id": 1,
     "alert_type": "price_change",
     "threshold_percentage": 5.0,
     "direction": "both",
     "notification_frequency": "immediate"
   }

✅ Response:
   200 OK
   {
     "success": true,
     "data": { ... }
   }

✅ UI 反馈:
   - 显示成功提示: "Price alert created successfully!"
   - 表单重置
   - Alert 列表更新（如果有显示）
```

---

### 场景 5: 收藏功能（需要认证）

**目的**: 验证收藏操作时 token 正确传递

**步骤**:
1. 确保已登录
2. 访问首页 `/`
3. 找到任意加密货币卡片
4. 点击 ❤️ 收藏按钮
5. 观察 Network 请求

**预期结果**:
```
✅ Network 请求:
   POST /core/favorite
   Headers:
   {
     "Authorization": "Bearer eyJhbGc...",
     "Content-Type": "application/json"
   }
   Body:
   {
     "cmc_id": 1
   }

✅ Response:
   200 OK
   {
     "success": true
   }

✅ UI 反馈:
   - ❤️ 按钮变为实心红色
   - 显示成功提示
   - Profile → Favorites 列表更新
```

---

### 场景 6: 登出清理

**目的**: 验证登出时正确清理所有认证数据

**步骤**:
1. 确保已登录
2. 点击用户头像（右上角）
3. 点击 "Sign Out"
4. 观察 Console 和 Network

**预期结果**:
```
✅ Network 请求:
   POST /auth/logout
   Headers:
   {
     "Authorization": "Bearer eyJhbGc..."
   }

✅ LocalStorage 清空:
   - auth_token: null
   - auth_user: null

✅ UI 更新:
   - 导航栏显示 "Sign In" 和 "Sign Up"
   - "Profile" 和用户头像消失
   - 如果在 Profile 页面，自动跳转到首页
```

---

### 场景 7: 跨标签页同步

**目的**: 验证多个标签页之间的认证状态同步

**步骤**:
1. 打开两个标签页 A 和 B，都访问 `http://localhost:3000`
2. 在标签页 A 登录
3. 观察标签页 B 的变化

**预期结果**:
```
✅ 标签页 A:
   - 成功登录
   - UI 显示已登录状态

✅ 标签页 B (自动):
   - 检测到 storage 事件
   - 重新加载用户信息
   - UI 自动更新为已登录状态
```

**然后**:
4. 在标签页 A 登出
5. 观察标签页 B 的变化

**预期结果**:
```
✅ 标签页 A:
   - 成功登出
   - UI 显示未登录状态

✅ 标签页 B (自动):
   - 检测到 storage 事件
   - 清除用户状态
   - UI 自动更新为未登录状态
```

---

## 🔍 调试技巧

### 查看所有 API 请求的 Headers

在 Console 中执行：
```javascript
// 拦截所有 fetch 请求
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('🌐 Fetch:', args[0], args[1]);
  return originalFetch.apply(this, args);
};
```

### 监听认证事件

```javascript
// 监听 auth:unauthorized 事件
window.addEventListener('auth:unauthorized', () => {
  console.log('🚨 Auth unauthorized event triggered!');
});

// 监听 storage 事件
window.addEventListener('storage', (e) => {
  console.log('📦 Storage change:', e.key, e.newValue);
});
```

### 检查当前认证状态

```javascript
// 在任何时候检查认证状态
const token = localStorage.getItem('auth_token');
const user = JSON.parse(localStorage.getItem('auth_user') || '{}');

console.log('🔐 Auth Status:', {
  isAuthenticated: !!token,
  token: token?.substring(0, 20) + '...',
  user: user.email || 'Not logged in'
});
```

---

## ❌ 常见问题排查

### 问题 1: 401 错误但没有重定向

**可能原因**:
- apiClient 未正确处理 401
- 浏览器控制台有错误

**检查**:
```javascript
// 确认 apiClient 是否正确导入
console.log(typeof apiClient.handle401Error);
// 应该输出: "function"
```

### 问题 2: Token 存在但请求没有 Authorization header

**可能原因**:
- 使用了 fetch 而不是 apiClient
- apiClient.getToken() 返回 null

**检查**:
```javascript
// 检查 token 是否存在
console.log('Token exists:', !!localStorage.getItem('auth_token'));

// 检查 apiClient 是否能获取 token
import apiClient from '@/lib/api-client';
console.log('apiClient token:', apiClient.getToken());
```

### 问题 3: 登录后 user 状态为 null

**可能原因**:
- loadUserInfo() 失败
- 后端 /auth/me 接口错误

**检查**:
```javascript
// 手动调用加载用户信息
import { authService } from '@/lib/services/auth-service';
authService.getMe()
  .then(user => console.log('User info:', user))
  .catch(err => console.error('Failed to load user:', err));
```

---

## ✅ 测试检查清单

完成以下所有测试场景：

- [ ] 场景 1: 登录和 Token 保存
- [ ] 场景 2: Token 自动添加到请求
- [ ] 场景 3: 401 错误自动处理
- [ ] 场景 4: 创建 Alert
- [ ] 场景 5: 收藏功能
- [ ] 场景 6: 登出清理
- [ ] 场景 7: 跨标签页同步

验证以下功能：

- [ ] 所有 API 请求自动包含 Authorization header
- [ ] 401 错误自动清除认证数据
- [ ] 401 错误自动重定向到首页
- [ ] useAuth hook 正确更新用户状态
- [ ] 跨标签页状态同步工作正常
- [ ] 登出时正确清理所有数据
- [ ] 无 Console 错误

---

## 📊 测试报告模板

```markdown
## API 客户端测试报告

**测试日期**: 2025-11-13
**测试人员**: [Your Name]
**环境**: 开发环境

### 测试结果汇总

| 场景 | 状态 | 备注 |
|------|------|------|
| 场景 1: 登录和 Token 保存 | ✅/❌ | |
| 场景 2: Token 自动添加 | ✅/❌ | |
| 场景 3: 401 错误处理 | ✅/❌ | |
| 场景 4: 创建 Alert | ✅/❌ | |
| 场景 5: 收藏功能 | ✅/❌ | |
| 场景 6: 登出清理 | ✅/❌ | |
| 场景 7: 跨标签页同步 | ✅/❌ | |

### 发现的问题

1. [问题描述]
   - **严重程度**: 高/中/低
   - **重现步骤**: ...
   - **预期行为**: ...
   - **实际行为**: ...

### 建议

- [改进建议 1]
- [改进建议 2]
```

---

**维护者**: Development Team
**最后更新**: 2025-11-13
**版本**: v1.0.0
