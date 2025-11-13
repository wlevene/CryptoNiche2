# Alert API Token 修复

> **修复日期**: 2025-11-13
> **状态**: ✅ 已修复

---

## 🐛 问题描述

### 症状

Alert 功能访问 API 时遇到 401 错误：

```
http://localhost:3000/api/v1/currency/alerts
Request Method: GET
Status Code: 401 Unauthorized
```

### 根本原因

`alert-list.tsx` 组件直接使用 `fetch()` 调用 API，没有添加 Authorization header：

```typescript
// ❌ 问题代码
const response = await fetch('/api/v1/currency/alerts');
// 缺少 Authorization: Bearer <token>
```

这导致：
1. 请求没有包含 JWT token
2. 后端返回 401 Unauthorized
3. Alert 列表无法加载

---

## ✅ 解决方案

### 使用 Alert Service 层

项目中已经有完善的 `alert-service-v2.ts`，它使用 `apiClient` 自动添加 token。我们只需要将组件改为使用这个 service。

### 修改文件

**文件**: `components/alerts/alert-list.tsx`

### 修改内容

#### 1. 导入 Alert Service

```typescript
// ✅ 添加导入
import { alertServiceV2 } from "@/lib/services/alert-service-v2";
```

#### 2. 修改 fetchAlerts

```typescript
// ❌ 修改前 - 直接使用 fetch
const fetchAlerts = async () => {
  try {
    const response = await fetch('/api/v1/currency/alerts');
    const result = await response.json();
    if (result.success) {
      setAlerts(result.data);
    }
  } catch (error) {
    toast.error('Failed to load alerts');
  }
};

// ✅ 修改后 - 使用 alertServiceV2
const fetchAlerts = async () => {
  try {
    const result = await alertServiceV2.getAlerts();
    // result 是 AlertListReply: { items: Alert[], total: number }
    if (result && result.items) {
      setAlerts(result.items as any);
    }
  } catch (error) {
    console.error('Error fetching alerts:', error);
    toast.error('Failed to load alerts');
  } finally {
    setIsLoading(false);
  }
};
```

#### 3. 修改 toggleAlert

```typescript
// ❌ 修改前
const toggleAlert = async (alertId: string, isActive: boolean) => {
  const response = await fetch(`/api/v1/currency/alerts/${alertId}/toggle`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_active: isActive }),
  });
  // ...
};

// ✅ 修改后
const toggleAlert = async (alertId: string, isActive: boolean) => {
  try {
    await alertServiceV2.toggleAlert(alertId, isActive);
    toast.success(`Alert ${isActive ? 'activated' : 'deactivated'}`);
    fetchAlerts();
    onRefresh?.();
  } catch (error) {
    console.error('Error toggling alert:', error);
    toast.error('Failed to update alert');
  }
};
```

#### 4. 修改 deleteAlert

```typescript
// ❌ 修改前
const deleteAlert = async (alertId: string) => {
  const response = await fetch(`/api/v1/currency/alerts/${alertId}`, {
    method: 'DELETE',
  });
  // ...
};

// ✅ 修改后
const deleteAlert = async (alertId: string) => {
  if (!confirm('Are you sure you want to delete this alert?')) {
    return;
  }

  try {
    await alertServiceV2.deleteAlert(alertId);
    toast.success('Alert deleted successfully');
    fetchAlerts();
    onRefresh?.();
  } catch (error) {
    console.error('Error deleting alert:', error);
    toast.error('Failed to delete alert');
  }
};
```

---

## 🔍 技术分析

### Alert Service V2 架构

**文件**: `lib/services/alert-service-v2.ts`

```typescript
export class AlertServiceV2 {
  /**
   * 获取告警列表
   * ✅ 自动添加 Authorization header
   */
  async getAlerts(params?: AlertListReq): Promise<AlertListReply> {
    return apiClient.get<AlertListReply>('/api/v1/currency/alerts', params);
  }

  /**
   * 切换告警状态
   * ✅ 自动添加 Authorization header
   */
  async toggleAlert(id: string, isActive: boolean): Promise<Alert> {
    return apiClient.patch<Alert>(`/api/v1/currency/alerts/${id}/toggle`, {
      is_active: isActive,
    });
  }

  /**
   * 删除告警
   * ✅ 自动添加 Authorization header
   */
  async deleteAlert(id: string): Promise<void> {
    return apiClient.delete<void>(`/api/v1/currency/alerts/${id}`);
  }
}
```

### 数据流程

#### 修复前（有问题）

```
alert-list.tsx
  ↓ fetch('/api/v1/currency/alerts')
  ↓ 没有 Authorization header
Next.js API Route
  ↓ 转发到后端
后端 API
  ↓ 检查 Authorization
  ❌ 401 Unauthorized
```

#### 修复后（正常）

```
alert-list.tsx
  ↓ alertServiceV2.getAlerts()
  ↓
alertServiceV2
  ↓ apiClient.get('/api/v1/currency/alerts')
  ↓
apiClient
  ↓ 自动从 localStorage 读取 token
  ↓ 添加 Authorization: Bearer <token>
  ↓
Next.js API Route
  ↓ 转发到后端（带 token）
后端 API
  ↓ 验证 token
  ✅ 200 OK
  ↓ 返回 Alert 列表
```

---

## 📊 修复影响

### 修复的功能

1. ✅ **查看 Alert 列表** (`/profile` → Alerts 标签页)
   - 现在能正确加载告警列表

2. ✅ **切换 Alert 状态**
   - 激活/停用告警功能正常工作

3. ✅ **删除 Alert**
   - 删除告警功能正常工作

4. ✅ **创建 Alert**
   - 之前已经在 `alert-form.tsx` 中修复

### 代码改进

- ✅ 统一使用 Service 层
- ✅ 自动 token 管理
- ✅ 统一错误处理
- ✅ 代码更简洁

---

## 🧪 测试场景

### 场景 1: 查看 Alert 列表

**步骤**:
1. 登录账号
2. 访问 Profile → Alerts 标签页
3. 观察列表显示

**预期结果**:
```
✅ 有 Alerts:
   - 显示告警列表
   - 每个告警显示：加密货币名称、类型、阈值、状态等

✅ 无 Alerts:
   - 显示 "No alerts yet" 空状态
   - 显示 "New Alert" 按钮
```

### 场景 2: 创建 Alert

**步骤**:
1. 点击 "New Alert" 按钮
2. 填写表单：
   - 选择加密货币：BTC
   - Alert Type: Price Change Percentage
   - Percentage: 5.0%
   - Direction: Both
   - Frequency: Immediate
3. 点击 "Create Alert"

**预期结果**:
```
✅ Network 请求:
   POST /api/v1/currency/alerts
   Headers: { Authorization: "Bearer ..." }
   Status: 200 OK

✅ UI 反馈:
   - 显示成功提示
   - 表单重置
   - Alert 列表自动刷新并显示新告警
```

### 场景 3: 切换 Alert 状态

**步骤**:
1. 在 Alert 列表中找到一个告警
2. 点击 Active/Inactive 开关
3. 观察状态变化

**预期结果**:
```
✅ Network 请求:
   PATCH /api/v1/currency/alerts/{id}/toggle
   Headers: { Authorization: "Bearer ..." }
   Body: { is_active: true/false }
   Status: 200 OK

✅ UI 反馈:
   - 显示成功提示: "Alert activated" / "Alert deactivated"
   - 开关状态立即更新
   - 列表自动刷新
```

### 场景 4: 删除 Alert

**步骤**:
1. 点击某个告警的删除按钮
2. 确认删除对话框
3. 观察列表更新

**预期结果**:
```
✅ Network 请求:
   DELETE /api/v1/currency/alerts/{id}
   Headers: { Authorization: "Bearer ..." }
   Status: 200 OK

✅ UI 反馈:
   - 显示确认对话框
   - 显示成功提示: "Alert deleted successfully"
   - 该告警从列表中消失
   - 列表自动刷新
```

---

## 🔧 调试技巧

### 验证 Token 传递

在浏览器 Console 中执行：
```javascript
// 手动调用 alertServiceV2
import { alertServiceV2 } from '@/lib/services/alert-service-v2';

alertServiceV2.getAlerts()
  .then(alerts => console.log('Alerts:', alerts))
  .catch(err => console.error('Error:', err));
```

### 检查 Network 请求

在 Network 标签中：
1. 找到 `/api/v1/currency/alerts` 请求
2. 查看 Request Headers
3. 确认存在 `Authorization: Bearer <token>`

### 验证 apiClient 配置

```javascript
import apiClient from '@/lib/api-client';

// 检查 token
console.log('Token:', apiClient.getToken());

// 手动调用 API
apiClient.get('/api/v1/currency/alerts')
  .then(data => console.log('Data:', data))
  .catch(err => console.error('Error:', err));
```

---

## 📋 代码对比总结

### 修改前（问题代码）

```typescript
// ❌ 直接使用 fetch，没有 token
const fetchAlerts = async () => {
  const response = await fetch('/api/v1/currency/alerts');
  const result = await response.json();
  setAlerts(result.data);
};

const toggleAlert = async (alertId: string, isActive: boolean) => {
  const response = await fetch(`/api/v1/currency/alerts/${alertId}/toggle`, {
    method: 'PUT',
    body: JSON.stringify({ is_active: isActive }),
  });
};

const deleteAlert = async (alertId: string) => {
  const response = await fetch(`/api/v1/currency/alerts/${alertId}`, {
    method: 'DELETE',
  });
};
```

### 修改后（修复代码）

```typescript
// ✅ 使用 alertServiceV2，自动添加 token
import { alertServiceV2 } from "@/lib/services/alert-service-v2";

const fetchAlerts = async () => {
  const result = await alertServiceV2.getAlerts();
  if (result && result.items) {
    setAlerts(result.items as any);
  }
};

const toggleAlert = async (alertId: string, isActive: boolean) => {
  await alertServiceV2.toggleAlert(alertId, isActive);
  toast.success(`Alert ${isActive ? 'activated' : 'deactivated'}`);
  fetchAlerts();
};

const deleteAlert = async (alertId: string) => {
  if (!confirm('Are you sure you want to delete this alert?')) return;
  await alertServiceV2.deleteAlert(alertId);
  toast.success('Alert deleted successfully');
  fetchAlerts();
};
```

**优势**:
- ✅ 代码更简洁（减少 ~40 行）
- ✅ 自动添加 Authorization header
- ✅ 统一的错误处理
- ✅ 类型安全
- ✅ 更易维护

---

## ⚠️ 注意事项

### 1. Service 层统一性

确保所有 API 调用都通过 Service 层：
- ✅ `alertServiceV2` - Alert 相关
- ✅ `favoritesService` - 收藏相关
- ✅ `authService` - 认证相关
- ❌ 避免直接使用 `fetch()`

### 2. Token 自动管理

所有 Service 都使用 `apiClient`，它会：
- 自动从 localStorage 读取 token
- 自动添加到 Authorization header
- 401 错误自动清理和重定向

### 3. 类型安全

使用 Service 层的好处：
```typescript
// ✅ 类型安全
const result: AlertListReply = await alertServiceV2.getAlerts();
result.items.forEach(alert => {
  // TypeScript 知道 alert 的类型
});

// ❌ 类型不安全
const response = await fetch('/api/v1/currency/alerts');
const result = await response.json();
// result 是 any 类型
```

---

## ✅ 验证清单

- [x] 导入 `alertServiceV2`
- [x] 修改 `fetchAlerts()` 使用 service
- [x] 修改 `toggleAlert()` 使用 service
- [x] 修改 `deleteAlert()` 使用 service
- [x] Next.js 编译成功
- [x] 无 TypeScript 错误
- [x] Alert 列表正常加载
- [x] 切换 Alert 状态正常
- [x] 删除 Alert 正常

---

## 📚 相关文档

- [API 客户端改进](./API_CLIENT_IMPROVEMENTS.md)
- [Favorites 数据格式修复](./FAVORITES_DATA_FORMAT_FIX.md)
- [登录功能修复](./LOGIN_FEATURES_FIX.md)

---

**维护者**: Development Team
**最后更新**: 2025-11-13
**版本**: v2.2.2
**状态**: ✅ 已修复并测试通过
