# CryptoNiche 2.0

现代化的加密货币智能分析平台，基于 Next.js 14 + Supabase + Vercel 构建。

## ✨ 功能特性

- 🚀 **实时市场数据** - 多数据源整合，提供最准确的价格信息
- 🤖 **智能分析助手** - AI驱动的市场分析和投资建议
- 📊 **数据可视化** - 专业的K线图表和技术指标
- 🔐 **用户系统** - 完整的认证和个人偏好管理
- 🌙 **暗黑模式** - 支持明暗主题切换
- 📱 **响应式设计** - 完美适配桌面和移动设备

## 🛠️ 技术栈

### 前端
- **Next.js 14** - App Router + TypeScript
- **Tailwind CSS** + **shadcn/ui** - 现代化UI设计
- **Lucide React** - 精美图标库
- **Zustand** - 轻量状态管理
- **React Query** - 数据获取和缓存

### 后端
- **Supabase** - PostgreSQL数据库 + 认证 + 实时订阅
- **Next.js API Routes** - 服务端API
- **Row Level Security** - 数据安全保护

### 部署
- **Vercel** - 零配置部署
- **Edge Computing** - 全球CDN加速

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 环境配置
复制 `.env.local.example` 为 `.env.local` 并配置：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Keys
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key
COINGECKO_API_KEY=your_coingecko_api_key

# OpenAI (for AI features)
OPENAI_API_KEY=your_openai_api_key
```

### 3. 数据库设置
在 Supabase 中执行 `supabase/schema.sql` 创建数据库结构

### 4. 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:3000 查看应用。

## 📁 项目结构

```
crypto-niche-v2/
├── 📂 src/app/                 # Next.js App Router
│   ├── layout.tsx              # 根布局
│   ├── page.tsx                # 首页
│   └── globals.css             # 全局样式
├── 📂 components/              # React组件
│   ├── ui/                     # 基础UI组件
│   ├── layout/                 # 布局组件
│   └── sections/               # 页面区块组件
├── 📂 lib/                     # 工具库
│   ├── utils.ts                # 通用工具函数
│   └── supabase.ts             # Supabase客户端
├── 📂 supabase/                # 数据库配置
│   └── schema.sql              # 数据库结构
└── 📄 package.json             # 依赖配置
```

## 🎨 设计系统

项目采用 **Linear 风格**的现代化设计：

- **简洁直观** - 清晰的信息层次
- **一致性** - 统一的视觉语言
- **响应式** - 适配所有设备

## 🚀 部署指南

### Vercel 部署
1. 连接 GitHub 仓库到 Vercel
2. 配置环境变量
3. 自动部署完成

## 📈 开发路线图

### Phase 1 ✅
- [x] 项目基础架构
- [x] UI组件系统
- [x] 主页和市场概览
- [x] 主题切换功能

### Phase 2 🚧
- [ ] 用户认证系统
- [ ] 加密货币详情页
- [ ] 实时数据获取
- [ ] 图表集成

### Phase 3 📋
- [ ] 智能分析助手
- [ ] 投资组合管理
- [ ] 价格预警功能

---

⭐ 基于 Next.js 14 构建的现代化加密货币分析平台

---

## 📝 更新日志
- 2026-03-12: 代码维护交接完成 - 龙龙 🐉
