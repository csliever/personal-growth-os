# Personal Growth OS — MVP-0 设计（spec）

> 日期：2026-10-16　状态：已获用户逐节批准（架构/数据/规则/测试/边界 五节全确认）
> 上游约束：`个人/总控提示词.md` §八、`个人/个人成长进度.md` §9.6
> 分工：AI 全程搭建，用户验收评审；学习重心后移至 AI 功能段

## 1. 背景与目标

个人成长管理网站 = AI 转型主线（P1）阶段 2 的实践项目与作品集成果，兼作自用执行工具。本 spec 定义 MVP-0：上线后用户每日打开网站，按其**规则版生成的计划**执行（执行循环载体从进度文件切换到网站）。

成功标准（对应进度文件 §9.4 验收）：
1. v0.1 部署到 GitHub Pages，手机与电脑浏览器可用
2. 任务新建/修改/完成/延期（含原因与实际耗时）全流程可用，刷新后数据保持
3. 每日计划可按三档（最低/正常/强化）与工作日/周末生成，排不进的任务给出原因
4. 数据导出 JSON / 导入恢复往返无损

## 2. 范围与非范围

**范围（4 功能块）**
- 今日任务：必做/可选/待复习；完成/延期 + 延期原因 + 实际耗时
- 目标路线：90 天（quarter）→ 周（week）两级 Goal，优先级
- 规则版每日计划生成：确定性规则，不依赖任何 API
- localStorage 持久化 + JSON 导入导出

**非范围（v0.1 明确不含，Settings 页内声明）**
- 云同步、多端数据共享、离线 PWA、LLM 生成、学习记录模块、复盘页、间隔复习调度、账号体系
- 本地存储 ≠ 云同步：换设备/清浏览器数据即丢失，导出备份是唯一保护

## 3. 技术栈与架构

- Vite + React 18 + TypeScript(strict) + Tailwind CSS，pnpm
- React Router 3 路由：`/today`（默认）、`/roadmap`、`/settings`；底部 Tab 导航；手机优先响应式
- 状态：Zustand + `persist` 中间件（localStorage，`version` + `migrate` 预留）。选型理由：样板最少、持久化/版本迁移内建；Context+useReducer 持久化与测试样板多，Redux Toolkit 对 3 模块规模过重
- 目录结构：

```
src/
  features/
    today/        今日页（列表、生成、完成/延期交互）
    roadmap/      路线页（Goal 增删改、优先级）
    settings/     设置页（三档时长、导入导出、能力边界声明）
  lib/
    types.ts      数据模型
    store.ts      Zustand store + persist + migrations
    planner.ts    计划生成引擎（纯函数，零 UI/存储依赖）
    id.ts         id 生成
    date.ts       日期工具（本地时区 YYYY-MM-DD）
  App.tsx / main.tsx / index.css
tests 与被测模块同目录（*.test.ts(x)）
```

## 4. 数据模型（lib/types.ts）

```ts
export type Tier = 'min' | 'normal' | 'plus';            // 最低/正常/强化
export type TaskType = 'must' | 'optional' | 'review';   // 必做/可选/待复习
export type TaskStatus = 'todo' | 'done' | 'deferred';

export interface Task {
  id: string;
  date: string;            // 'YYYY-MM-DD' 本地时区
  title: string;
  type: TaskType;
  estMinutes: number;      // > 0
  goalId?: string;
  status: TaskStatus;
  deferredReason?: string; // status==='deferred' 时必填
  actualMinutes?: number;  // 完成时回填
  createdAt: string;       // ISO
}

export interface Goal {
  id: string;
  title: string;
  horizon: 'quarter' | 'week';
  dueDate?: string;
  status: 'active' | 'done' | 'dropped';
  priority: number;        // 数字越大越优先
}

export interface Settings {
  weekdayMinutes: Record<Tier, number>;  // 默认 {min:30, normal:60, plus:90}
  weekendMinutes: Record<Tier, number>;  // 默认 {min:120, normal:180, plus:240}
}

export interface AppData { version: 1; goals: Goal[]; tasks: Task[]; settings: Settings }
```

- localStorage key：`pgos:v1`（persist `name`），`version: 1`，`migrate` 钩子预留
- 导出 = 全量 `AppData` JSON（文件名 `pgos-export-YYYYMMDD.json`）；导入 = 版本与字段粗校验通过后**整体替换**（v1 不做合并）

## 5. 计划生成引擎（lib/planner.ts，纯函数）

签名：

```ts
export interface PlannerInput {
  date: string;                    // 'YYYY-MM-DD'
  isWeekend: boolean;
  tier: Tier;
  settings: Settings;
  goals: Goal[];                   // 仅 active 参与优先级排序
  tasks: Task[];                   // 全量任务（引擎自行筛选）
}
export interface PlannerResult {
  plan: Task[];                    // 生成的新任务（已写入 date）
  unplaced: Array<{ task: Task; reason: string }>;
  overloadWarning?: string;        // must 总耗时超上限时
}
export function generateDailyPlan(input: PlannerInput): PlannerResult;
```

规则（确定性，全部可单测）：
1. 输入池 = `date <= 生成日 && status === 'todo'` 的任务（当日新任务 + 逾期未决任务；done/deferred 不参与——逾期需用户显式延期并填写原因，不自动消失）。任务来源：今日页手动新建，或路线页 Goal 的「派生今日任务」按钮（落库为当日 todo 任务，带 goalId）
2. 未完成 **must** 全部进计划，不受时长上限限制；must 总 estMinutes > 上限时置 `overloadWarning`
3. 可用分钟 = `isWeekend ? weekendMinutes : weekdayMinutes` 按 tier 取值
4. 剩余分钟按 `goal.priority` 降序（无 goalId 的排最后、按 createdAt）填充 optional / review；放不下整任务则跳过并记入 unplaced，继续尝试后续更小任务（不拆分任务）
5. 放不下的进 `unplaced`，reason 形如 `"今日剩余 0 分钟"` / `"剩余 15 分钟 < 任务 30 分钟"`
6. 23:00 睡眠约束的体现 = 档位分钟上限本身；产品不安排深夜任务，不做时间点排布

幂等：重复生成不销毁任务——选中者仅重写 `date` 为生成日，未选中保持原日期；done/deferred 永不改动；当日 todo 的手动编辑保留（其最新 estMinutes/type 参与下一轮调度）。

## 6. 测试策略

- Vitest + React Testing Library，`pnpm test`（CI 与本地同命令）
- **planner.ts 全覆盖单测**（核心资产）：must 超上限、剩余 0 分钟、放不下整任务、priority 排序、无 goal 任务靠后、幂等重生成、空池、deferred 不复活
- store 持久化：写入→重载往返相等；导入校验失败不动现有数据
- 组件冒烟：今日页生成/完成/延期、路线页 Goal 增删、设置页导出导入
- 手动验收清单（部署后逐项过）：手机 Chrome/Safari 可用、增删改完成延期、刷新保持、导出导入往返、隐私模式警告条

## 7. 部署

- GitHub Actions：push `main` → `pnpm install && pnpm test && pnpm build` → `actions/upload-pages-artifact` + `actions/deploy-pages`
- 仓库：GitHub 同名新仓库 `personal-growth-os`（public，作品集属性；个人数据仅存 localStorage 不入库）
- Vite `base` 配置为仓库子路径 `/personal-growth-os/`
- 建远端用 `gh` CLI（已登录则自动化，未登录则输出两条手动命令，不假装已创建）

## 8. 错误处理

- localStorage 不可用（隐私模式/禁用）→ 内存降级运行 + 顶部持久警告条（含"数据不会保存"）
- 导入 JSON 非法（解析失败/版本不符/字段粗校验失败）→ 报错并保持现有数据不变
- 所有用户输入（任务名、时长）前端校验：title 非空、estMinutes 为正整数

## 9. 决策记录（ADR 级，一条一由）

1. 规则版生成先于 LLM 版：静态托管可跑、零密钥、确定性可测；LLM 升级属 MVP 后迭代
2. 任务不拆分、不做时间点排布：v1 价值在"该做什么/做多少"，时间块管理无验收需求
3. 导入整体替换不合并：合并冲突处理复杂度与 v0.1 目标不匹配
4. Goal 两级（quarter/week）而非五级：对齐 90 天计划现实粒度，年度视图无使用场景
5. HashRouter 而非 BrowserRouter：GitHub Pages 静态托管无服务端回退，深链/刷新需 hash 路由避免 404
