# 配置指南

## 配置方式概览

| 模块      | 配置方式        | 文件位置                | 自动更新         |
| --------- | --------------- | ----------------------- | ---------------- |
| **Notes** | TypeScript 配置 | `src/config/default.ts` | 否，需手动添加   |
| **Repos** | TypeScript 配置 | `src/config/default.ts` | 否，需手动添加   |
| **Links** | TypeScript 配置 | `src/config/default.ts` | 否，需手动添加   |
| **Blog**  | Markdown 文件   | `src/content/blog/*.md` | **是**，自动发现 |

> **为什么使用 TypeScript 而非 JSON？**
>
> - 类型检查：IDE 会提示字段错误
> - 自动补全：写配置时有智能提示
> - 导入图片/资源：更灵活

## 个人资料配置

```typescript
profile: {
  name: '你的名字',
  avatar: '/avatar.svg',   // 图片放 public/ 目录
  bio: '学生 / 开发者',
  navLinks: [...],         // 导航链接
  externalLinks: [...],    // 外部链接
},
```

## Notes（笔记）配置

### 新增年级分组

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

### 新增科目

在对应学期的 `subjects` 数组中添加：

```typescript
subjects: [
  {
    id: 'cs101',
    name: '数据结构',
    description: '数组、树、图',
    url: 'https://your-notes.com/data-structures',
    color: '#4a8a8f',
  },
],
```

### 字段说明

| 字段          | 必填 | 说明                       |
| ------------- | ---- | -------------------------- |
| `id`          | ✅   | 唯一标识符                 |
| `name`        | ✅   | 卡片显示名称               |
| `url`         | ✅   | 点击跳转链接               |
| `description` | ❌   | 卡片描述文字               |
| `color`       | ❌   | 卡片主题色（建议青蓝色调） |

## Repos（仓库）配置

### 新增仓库卡片

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

### 常见语言颜色

| 语言       | 颜色      |
| ---------- | --------- |
| TypeScript | `#3178c6` |
| JavaScript | `#f1e05a` |
| Python     | `#3572A5` |
| Rust       | `#dea584` |
| Go         | `#00ADD8` |
| Java       | `#b07219` |
| C++        | `#f34b7d` |

## Blog（博客）配置

### 发布新文章

在 `src/content/blog/` 目录下创建 `.md` 文件：

```markdown
---
title: 我的新文章
description: 文章简介（可选）
date: 2024-01-20
tags: [技术, 教程]
---

这里是正文内容...
```

### 自动功能

- **自动发现** - 新建 `.md` 文件后，下次构建自动出现在列表
- **自动排序** - 按 `date` 字段倒序排列（新的在前）
- **自动计算阅读时间** - 根据正文字数估算
- **自动生成标签筛选** - 所有 `tags` 会汇总到筛选器

### 文件名要求

- 文件名用于生成 URL（如 `my-post.md` → `/blog/my-post`）
- 建议使用英文、小写、连字符分隔
- 不要使用中文或特殊字符

### frontmatter 字段

| 字段          | 必填 | 说明                        |
| ------------- | ---- | --------------------------- |
| `title`       | ✅   | 文章标题                    |
| `date`        | ✅   | 发布日期，格式 `YYYY-MM-DD` |
| `description` | ❌   | 文章简介                    |
| `tags`        | ❌   | 标签数组，如 `[技术, 教程]` |
| `image`       | ❌   | 封面图片路径                |

## Links（链接）配置

### 新增链接

编辑 `src/config/default.ts`，在 `links` 数组添加：

```typescript
links: [
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

### 内置图标

| icon 值      | 图标     |
| ------------ | -------- |
| `cards`      | 卡片     |
| `quiz`       | 问号圆圈 |
| `formula`    | 四宫格   |
| `timer`      | 计时器   |
| `link`       | 链接     |
| `calculator` | 计算器   |

### 添加自定义图标

编辑 `src/components/LinkCard.tsx`，在 `iconMap` 中添加：

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

## 主题配置

```typescript
theme: {
  defaultTheme: 'system',   // 'light' | 'dark' | 'system'
  warmAccent: '#4a8a8f',    // 主色调
  particleColor: '#4a8a8f', // 粒子颜色
},
```
