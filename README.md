# Personal Homepage

基于 Astro + SolidJS 的个人主页，采用暖色调配色和清爽扁平风格，包含弹性粒子背景效果。

## 功能特性

- **Notes** - 按学期组织的笔记，可展开学科卡片
- **Repos** - GitHub 仓库卡片展示
- **Blog** - 时间轴布局的博客，支持标签筛选
- **Tools** - 工具链接页面
- **粒子背景** - 弹簧振子模型 + Perlin 噪声流场
- **深色/浅色主题** - 跟随系统或手动切换
- **响应式设计** - 适配移动端

---

## 项目架构

```text
src/
├── components/           # SolidJS 组件
│   ├── ParticleBackground.tsx   # 粒子背景（可配置参数）
│   ├── Sidebar.tsx              # 玻璃态侧边栏
│   ├── ThemeToggle.tsx          # 主题切换
│   ├── SemesterDrawer.tsx       # 学期折叠抽屉
│   ├── SubjectCard.tsx          # 学科卡片
│   ├── RepoCard.tsx             # 仓库卡片
│   ├── BlogCard.tsx             # 博客卡片
│   └── ToolCard.tsx             # 工具卡片
│
├── config/               # 配置系统
│   ├── index.ts                 # 配置导出与辅助函数
│   └── default.ts               # 默认配置
│
├── content/              # Astro Content Collections
│   ├── config.ts                # Schema 定义
│   └── blog/                    # Markdown 博客文章
│
├── layouts/              # 布局
│   ├── BaseLayout.astro         # HTML 结构、全局样式
│   └── PageLayout.astro         # 布局容器（侧边栏 + 主内容）
│
├── pages/                # 页面路由
│   ├── index.astro              # Notes 页（首页）
│   ├── repos.astro              # Repos 页
│   ├── tools.astro              # Tools 页
│   └── blog/
│       ├── index.astro          # 博客列表
│       └── [slug].astro         # 博客详情
│
├── styles/
│   └── global.css               # CSS 变量、基础样式
│
└── types/
    └── index.ts                 # TypeScript 类型定义
```

---

## 快速开始

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 预览构建结果
pnpm preview
```

---

## 配置方法概览

本项目有两种配置方式：

| 模块      | 配置方式        | 文件位置                | 自动更新         |
| --------- | --------------- | ----------------------- | ---------------- |
| **Notes** | TypeScript 配置 | `src/config/default.ts` | 否，需手动添加   |
| **Repos** | TypeScript 配置 | `src/config/default.ts` | 否，需手动添加   |
| **Tools** | TypeScript 配置 | `src/config/default.ts` | 否，需手动添加   |
| **Blog**  | Markdown 文件   | `src/content/blog/*.md` | **是**，自动发现 |

> **为什么使用 TypeScript 而非 JSON？**
>
> - 类型检查：IDE 会提示字段错误
> - 自动补全：写配置时有智能提示
> - 导入图片/资源：更灵活

---

## Notes（笔记）配置

### Q: 如何新增年级分组？

编辑 `src/config/default.ts`，在 `semesters` 数组添加：

```typescript
semesters: [
  // 已有学期...
  {
    id: '2025-spring',      // 唯一标识
    name: '2025 春季',       // 显示名称
    subjects: [],           // 科目列表
  },
],
```

### Q: 如何在分组下新增科目？

在对应学期的 `subjects` 数组中添加：

```typescript
subjects: [
  {
    id: 'cs101',
    name: '数据结构',
    description: '数组、树、图',
    url: 'https://your-notes.com/data-structures',
    color: '#e07b53',
  },
],
```

### Q: 颜色和跳转链接如何设置？

| 字段          | 必填 | 说明                     |
| ------------- | ---- | ------------------------ |
| `id`          | ✅   | 唯一标识符               |
| `name`        | ✅   | 卡片显示名称             |
| `url`         | ✅   | 点击跳转链接             |
| `description` | ❌   | 卡片描述文字             |
| `color`       | ❌   | 卡片主题色（建议暖色调） |

---

## Repos（仓库）配置

### Q: 如何新增仓库卡片？

编辑 `src/config/default.ts`，在 `repos` 数组添加：

```typescript
repos: [
  {
    id: 'repo1',
    name: 'awesome-project',
    description: '项目描述',
    url: 'https://github.com/user/repo',
    language: 'TypeScript',  // ❌ 可选
    stars: 128,              // ❌ 可选
    forks: 24,               // ❌ 可选
    color: '#3178c6',        // ❌ 可选，语言颜色
  },
],
```

### Q: 语言颜色怎么选？

常见语言颜色参考：

| 语言       | 颜色      |
| ---------- | --------- |
| TypeScript | `#3178c6` |
| JavaScript | `#f1e05a` |
| Python     | `#3572A5` |
| Rust       | `#dea584` |
| Go         | `#00ADD8` |
| Java       | `#b07219` |
| C++        | `#f34b7d` |

---

## Blog（博客）配置

### Q: 如何发布新文章？

**直接创建 Markdown 文件即可，无需修改任何配置文件！**

在 `src/content/blog/` 目录下创建 `.md` 文件：

```bash
# 创建新文章
src/content/blog/my-new-post.md
```

文件内容：

```markdown
---
title: 我的新文章
description: 文章简介（可选）
date: 2024-01-20
tags: [技术, 教程]
---

这里是正文内容...

## 标题一

正文...

## 标题二

正文...
```

### Q: 博客内容是自动更新的吗？

**是的，完全自动：**

1. **自动发现** - 新建 `.md` 文件后，下次构建自动出现在列表
2. **自动排序** - 按 `date` 字段倒序排列（新的在前）
3. **自动计算阅读时间** - 根据正文字数估算
4. **自动生成标签筛选** - 所有 `tags` 会汇总到筛选器

### Q: 文件名有什么要求？

- 文件名用于生成 URL（如 `my-post.md` → `/blog/my-post`）
- 建议使用英文、小写、连字符分隔
- 不要使用中文或特殊字符

### Q: frontmatter 字段说明

| 字段          | 必填 | 说明                        |
| ------------- | ---- | --------------------------- |
| `title`       | ✅   | 文章标题                    |
| `date`        | ✅   | 发布日期，格式 `YYYY-MM-DD` |
| `description` | ❌   | 文章简介                    |
| `tags`        | ❌   | 标签数组，如 `[技术, 教程]` |
| `image`       | ❌   | 封面图片路径                |

---

## Tools（工具）配置

### Q: 如何新增工具链接？

编辑 `src/config/default.ts`，在 `tools` 数组添加：

```typescript
tools: [
  {
    id: 'flashcards',
    name: '闪卡工具',
    description: '记忆卡片生成器',
    url: 'https://your-tool.com',
    icon: 'cards',       // ❌ 可选，见下方图标列表
    color: '#c9a227',    // ❌ 可选
  },
],
```

### Q: 有哪些内置图标可用？

| icon 值      | 图标     |
| ------------ | -------- |
| `cards`      | 卡片     |
| `quiz`       | 问号圆圈 |
| `formula`    | 四宫格   |
| `timer`      | 计时器   |
| `link`       | 链接     |
| `calculator` | 计算器   |

### Q: 如何添加自定义图标？

编辑 `src/components/ToolCard.tsx`，在 `iconMap` 中添加：

```typescript
const iconMap: Record<string, JSX.Element> = {
  // 已有图标...
  custom: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* SVG 路径 */}
    </svg>
  ),
}
```

---

## 个人资料与主题配置

### Q: 如何修改个人信息？

```typescript
profile: {
  name: '你的名字',
  avatar: '/avatar.svg',   // 图片放 public/ 目录
  bio: '学生 / 开发者',
  navLinks: [...],         // 导航链接
  externalLinks: [...],    // 外部链接
},
```

### Q: 如何修改主题？

```typescript
theme: {
  defaultTheme: 'system',   // 'light' | 'dark' | 'system'
  warmAccent: '#e07b53',    // 主色调
  particleColor: '#e07b53', // 粒子颜色
},
```

---

## 粒子背景配置

粒子背景组件支持以下参数（在 `PageLayout.astro` 中修改）：

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
/>
```

---

## 博客写作

在 `src/content/blog/` 目录下创建 `.md` 文件：

```markdown
---
title: 文章标题
description: 文章描述（可选）
date: 2024-01-15
tags: [标签1, 标签2]
image: /cover.jpg（可选）
---

正文内容...
```

博客支持：

- 自动生成阅读时间
- 标签筛选
- 时间轴布局

---

## CSS 变量自定义

`src/styles/global.css` 定义了所有样式变量：

```css
:root {
  --color-bg: #faf9f7;
  --color-text: #2d2a26;
  --color-accent: #e07b53;
  --sidebar-width: 240px;
  /* ... */
}

[data-theme="dark"] {
  --color-bg: #1a1918;
  --color-text: #f5f3f0;
  /* ... */
}
```

---

## 预留的配置接口

### 类型定义 (`src/types/index.ts`)

所有数据类型均可扩展：

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

interface ToolItem {
  id: string;
  name: string;
  description?: string;
  url: string;
  icon?: string;
  color?: string;
}
```

### 配置辅助函数 (`src/config/index.ts`)

```typescript
// 创建自定义配置
createConfig(partialConfig: Partial<SiteConfig>): SiteConfig

// 更新个人资料
updateProfile(partialProfile: Partial<Profile>): Profile

// 添加学期
addSemester(semester: Semester): Semester[]

// 添加仓库
addRepo(repo: Repo): Repo[]

// 添加工具
addTool(tool: ToolItem): ToolItem[]
```

### 扩展图标

在 `Sidebar.tsx` 中扩展 `navIconMap` 或 `externalIconMap`：

```typescript
const navIconMap: Record<string, JSX.Element> = {
  notes: <svg>...</svg>,
  // 添加新图标
  custom: <svg>...</svg>,
}
```

在 `ToolCard.tsx` 中扩展 `iconMap`：

```typescript
const iconMap: Record<string, JSX.Element> = {
  cards: <svg>...</svg>,
  // 添加新图标
  custom: <svg>...</svg>,
}
```

---

## 部署方法

### Vercel（推荐）

1. 推送代码到 GitHub
2. 在 Vercel 导入仓库
3. 自动识别 Astro，无需额外配置

### Netlify

1. 推送代码到 GitHub
2. 在 Netlify 导入仓库
3. Build command: `pnpm build`
4. Publish directory: `dist`

### 静态部署

```bash
pnpm build
# 将 dist/ 目录部署到任意静态服务器
```

### GitHub Pages

1. 修改 `astro.config.mjs`：

```javascript
export default defineConfig({
  site: "https://username.github.io",
  base: "/repo-name", // 如果不是根目录
  integrations: [solid()],
});
```

2. 使用 GitHub Actions 自动部署

### Gitea Actions（自托管）

适用于自建 Gitea 服务器，资源受限场景。

**1. 创建 workflow 文件** `.gitea/workflows/build.yaml`：

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]
  workflow_dispatch: # 支持手动触发

jobs:
  build:
    runs-on: ubuntu-latest
    container:
      image: node:20-alpine
      options: --memory=512m # 限制容器内存
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build

      - name: Deploy
        run: |
          # 将 dist/ 部署到你的 web 服务器
          # 例如: rsync、scp、或复制到挂载卷
```

**2. Runner 配置建议**（低内存服务器）：

限制 runner 并发任务数，避免内存溢出：

```yaml
# runner 配置文件
capacity: 1 # 同时只运行 1 个任务
```

**3. 开启 SWAP（强烈推荐）**：

2G 内存服务器建议添加 swap 作为缓冲：

```bash
# 创建 2G swap 文件
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 持久化
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

**资源消耗参考**：

| 项目         | 数值        |
| ------------ | ----------- |
| 构建时间     | ~2-3 秒     |
| 构建内存峰值 | ~300-500 MB |
| 构建输出     | ~380 KB     |
| node_modules | ~150 MB     |

**2核 2G 内存 + SWAP 运行 Gitea Actions 可行，建议避免与其他高负载任务（如远程桌面、大文件同步）同时进行。**

---

## 技术栈

- [Astro](https://astro.build/) - 静态站点生成
- [SolidJS](https://www.solidjs.com/) - 交互组件
- [pnpm](https://pnpm.io/) - 包管理

---

## 注意事项

1. **不要删除 `client:load`** - SolidJS 组件需要此指令才能在客户端交互
2. **图片资源** - 放在 `public/` 目录，直接用 `/filename` 引用
3. **颜色格式** - CSS 变量中使用的颜色需要是标准十六进制或 rgba 格式
4. **URL 规范** - 外部链接会自动添加 `target="_blank"` 和安全属性
