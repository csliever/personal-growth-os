# Personal Growth OS

个人成长执行工具：今日任务、目标路线（90 天/周）、规则版每日计划生成（三档时间预算）。数据存于浏览器 localStorage，可导出/导入 JSON 备份。

## 能力边界（v0.1）

- 本地存储不是云同步：数据只在当前浏览器；换设备/清数据即丢失，请定期导出
- 不含：多端同步、PWA 离线、账号、LLM 计划生成（后续迭代）

## 本地开发

```bash
pnpm install
pnpm test        # Vitest 全量测试
pnpm typecheck   # TS 类型检查
pnpm dev         # 本地开发服务器
pnpm build       # 产出 dist/
```

## 部署

push 到 `main` 触发 GitHub Actions：测试 + 构建 + 部署到 GitHub Pages（子路径 `/personal-growth-os/`）。
