# 部署指南

## Vercel（推荐）

1. 推送代码到 GitHub
2. 在 Vercel 导入仓库
3. 自动识别 Astro，无需额外配置

## Netlify

1. 推送代码到 GitHub
2. 在 Netlify 导入仓库
3. Build command: `pnpm build`
4. Publish directory: `dist`

## GitHub Pages

1. 修改 `astro.config.mjs`：

```javascript
export default defineConfig({
  site: "https://username.github.io",
  base: "/repo-name", // 如果不是根目录
  integrations: [solid()],
});
```

2. 使用 GitHub Actions 自动部署

## 静态部署

```bash
pnpm build
# 将 dist/ 目录部署到任意静态服务器
```

## Gitea Actions（自托管）

适用于自建 Gitea 服务器，资源受限场景。

### 1. 创建 workflow 文件

`.gitea/workflows/build.yaml`：

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

### 2. Runner 配置建议（低内存服务器）

限制 runner 并发任务数，避免内存溢出：

```yaml
# runner 配置文件
capacity: 1 # 同时只运行 1 个任务
```

### 3. 开启 SWAP（强烈推荐）

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

### 资源消耗参考

| 项目         | 数值        |
| ------------ | ----------- |
| 构建时间     | ~2-3 秒     |
| 构建内存峰值 | ~300-500 MB |
| 构建输出     | ~380 KB     |
| node_modules | ~150 MB     |

**2核 2G 内存 + SWAP 运行 Gitea Actions 可行，建议避免与其他高负载任务同时进行。**