# 自定义指南

## CSS 变量

`src/styles/global.css` 定义了所有样式变量：

```css
:root {
  --bg: #fdfdfd; /* 日间纸白 */
  --ink: #131c2c; /* 深蓝黑油墨 */
  --accent: #31577f; /* 钢蓝 */
  --gold: #a8894f; /* 低饱和金 */
  --block: #16233a; /* 实色块 */
  --disp-cool: rgb(47 104 166 / 0.55); /* 套印冷色鬼影 */
  --disp-warm: rgb(176 92 66 / 0.42); /* 套印暖色鬼影 */
  --sidebar-w: 272px;
  /* ... */
}

[data-theme="dark"] {
  --bg: #0c131e;
  --ink: #dce4f2;
  --accent: #d9bf86;
  --block: #d9bf86;
  /* ... */
}
```

## 背景层

页面背景由 `src/layouts/PageLayout.astro` 里的 `.poster` 静态图层构成，不使用动画或粒子：

- `.poster-field` — 右上角实色蓝块
- `.poster-disc` — 细线圆环
- `.poster-rule` — 斜向结构线
- `.poster-bar` — 金色竖条
- `.poster-square` / `.poster-strip` — 实色方形与印刷色条
- `.poster-cross` — 套准十字

所有形状的颜色来自 `global.css` 的 `--gold`、`--accent-2`、`--poster-line` 等变量，可整体替换。

> 旧版弹簧粒子背景的渲染代码保留在 `src/lib/sky` 与 `src/components/Sky.svelte`，当前页面不再挂载；如需恢复，在 `PageLayout.astro` 中重新引入即可。

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

1. **不要删除 `client:load`** - Svelte 组件需要此指令才能在客户端交互
2. **图片资源** - 放在 `public/` 目录，直接用 `/filename` 引用
3. **颜色格式** - CSS 变量中使用的颜色需要是标准十六进制或 rgba 格式
4. **URL 规范** - 外部链接会自动添加 `target="_blank"` 和安全属性
