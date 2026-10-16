# HashRouter 而非 BrowserRouter

路由用 hash 模式。约束：GitHub Pages 静态托管无服务端回退，BrowserRouter 的深链与刷新会 404（base 子路径 `/personal-growth-os/` 加剧）。代价是 URL 带 `#`、不够"现代"，换取零配置刷新安全。若未来迁自有域名 + 回退规则，可无痛切换（路由表不变）。
