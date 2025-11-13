# Navbar 菜单优化

> **修改日期**: 2025-11-12
> **状态**: ✅ 完成

---

## 🎯 目标

根据用户登录状态显示不同的导航菜单：

- **登录前**: 显示产品介绍相关菜单
- **登录后**: 显示用户功能菜单

---

## 📝 菜单设计

### 登录前菜单

```
┌─────────────────────────────────────────────────┐
│ 🪙 CryptoNiche  [Home] [Features] [About]     │
│                              🌓 [Sign In] [Sign Up] │
└─────────────────────────────────────────────────┘
```

**菜单项**:
- **Home** - 首页
- **Features** - 功能介绍（锚点链接 `#features`）
- **About** - 关于我们（锚点链接 `#about`）

**右侧按钮**:
- 主题切换
- Sign In（登录）
- Sign Up（注册）

---

### 登录后菜单

```
┌─────────────────────────────────────────────────┐
│ 🪙 CryptoNiche  [Home] [Profile]              │
│                              🌓 [👤 User Menu] │
└─────────────────────────────────────────────────┘
```

**菜单项**:
- **Home** - 首页
- **Profile** - 个人中心（包含 Favorites 和 Alerts）

**右侧**:
- 主题切换
- 用户菜单（头像下拉）

---

## 🔧 实现细节

### 桌面端（Desktop）

```typescript
<div className="hidden md:flex items-center space-x-6">
  {/* 始终显示 */}
  <Link href="/">Home</Link>

  {/* 根据登录状态显示不同菜单 */}
  {user ? (
    /* 登录后 */
    <Link href="/profile">Profile</Link>
  ) : (
    /* 登录前 */
    <>
      <Link href="/#features">Features</Link>
      <Link href="/#about">About</Link>
    </>
  )}
</div>
```

### 移动端（Mobile）

相同的逻辑，但显示在下拉菜单中：

```typescript
{mobileMenuOpen && (
  <div className="md:hidden py-4 border-t">
    <Link href="/">Home</Link>

    {user ? (
      <Link href="/profile">Profile</Link>
    ) : (
      <>
        <Link href="/#features">Features</Link>
        <Link href="/#about">About</Link>
      </>
    )}

    {/* 未登录显示登录按钮 */}
    {!user && (
      <div>
        <Button>Sign In</Button>
        <Button>Sign Up</Button>
      </div>
    )}
  </div>
)}
```

---

## 📋 修改的文件

**文件**: `components/layout/navbar.tsx`

**修改内容**:
1. 添加登录前菜单：Features, About
2. 根据 `user` 状态切换显示不同菜单
3. 桌面端和移动端保持一致

---

## 🎨 用户体验

### 登录前
用户可以了解产品功能和背景：
- **Features** - 查看功能特性
- **About** - 了解产品故事
- **Sign In/Up** - 快速注册登录

### 登录后
用户聚焦于使用功能：
- **Profile** - 访问个人中心
  - Favorites 标签页
  - Alerts 标签页
  - Notifications 标签页
  - Settings 标签页
- **User Menu** - 用户头像下拉
  - Profile
  - Settings
  - Sign Out

---

## 🔄 状态转换

```
未登录状态
  ↓
[点击 Sign In]
  ↓
登录成功
  ↓
菜单切换：Features/About → Profile
  ↓
显示用户头像
```

```
已登录状态
  ↓
[点击 Sign Out]
  ↓
登出成功
  ↓
菜单切换：Profile → Features/About
  ↓
显示 Sign In/Sign Up 按钮
```

---

## 📊 菜单对比

| 状态 | 左侧菜单 | 右侧按钮 |
|------|---------|---------|
| **未登录** | Home, Features, About | 主题切换, Sign In, Sign Up |
| **已登录** | Home, Profile | 主题切换, 用户菜单 |

---

## 🚀 未来扩展

可以根据需要添加更多菜单项：

### 登录前可添加
- **Pricing** - 价格方案
- **Blog** - 博客文章
- **Docs** - 帮助文档

### 登录后可添加
- **Markets** - 市场列表
- **Favorites** - 收藏列表（从 Profile 提取）
- **Alerts** - 告警列表（从 Profile 提取）
- **Portfolio** - 投资组合

示例：
```typescript
{user && (
  <>
    <Link href="/markets">Markets</Link>
    <Link href="/favorites">Favorites</Link>
    <Link href="/alerts">Alerts</Link>
    <Link href="/profile">Profile</Link>
  </>
)}
```

---

## ✅ 验证清单

### 桌面端
- [ ] 未登录：显示 Home, Features, About
- [ ] 已登录：显示 Home, Profile
- [ ] 未登录：右侧显示 Sign In, Sign Up
- [ ] 已登录：右侧显示用户头像

### 移动端
- [ ] 点击菜单按钮打开下拉
- [ ] 未登录：显示 Home, Features, About + Sign In/Up 按钮
- [ ] 已登录：显示 Home, Profile
- [ ] 点击菜单项后自动关闭

### 状态切换
- [ ] 登录后菜单自动切换
- [ ] 登出后菜单恢复
- [ ] 刷新页面状态保持

---

## 🎉 总结

导航栏现在会根据用户登录状态智能显示不同的菜单：

**登录前**: 帮助用户了解产品 → 引导注册
**登录后**: 快速访问个人功能 → 提升使用效率

这提供了更好的用户体验和清晰的功能分层！

---

**维护者**: Development Team
**最后更新**: 2025-11-12
**版本**: v1.0.0
**状态**: ✅ 完成
