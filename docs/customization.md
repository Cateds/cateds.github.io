# 自定义指南

## CSS 变量

`src/styles/global.css` 定义了所有样式变量：

```css
:root {
  --color-bg: #f7f9fa;
  --color-text: #1e2a2d;
  --color-accent: #4a8a8f;
  --sidebar-width: 240px;
  /* ... */
}

[data-theme="dark"] {
  --color-bg: #131a1c;
  --color-text: #e8f0f2;
  /* ... */
}
```

## 粒子背景配置

粒子背景组件支持以下参数（在 `src/layouts/PageLayout.astro` 中修改）。组件会优先使用 WebGPU，在不支持或初始化失败时自动回退到 Canvas 2D：

```tsx
<ParticleBackground
  client:load
  spacing={25} // 粒子间距
  springStiffness={0.018} // 弹簧刚度
  damping={0.92} // 阻尼系数
  mouseRadius={500} // 鼠标影响半径
  mouseStrength={12000} // 鼠标排斥力
  particleRadius={1.5} // 粒子半径
  flowSpeed={0.008} // 流场动画速度
  flowScale={0.0012} // 流场噪声缩放
  flowStrength={25} // 流场位移强度
  renderScale={0.75} // 内部分辨率缩放，越低越省性能
/>
```

## 类型定义

所有数据类型定义在 `src/types/index.ts`，可按需扩展：

```typescript
interface Profile {
  name: string;
  avatar?: string;
  bio?: string;
  navLinks: NavLink[];
  externalLinks: ExternalLink[];
}

interface Subject {
  id: string;
  name: string;
  description?: string;
  url: string;
  color?: string;
}

interface Repo {
  id: string;
  name: string;
  description?: string;
  url: string;
  language?: string;
  stars?: number;
  forks?: number;
  color?: string;
}

interface LinkItem {
  id: string;
  name: string;
  description?: string;
  url: string;
  icon?: string;
  color?: string;
}
```

## 配置辅助函数

`src/config/index.ts` 提供了配置辅助函数：

```typescript
// 创建自定义配置
createConfig(partialConfig: Partial<SiteConfig>): SiteConfig

// 更新个人资料
updateProfile(partialProfile: Partial<Profile>): Profile

// 添加学期
addSemester(semester: Semester): Semester[]

// 添加仓库
addRepo(repo: Repo): Repo[]

// 添加链接
addLink(link: LinkItem): LinkItem[]
```

## 扩展图标

### 导航图标

在 `src/components/Sidebar.tsx` 中扩展 `navIconMap` 或 `externalIconMap`：

```typescript
const navIconMap: Record<string, JSX.Element> = {
  notes: <svg>...</svg>,
  // 添加新图标
  custom: <svg>...</svg>,
}
```

### 链接图标

在 `src/components/LinkCard.tsx` 中扩展 `iconMap`：

```typescript
const iconMap: Record<string, JSX.Element> = {
  cards: <svg>...</svg>,
  // 添加新图标
  custom: <svg>...</svg>,
}
```

## 注意事项

1. **不要删除 `client:load`** - SolidJS 组件需要此指令才能在客户端交互
2. **图片资源** - 放在 `public/` 目录，直接用 `/filename` 引用
3. **颜色格式** - CSS 变量中使用的颜色需要是标准十六进制或 rgba 格式
4. **URL 规范** - 外部链接会自动添加 `target="_blank"` 和安全属性
