# 收藏功能故障排查指南

## ❌ 错误：SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON

### 问题原因

API 返回了 HTML 页面而不是 JSON 数据，通常是因为：
1. API 路由不存在（404）
2. 请求地址错误
3. 后端服务未启动

### 解决方案

已修复：收藏服务现在直接调用后端 API（绕过 Next.js 路由）

**修改内容**:
- `lib/services/favorites-service.ts` - 直接使用 `env.api.baseUrl` 构建请求

**API 路径**:
```
添加收藏: POST {BASE_URL}/core/favorite
取消收藏: POST {BASE_URL}/core/unfavorite
获取列表: GET {BASE_URL}/core/favorites
```

### 检查清单

#### 1. 检查后端服务是否运行

```bash
# 测试后端服务
curl http://localhost:7881/health

# 或者检查收藏接口（需要token）
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:7881/core/favorites
```

#### 2. 检查环境变量

```bash
# 查看 .env.local
cat .env.local | grep NEXT_PUBLIC_API_BASE_URL
```

应该输出：
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:7881
```

#### 3. 检查 JWT Token

打开浏览器控制台：
```javascript
// 检查 localStorage 中的 token
localStorage.getItem('auth_token')
```

如果返回 `null`，说明用户未登录。

#### 4. 检查网络请求

打开浏览器开发者工具 -> Network 标签：

**正确的请求**:
```
Request URL: http://localhost:7881/core/favorite
Request Method: POST
Status: 200
Response: { "success": true }
```

**错误的请求**:
```
Request URL: http://localhost:3000/core/favorite (错误！)
Status: 404
Response: <!DOCTYPE html>... (HTML 页面)
```

---

## ❌ 错误：Failed to fetch / Network error

### 问题原因

1. 后端服务未启动
2. 端口不正确
3. CORS 问题

### 解决方案

#### 1. 启动后端服务

```bash
# 根据你的后端项目启动方式
cd backend
go run main.go  # 或其他启动命令
```

#### 2. 检查端口配置

确保 `.env.local` 中的端口与后端实际运行端口一致：

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:7881  # 检查端口号
```

#### 3. 检查 CORS 配置

后端需要允许前端域名的跨域请求：

```go
// 后端 CORS 配置示例
cors.AllowOrigins = []string{
    "http://localhost:3000",  // Next.js 开发服务器
    "https://your-production-domain.com",
}
```

---

## ❌ 错误：401 Unauthorized

### 问题原因

JWT Token 无效或已过期

### 解决方案

#### 1. 重新登录

清除旧的 token 并重新登录：

```javascript
// 浏览器控制台
localStorage.removeItem('auth_token');
// 然后重新登录
```

#### 2. 检查 Token 格式

```javascript
// 浏览器控制台
const token = localStorage.getItem('auth_token');
console.log('Token:', token);

// Token 应该是 JWT 格式：eyJhbGciOiJIUzI1NiIs...
```

#### 3. 检查后端 Token 验证

确保后端正确验证 JWT Token：
- 检查签名密钥
- 检查 Token 过期时间
- 检查 Token 解析逻辑

---

## ❌ 错误：收藏状态不同步

### 问题原因

React Query 缓存未正确刷新

### 解决方案

检查 `use-favorites-query.ts` 中的缓存刷新逻辑：

```typescript
onSuccess: () => {
  // 确保刷新所有相关缓存
  queryClient.invalidateQueries({ queryKey: favoritesKeys.lists() });
  queryClient.invalidateQueries({ queryKey: currencyKeys.lists() });
  queryClient.invalidateQueries({ queryKey: currencyKeys.details() });
}
```

---

## ❌ 错误：点击收藏按钮无响应

### 问题原因

1. 未登录
2. JavaScript 错误
3. 事件冒泡被阻止

### 解决方案

#### 1. 检查登录状态

```typescript
const { isAuthenticated } = useAuth();
console.log('Is authenticated:', isAuthenticated);
```

#### 2. 检查控制台错误

打开浏览器控制台，查看是否有 JavaScript 错误。

#### 3. 检查按钮禁用状态

```typescript
<FavoriteButton
  disabled={toggleFavorite.isPending}  // 检查是否一直处于禁用状态
/>
```

---

## ✅ 测试收藏功能

### 手动测试步骤

1. **登录**
   - 打开应用
   - 点击 "Sign In" 登录
   - 确认登录成功（显示用户信息）

2. **添加收藏**
   - 在首页找到任意加密货币
   - 点击空心爱心按钮
   - 确认：
     - 按钮变为红色实心爱心
     - 显示成功提示 "Added to favorites"

3. **查看收藏列表**
   - 点击右上角用户头像
   - 选择 "Profile"
   - 切换到 "Favorites" 标签
   - 确认：刚才收藏的货币出现在列表中

4. **取消收藏**
   - 在收藏列表中点击红色爱心按钮
   - 确认：
     - 该货币从列表中消失
     - 显示成功提示 "Removed from favorites"

5. **跨页面同步**
   - 在首页添加收藏
   - 打开 Profile 页面，确认显示在收藏列表
   - 在 Profile 页面取消收藏
   - 返回首页，确认按钮变回空心

### API 测试

使用 curl 测试后端接口：

```bash
# 1. 登录获取 token
TOKEN=$(curl -X POST http://localhost:7881/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  | jq -r '.token')

# 2. 添加收藏
curl -X POST http://localhost:7881/core/favorite \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"cmc_id":1}'

# 3. 获取收藏列表
curl http://localhost:7881/core/favorites \
  -H "Authorization: Bearer $TOKEN"

# 4. 取消收藏
curl -X POST http://localhost:7881/core/unfavorite \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"cmc_id":1}'
```

---

## 📞 获取帮助

如果问题仍未解决：

1. **检查后端日志**：查看后端服务的日志输出
2. **检查浏览器控制台**：查看 JavaScript 错误和网络请求
3. **检查环境变量**：确认所有配置正确
4. **重启服务**：重启前端和后端服务

---

**最后更新**: 2025-11-12
**版本**: v1.0.0
