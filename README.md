# Personal Homepage

基于 Astro + Svelte 5 的个人主页，日间“阳光色散”、夜间“星辰”双主题，带弹簧粒子背景。

## 功能特性

- **Notes** - 按学期组织的笔记，可展开学科卡片
- **Repos** - GitHub 仓库卡片展示
- **Blog** - 时间轴布局的博客，支持标签筛选
- **Links** - 链接页面
- **粒子背景** - 弹簧振子模型 + Perlin 噪声流场
- **深色/浅色主题** - 跟随系统或手动切换
- **响应式设计** - 适配移动端

## 快速开始

```bash
# 安装依赖
bun install

# 开发模式
bun run dev

# 构建
bun run build
```

## 文档

- [配置指南](docs/configuration.md) - 详细的配置说明
- [部署指南](docs/deployment.md) - 各平台部署方法
- [自定义指南](docs/customization.md) - CSS 变量、类型定义等

## 技术栈

- [Astro](https://astro.build/) - 静态站点生成
- [Svelte 5](https://svelte.dev/) + [shadcn-svelte](https://shadcn-svelte.com/) - 交互组件
- [Bun](https://bun.sh/) - 包管理
