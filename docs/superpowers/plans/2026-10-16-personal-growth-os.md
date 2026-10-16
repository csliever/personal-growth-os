# Personal Growth OS MVP-0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 部署一个静态托管的个人成长执行工具：今日任务 + 目标路线 + 规则版每日计划生成 + localStorage 持久化与导入导出。

**Architecture:** Vite + React SPA（HashRouter 三路由，手机优先），Zustand persist 持久化到 localStorage（`pgos:v1`，版本化），计划生成引擎为纯函数模块 `lib/planner.ts`（作品集核心资产，全覆盖单测）。无后端，GitHub Actions 自动测试并部署 Pages。

**Tech Stack:** React 18 + TypeScript(strict) + Vite 5 + Tailwind 3 + Zustand 4 + React Router 6；Vitest + React Testing Library + jsdom；pnpm。

**Spec:** `docs/superpowers/specs/2026-10-16-personal-growth-os-design.md`

## Global Constraints

- 仓库：本地 `D:/Work/AI版/AI_Search/个人/personal-growth-os`，GitHub 同名 public 仓库
- localStorage key `pgos:v1`；导出全量 `AppData` JSON；导入校验失败不得改动现有数据
- v0.1 能力边界（Settings 页与 README 必须声明）：无云同步/多端/PWA/LLM；本地存储 ≠ 云同步
- 三档默认值：工作日 30/60/90 分钟，周末 120/180/240 分钟
- 界面语言中文；23:00 睡眠约束体现为档位分钟上限，不做时间点排布
- 测试命令 `pnpm test`；类型检查 `pnpm typecheck`；构建 `pnpm build`
- Vite `base: '/personal-growth-os/'`（GitHub Pages 子路径）；路由用 HashRouter（Pages 刷新不 404）

---

### Task 1: 工程骨架与测试基线

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `tailwind.config.js`, `postcss.config.js`, `index.html`, `.gitignore`
- Create: `src/main.tsx`, `src/App.tsx`（占位）, `src/index.css`, `src/setupTests.ts`, `src/App.test.tsx`

**Interfaces:**
- Consumes: 无（首任务）
- Produces: 可运行的 Vite+React+TS+Tailwind+Vitest 工程；`pnpm test` 跑通冒烟测试；`pnpm typecheck` 通过

- [ ] **Step 1: 写工程配置文件**

`package.json`：

```json
{
  "name": "personal-growth-os",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest run",
    "typecheck": "tsc --noEmit",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.2",
    "zustand": "^4.5.5"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.5.0",
    "@testing-library/react": "^16.0.1",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^18.3.8",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.20",
    "jsdom": "^25.0.0",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.13",
    "typescript": "^5.6.2",
    "vite": "^5.4.7",
    "vitest": "^1.6.0"
  }
}
```

`tsconfig.json`：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src"]
}
```

`vite.config.ts`：

```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/personal-growth-os/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
  },
})
```

`tailwind.config.js`：

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

`postcss.config.js`：

```js
export default {
  plugins: { tailwindcss: {}, autoprefixer: {} },
}
```

`index.html`：

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>个人成长 OS</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`.gitignore`：

```
node_modules
dist
*.local
```

- [ ] **Step 2: 写入口与样式文件**

`src/main.tsx`：

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

`src/index.css`：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

`src/App.tsx`（占位，Task 6 替换为路由外壳）：

```tsx
export default function App() {
  return <div className="p-4">个人成长 OS</div>
}
```

`src/setupTests.ts`：

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 3: 写冒烟测试（先写，预期失败）**

`src/App.test.tsx`：

```tsx
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App 冒烟', () => {
  it('渲染应用标题', () => {
    render(<App />)
    expect(screen.getByText('个人成长 OS')).toBeInTheDocument()
  })
})
```

- [ ] **Step 4: 安装依赖并验证测试通过**

Run: `pnpm install && pnpm test`
Expected: `Test Files  1 passed`（App 冒烟 1 通过）

Run: `pnpm typecheck`
Expected: 无错误退出

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: Vite+React+TS+Tailwind+Vitest 工程骨架与冒烟测试"
```

---

### Task 2: 数据模型与工具函数

**Files:**
- Create: `src/lib/types.ts`, `src/lib/id.ts`, `src/lib/date.ts`
- Test: `src/lib/date.test.ts`

**Interfaces:**
- Consumes: 无
- Produces: `Tier / TaskType / TaskStatus / Task / Goal / Settings / AppData` 类型；`DEFAULT_SETTINGS`；`initialData(): AppData`；`newId(): string`；`toDateStr(d: Date): string`；`todayStr(): string`；`isWeekend(dateStr: string): boolean`（本地时区）

- [ ] **Step 1: 写 date 工具的失败测试**

`src/lib/date.test.ts`：

```ts
import { toDateStr, todayStr, isWeekend } from './date'

describe('date 工具', () => {
  it('toDateStr 补零生成 YYYY-MM-DD', () => {
    expect(toDateStr(new Date(2026, 0, 5))).toBe('2026-01-05')
    expect(toDateStr(new Date(2026, 9, 17))).toBe('2026-10-17')
  })

  it('todayStr 返回今天的本地日期字符串', () => {
    const now = new Date()
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    expect(todayStr()).toBe(expected)
  })

  it('isWeekend 判断周六周日', () => {
    expect(isWeekend('2026-10-17')).toBe(true) // 周六
    expect(isWeekend('2026-10-18')).toBe(true) // 周日
    expect(isWeekend('2026-10-16')).toBe(false) // 周五
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm test src/lib/date.test.ts`
Expected: FAIL —— `Cannot find module './date'`

- [ ] **Step 3: 写实现**

`src/lib/types.ts`：

```ts
export type Tier = 'min' | 'normal' | 'plus'
export type TaskType = 'must' | 'optional' | 'review'
export type TaskStatus = 'todo' | 'done' | 'deferred'

export interface Task {
  id: string
  date: string // 'YYYY-MM-DD' 本地时区
  title: string
  type: TaskType
  estMinutes: number
  goalId?: string
  status: TaskStatus
  deferredReason?: string
  actualMinutes?: number
  createdAt: string
}

export interface Goal {
  id: string
  title: string
  horizon: 'quarter' | 'week'
  dueDate?: string
  status: 'active' | 'done' | 'dropped'
  priority: number
}

export interface Settings {
  weekdayMinutes: Record<Tier, number>
  weekendMinutes: Record<Tier, number>
}

export interface AppData {
  version: 1
  goals: Goal[]
  tasks: Task[]
  settings: Settings
}

export const DEFAULT_SETTINGS: Settings = {
  weekdayMinutes: { min: 30, normal: 60, plus: 90 },
  weekendMinutes: { min: 120, normal: 180, plus: 240 },
}

export const initialData = (): AppData => ({
  version: 1,
  goals: [],
  tasks: [],
  settings: {
    weekdayMinutes: { ...DEFAULT_SETTINGS.weekdayMinutes },
    weekendMinutes: { ...DEFAULT_SETTINGS.weekendMinutes },
  },
})
```

`src/lib/id.ts`：

```ts
export function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}
```

`src/lib/date.ts`：

```ts
export function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayStr(): string {
  return toDateStr(new Date())
}

export function isWeekend(dateStr: string): boolean {
  const [y, m, d] = dateStr.split('-').map(Number)
  const day = new Date(y, m - 1, d).getDay()
  return day === 0 || day === 6
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `pnpm test`
Expected: 全部通过（App 冒烟 1 + date 3）

Run: `pnpm typecheck`
Expected: 无错误

- [ ] **Step 5: Commit**

```bash
git add src/lib
git commit -m "feat: 数据模型与日期/id 工具（含 date 单测）"
```

---

### Task 3: 计划生成引擎 planner.ts（纯函数，核心资产）

**Files:**
- Create: `src/lib/planner.ts`
- Test: `src/lib/planner.test.ts`

**Interfaces:**
- Consumes: `Task / Goal / Settings / Tier`（Task 2）
- Produces:

```ts
interface PlannerInput { date: string; isWeekend: boolean; tier: Tier; settings: Settings; goals: Goal[]; tasks: Task[] }
interface Unplaced { task: Task; reason: string }
interface PlannerResult { plan: Task[]; unplaced: Unplaced[]; overloadWarning?: string }
function generateDailyPlan(input: PlannerInput): PlannerResult
```

规则：输入池 = `date <= 生成日 && status === 'todo'`；must 全进计划（可超上限 → overloadWarning）；预算 = 工作日/周末 × 档位；optional/review 按目标优先级降序（无目标 -1，同级按 createdAt 升序）贪心填充，放不下整任务则记 unplaced 并继续尝试后续更小任务；plan 内任务 date 重写为生成日。

- [ ] **Step 1: 写失败测试（全边界）**

`src/lib/planner.test.ts`：

```ts
import { generateDailyPlan } from './planner'
import type { Goal, Settings, Task } from './types'

const settings: Settings = {
  weekdayMinutes: { min: 30, normal: 60, plus: 90 },
  weekendMinutes: { min: 120, normal: 180, plus: 240 },
}

const goal = (id: string, priority: number): Goal => ({ id, title: `目标${id}`, horizon: 'week', status: 'active', priority })

const task = (over: Partial<Task> & Pick<Task, 'id' | 'title'>): Task => ({
  date: '2026-10-16',
  type: 'optional',
  estMinutes: 30,
  status: 'todo',
  createdAt: '2026-10-15T10:00:00Z',
  ...over,
})

const run = (over: Partial<Parameters<typeof generateDailyPlan>[0]>) =>
  generateDailyPlan({
    date: '2026-10-16',
    isWeekend: false,
    tier: 'normal',
    settings,
    goals: [],
    tasks: [],
    ...over,
  })

describe('generateDailyPlan', () => {
  it('空池返回空计划无警告', () => {
    const r = run({})
    expect(r.plan).toEqual([])
    expect(r.unplaced).toEqual([])
    expect(r.overloadWarning).toBeUndefined()
  })

  it('must 全部进计划且不受预算限制，超限给 overloadWarning', () => {
    const r = run({
      tasks: [task({ id: '1', title: 'A', type: 'must', estMinutes: 50 }), task({ id: '2', title: 'B', type: 'must', estMinutes: 30 })],
    })
    expect(r.plan.map((t) => t.id)).toEqual(['1', '2'])
    expect(r.overloadWarning).toContain('80')
  })

  it('must 总时长未超预算则无警告', () => {
    const r = run({ tasks: [task({ id: '1', title: 'A', type: 'must', estMinutes: 60 })] })
    expect(r.overloadWarning).toBeUndefined()
  })

  it('按目标优先级填充 optional，预算 60 放两个 30 分钟任务', () => {
    const g1 = goal('g1', 5)
    const g2 = goal('g2', 1)
    const r = run({
      goals: [g1, g2],
      tasks: [
        task({ id: 'low', title: '低优', goalId: 'g2' }),
        task({ id: 'high', title: '高优', goalId: 'g1' }),
      ],
    })
    expect(r.plan.map((t) => t.id)).toEqual(['high', 'low'])
  })

  it('放不下整任务进 unplaced，继续尝试更小的后续任务', () => {
    const r = run({
      tasks: [
        task({ id: 'big', title: '大', estMinutes: 45 }),
        task({ id: 'small', title: '小', estMinutes: 15 }),
      ],
    })
    expect(r.plan.map((t) => t.id)).toEqual(['small'])
    expect(r.unplaced).toHaveLength(1)
    expect(r.unplaced[0].task.id).toBe('big')
    expect(r.unplaced[0].reason).toContain('45')
  })

  it('预算耗尽后剩余全部 unplaced，原因为剩余 0 分钟', () => {
    const r = run({
      tier: 'min',
      tasks: [task({ id: 'a', title: 'A', estMinutes: 30 }), task({ id: 'b', title: 'B', estMinutes: 20 })],
    })
    expect(r.plan.map((t) => t.id)).toEqual(['a'])
    expect(r.unplaced[0].reason).toContain('剩余 0 分钟')
  })

  it('无 goalId 的任务排在有 active goal 的任务之后', () => {
    const r = run({
      tier: 'plus',
      goals: [goal('g1', 0)],
      tasks: [task({ id: 'free', title: '无目标' }), task({ id: 'bound', title: '有目标', goalId: 'g1' })],
    })
    expect(r.plan.map((t) => t.id)).toEqual(['bound', 'free'])
  })

  it('goalId 指向 dropped goal 时视为无目标', () => {
    const r = run({
      tier: 'plus',
      goals: [goal('g1', 9), { ...goal('g2', 1), status: 'dropped' as const }],
      tasks: [task({ id: 'x', title: 'X', goalId: 'g2' }), task({ id: 'y', title: 'Y', goalId: 'g1' })],
    })
    expect(r.plan.map((t) => t.id)).toEqual(['y', 'x'])
  })

  it('逾期 todo 任务进入输入池且计划内 date 重写为生成日', () => {
    const r = run({
      tasks: [task({ id: 'old', title: '逾期', date: '2026-10-14', type: 'must' })],
    })
    expect(r.plan).toHaveLength(1)
    expect(r.plan[0].date).toBe('2026-10-16')
    expect(r.plan[0].id).toBe('old')
  })

  it('done 与 deferred 不进入输入池（同日也不）', () => {
    const r = run({
      tasks: [
        task({ id: 'd', title: '完成', status: 'done', type: 'must' }),
        task({ id: 'f', title: '延期', status: 'deferred', type: 'must' }),
      ],
    })
    expect(r.plan).toEqual([])
    expect(r.unplaced).toEqual([])
  })

  it('未来日期任务不进入输入池', () => {
    const r = run({ tasks: [task({ id: 'future', title: '未来', date: '2026-10-20', type: 'must' })] })
    expect(r.plan).toEqual([])
  })

  it('周末用 weekendMinutes 预算', () => {
    const r = run({
      date: '2026-10-17',
      isWeekend: true,
      tier: 'normal',
      tasks: [task({ id: 'a', title: 'A', estMinutes: 150 })],
    })
    expect(r.plan.map((t) => t.id)).toEqual(['a'])
    expect(r.unplaced).toEqual([])
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm test src/lib/planner.test.ts`
Expected: FAIL —— `Cannot find module './planner'`

- [ ] **Step 3: 写实现**

`src/lib/planner.ts`：

```ts
import type { Goal, Settings, Task, Tier } from './types'

export interface PlannerInput {
  date: string
  isWeekend: boolean
  tier: Tier
  settings: Settings
  goals: Goal[]
  tasks: Task[]
}

export interface Unplaced {
  task: Task
  reason: string
}

export interface PlannerResult {
  plan: Task[]
  unplaced: Unplaced[]
  overloadWarning?: string
}

const priorityOf = (t: Task, goals: Goal[]): number => {
  if (!t.goalId) return -1
  const g = goals.find((x) => x.id === t.goalId && x.status === 'active')
  return g ? g.priority : -1
}

export function generateDailyPlan(input: PlannerInput): PlannerResult {
  const pool = input.tasks
    .filter((t) => t.status === 'todo' && t.date <= input.date)
    .sort((a, b) => priorityOf(b, input.goals) - priorityOf(a, input.goals) || a.createdAt.localeCompare(b.createdAt))

  const musts = pool.filter((t) => t.type === 'must')
  const others = pool.filter((t) => t.type !== 'must')

  const budget = (input.isWeekend ? input.settings.weekendMinutes : input.settings.weekdayMinutes)[input.tier]
  const mustTotal = musts.reduce((s, t) => s + t.estMinutes, 0)
  const overloadWarning =
    mustTotal > budget ? `必做任务共 ${mustTotal} 分钟，超过今日上限 ${budget} 分钟，请改期部分任务` : undefined

  const plan: Task[] = musts.map((t) => ({ ...t, date: input.date }))
  let remaining = budget
  const unplaced: Unplaced[] = []
  for (const t of others) {
    if (t.estMinutes <= remaining) {
      plan.push({ ...t, date: input.date })
      remaining -= t.estMinutes
    } else {
      unplaced.push({ task: t, reason: `剩余 ${remaining} 分钟 < 任务 ${t.estMinutes} 分钟` })
    }
  }
  return { plan, unplaced, overloadWarning }
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `pnpm test`
Expected: 全部通过（planner 12 例）

- [ ] **Step 5: Commit**

```bash
git add src/lib/planner.ts src/lib/planner.test.ts
git commit -m "feat: 规则版每日计划生成引擎（纯函数，12 例全覆盖）"
```

---

### Task 4: Zustand store 与持久化

**Files:**
- Create: `src/lib/store.ts`
- Test: `src/lib/store.test.ts`

**Interfaces:**
- Consumes: `types / initialData`（Task 2）、`newId / todayStr / isWeekend`（Task 2）、`generateDailyPlan / PlannerResult`（Task 3）
- Produces:

```ts
useStore: UseBoundStore<StoreApi<AppState>>
interface AppState extends AppData {
  addTask(input: { title: string; type: TaskType; estMinutes: number; goalId?: string; date?: string }): Task
  updateTask(id: string, patch: Partial<Pick<Task, 'title' | 'type' | 'estMinutes'>>): void
  deleteTask(id: string): void
  completeTask(id: string, actualMinutes: number): void
  deferTask(id: string, reason: string): void
  restoreTask(id: string): void   // deferred→todo 并改期今天
  addGoal(input: { title: string; horizon: 'quarter' | 'week'; priority: number; dueDate?: string }): Goal
  updateGoal(id: string, patch: Partial<Pick<Goal, 'title' | 'horizon' | 'priority' | 'dueDate' | 'status'>>): void
  generatePlan(date: string, tier: Tier): PlannerResult  // 选中者 date 重写为生成日，unplaced 保持原 date
  updateMinutes(dayType: 'weekday' | 'weekend', tier: Tier, minutes: number): void
}
resetStoreForTests(): void
```

持久化：`persist`，name `'pgos:v1'`，version 1，partialize 只存数据四字段。幂等语义：重复生成不销毁任务，仅重排日期；done/deferred 永不动。

- [ ] **Step 1: 写失败测试**

`src/lib/store.test.ts`：

```ts
import { useStore, resetStoreForTests } from './store'

beforeEach(() => {
  localStorage.clear()
  resetStoreForTests()
})

describe('store 任务生命周期', () => {
  it('addTask 落库为当日 todo 任务', () => {
    const t = useStore.getState().addTask({ title: '写周报', type: 'must', estMinutes: 20 })
    expect(t.status).toBe('todo')
    expect(t.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(useStore.getState().tasks).toHaveLength(1)
  })

  it('completeTask 记录实际耗时', () => {
    const t = useStore.getState().addTask({ title: 'A', type: 'optional', estMinutes: 30 })
    useStore.getState().completeTask(t.id, 25)
    const stored = useStore.getState().tasks[0]
    expect(stored.status).toBe('done')
    expect(stored.actualMinutes).toBe(25)
  })

  it('deferTask 需带原因；restoreTask 恢复并改期今天', () => {
    const t = useStore.getState().addTask({ title: 'A', type: 'optional', estMinutes: 30, date: '2026-10-10' })
    useStore.getState().deferTask(t.id, '带娃')
    expect(useStore.getState().tasks[0]).toMatchObject({ status: 'deferred', deferredReason: '带娃' })
    useStore.getState().restoreTask(t.id)
    expect(useStore.getState().tasks[0]).toMatchObject({ status: 'todo', deferredReason: undefined })
  })

  it('updateTask/deleteTask 正常工作', () => {
    const t = useStore.getState().addTask({ title: 'A', type: 'optional', estMinutes: 30 })
    useStore.getState().updateTask(t.id, { title: 'B', estMinutes: 45 })
    expect(useStore.getState().tasks[0]).toMatchObject({ title: 'B', estMinutes: 45 })
    useStore.getState().deleteTask(t.id)
    expect(useStore.getState().tasks).toHaveLength(0)
  })
})

describe('store generatePlan', () => {
  it('选中任务 date 重写为生成日，未选中保持原日期', () => {
    const s = useStore.getState()
    s.addTask({ title: '进', type: 'optional', estMinutes: 30, date: '2026-10-14' })
    s.addTask({ title: '不进', type: 'optional', estMinutes: 30, date: '2026-10-14' })
    s.addTask({ title: '占位', type: 'optional', estMinutes: 30, date: '2026-10-14' })
    const r = s.generatePlan('2026-10-15', 'min') // 预算 30，只进第一个（createdAt 排序）
    expect(r.plan).toHaveLength(1)
    const byTitle = (n: string) => useStore.getState().tasks.find((t) => t.title === n)!
    expect(byTitle('进').date).toBe('2026-10-15')
    expect(r.unplaced[0].task.title).toBe('不进')
  })

  it('重复生成幂等：不新增不删除任务', () => {
    const s = useStore.getState()
    s.addTask({ title: 'A', type: 'must', estMinutes: 20, date: '2026-10-14' })
    s.generatePlan('2026-10-15', 'normal')
    s.generatePlan('2026-10-15', 'normal')
    expect(useStore.getState().tasks).toHaveLength(1)
    expect(useStore.getState().tasks[0].date).toBe('2026-10-15')
  })
})

describe('store 持久化', () => {
  it('状态变化写入 localStorage pgos:v1，含任务数据', () => {
    useStore.getState().addTask({ title: '持久', type: 'must', estMinutes: 10 })
    const raw = localStorage.getItem('pgos:v1')
    expect(raw).toBeTruthy()
    expect(JSON.parse(raw!).state.tasks[0].title).toBe('持久')
  })

  it('addGoal/updateMinutes 正常并持久化', () => {
    const s = useStore.getState()
    s.addGoal({ title: '90 天 MVP', horizon: 'quarter', priority: 5 })
    s.updateMinutes('weekday', 'normal', 45)
    const raw = JSON.parse(localStorage.getItem('pgos:v1')!)
    expect(raw.state.goals).toHaveLength(1)
    expect(raw.state.settings.weekdayMinutes.normal).toBe(45)
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm test src/lib/store.test.ts`
Expected: FAIL —— `Cannot find module './store'`

- [ ] **Step 3: 写实现**

`src/lib/store.ts`：

```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { isWeekend, todayStr } from './date'
import { newId } from './id'
import { generateDailyPlan } from './planner'
import { initialData } from './types'
import type { AppData, Goal, Task, TaskType, Tier } from './types'

export interface AppState extends AppData {
  addTask: (input: { title: string; type: TaskType; estMinutes: number; goalId?: string; date?: string }) => Task
  updateTask: (id: string, patch: Partial<Pick<Task, 'title' | 'type' | 'estMinutes'>>) => void
  deleteTask: (id: string) => void
  completeTask: (id: string, actualMinutes: number) => void
  deferTask: (id: string, reason: string) => void
  restoreTask: (id: string) => void
  addGoal: (input: { title: string; horizon: Goal['horizon']; priority: number; dueDate?: string }) => Goal
  updateGoal: (id: string, patch: Partial<Pick<Goal, 'title' | 'horizon' | 'priority' | 'dueDate' | 'status'>>) => void
  generatePlan: (date: string, tier: Tier) => ReturnType<typeof generateDailyPlan>
  updateMinutes: (dayType: 'weekday' | 'weekend', tier: Tier, minutes: number) => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialData(),
      addTask: (input) => {
        const task: Task = {
          id: newId(),
          date: input.date ?? todayStr(),
          title: input.title,
          type: input.type,
          estMinutes: input.estMinutes,
          goalId: input.goalId,
          status: 'todo',
          createdAt: new Date().toISOString(),
        }
        set((s) => ({ tasks: [...s.tasks, task] }))
        return task
      },
      updateTask: (id, patch) =>
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
      completeTask: (id, actualMinutes) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, status: 'done' as const, actualMinutes } : t)),
        })),
      deferTask: (id, reason) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, status: 'deferred' as const, deferredReason: reason } : t)),
        })),
      restoreTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, status: 'todo' as const, deferredReason: undefined, date: todayStr() } : t,
          ),
        })),
      addGoal: (input) => {
        const goal: Goal = {
          id: newId(),
          title: input.title,
          horizon: input.horizon,
          dueDate: input.dueDate,
          status: 'active',
          priority: input.priority,
        }
        set((s) => ({ goals: [...s.goals, goal] }))
        return goal
      },
      updateGoal: (id, patch) =>
        set((s) => ({ goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)) })),
      generatePlan: (date, tier) => {
        const { tasks, goals, settings } = get()
        const result = generateDailyPlan({ date, isWeekend: isWeekend(date), tier, settings, goals, tasks })
        const placedIds = new Set(result.plan.map((t) => t.id))
        set((s) => ({ tasks: s.tasks.map((t) => (placedIds.has(t.id) ? { ...t, date } : t)) }))
        return result
      },
      updateMinutes: (dayType, tier, minutes) =>
        set((s) => {
          const key = dayType === 'weekday' ? 'weekdayMinutes' : 'weekendMinutes'
          return { settings: { ...s.settings, [key]: { ...s.settings[key], [tier]: minutes } } }
        }),
    }),
    {
      name: 'pgos:v1',
      version: 1,
      partialize: (s) => ({ version: s.version, goals: s.goals, tasks: s.tasks, settings: s.settings }),
    },
  ),
)

export const resetStoreForTests = () => useStore.setState({ ...initialData() })
```

- [ ] **Step 4: 运行测试确认通过**

Run: `pnpm test`
Expected: 全部通过（store 8 例）

Run: `pnpm typecheck`
Expected: 无错误

- [ ] **Step 5: Commit**

```bash
git add src/lib/store.ts src/lib/store.test.ts
git commit -m "feat: Zustand store（任务/目标生命周期 + 计划应用 + 持久化）"
```

---

### Task 5: 导入导出

**Files:**
- Create: `src/lib/exportImport.ts`
- Test: `src/lib/exportImport.test.ts`

**Interfaces:**
- Consumes: `AppData / DEFAULT_SETTINGS`（Task 2）
- Produces:

```ts
function serializeData(data: AppData): string
type ImportResult = { ok: true; data: AppData } | { ok: false; error: string }
function parseImport(json: string): ImportResult
```

导入失败（解析失败/版本不符/字段缺失）必须返回 ok:false，绝不部分写入。

- [ ] **Step 1: 写失败测试**

`src/lib/exportImport.test.ts`：

```ts
import { parseImport, serializeData } from './exportImport'
import { initialData } from './types'

describe('serializeData / parseImport', () => {
  it('导出后导入往返无损', () => {
    const data = initialData()
    data.goals.push({ id: 'g1', title: '目标', horizon: 'quarter', status: 'active', priority: 3 })
    data.tasks.push({ id: 't1', date: '2026-10-16', title: '任务', type: 'must', estMinutes: 20, status: 'todo', createdAt: '2026-10-15T00:00:00Z' })
    const back = parseImport(serializeData(data))
    expect(back).toEqual({ ok: true, data })
  })

  it('非 JSON 文本报解析失败', () => {
    expect(parseImport('不是json')).toEqual({ ok: false, error: 'JSON 解析失败' })
  })

  it('版本不符报错', () => {
    const raw = JSON.stringify({ ...initialData(), version: 2 })
    const r = parseImport(raw)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toContain('版本')
  })

  it('goals/tasks 不是数组时报字段校验失败', () => {
    const raw = JSON.stringify({ version: 1, goals: 'x', tasks: [] })
    const r = parseImport(raw)
    expect(r.ok).toBe(false)
  })

  it('任务缺必需字段（id/date/title）报错', () => {
    const raw = JSON.stringify({ version: 1, goals: [], tasks: [{ title: '缺id' }], settings: initialData().settings })
    const r = parseImport(raw)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toContain('必需字段')
  })

  it('缺 settings 时回退默认值不报错', () => {
    const raw = JSON.stringify({ version: 1, goals: [], tasks: [] })
    const r = parseImport(raw)
    expect(r.ok).toBe(true)
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm test src/lib/exportImport.test.ts`
Expected: FAIL —— `Cannot find module './exportImport'`

- [ ] **Step 3: 写实现**

`src/lib/exportImport.ts`：

```ts
import { DEFAULT_SETTINGS } from './types'
import type { AppData, Goal, Settings, Task } from './types'

export function serializeData(data: AppData): string {
  return JSON.stringify(data, null, 2)
}

export type ImportResult = { ok: true; data: AppData } | { ok: false; error: string }

export function parseImport(json: string): ImportResult {
  let raw: unknown
  try {
    raw = JSON.parse(json)
  } catch {
    return { ok: false, error: 'JSON 解析失败' }
  }
  if (typeof raw !== 'object' || raw === null) return { ok: false, error: '导入内容不是 JSON 对象' }
  const obj = raw as Record<string, unknown>
  if (obj.version !== 1) return { ok: false, error: `版本不符：期望 1，实际 ${String(obj.version)}` }
  if (!Array.isArray(obj.goals) || !Array.isArray(obj.tasks)) {
    return { ok: false, error: '字段校验失败：goals/tasks 必须是数组' }
  }
  for (const t of obj.tasks) {
    if (typeof t !== 'object' || t === null) return { ok: false, error: '任务格式错误' }
    const task = t as Record<string, unknown>
    if (typeof task.id !== 'string' || typeof task.date !== 'string' || typeof task.title !== 'string') {
      return { ok: false, error: '任务缺少必需字段（id/date/title）' }
    }
  }
  const settings = (obj.settings === undefined ? DEFAULT_SETTINGS : obj.settings) as Settings
  return {
    ok: true,
    data: { version: 1, goals: obj.goals as Goal[], tasks: obj.tasks as Task[], settings },
  }
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `pnpm test`
Expected: 全部通过（exportImport 6 例）

- [ ] **Step 5: Commit**

```bash
git add src/lib/exportImport.ts src/lib/exportImport.test.ts
git commit -m "feat: 全量数据导出与受校验导入"
```

---

### Task 6: 应用外壳（路由 / 底部导航 / 存储警告）

**Files:**
- Create: `src/components/BottomNav.tsx`, `src/components/StorageWarning.tsx`
- Modify: `src/App.tsx`（替换占位实现）
- Create: `src/features/today/TodayPage.tsx`（临时占位）, `src/features/roadmap/RoadmapPage.tsx`（临时占位）, `src/features/settings/SettingsPage.tsx`（临时占位）
- Test: `src/App.test.tsx`（扩充）

**Interfaces:**
- Consumes: 无新依赖（页面占位不接 store）
- Produces: 三路由 `/today`（默认重定向）、`/roadmap`、`/settings`；`BottomNav` 导航到 `今日/路线/设置`；`StorageWarning` 在 localStorage 不可用时渲染红色警告条

- [ ] **Step 1: 写失败测试（扩充 App.test.tsx）**

`src/App.test.tsx` 全量替换为：

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('应用外壳', () => {
  it('默认进入今日页', () => {
    render(<App />)
    expect(window.location.hash).toContain('#/today')
  })

  it('底部导航可在三页间切换', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('link', { name: '路线' }))
    expect(window.location.hash).toContain('#/roadmap')
    await user.click(screen.getByRole('link', { name: '设置' }))
    expect(window.location.hash).toContain('#/settings')
    await user.click(screen.getByRole('link', { name: '今日' }))
    expect(window.location.hash).toContain('#/today')
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm test src/App.test.tsx`
Expected: FAIL —— 找不到 name 为「路线」的 link（当前 App 是占位文本）

- [ ] **Step 3: 写实现**

`src/components/BottomNav.tsx`：

```tsx
import { NavLink } from 'react-router-dom'

const items = [
  { to: '/today', label: '今日' },
  { to: '/roadmap', label: '路线' },
  { to: '/settings', label: '设置' },
]

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 border-t border-gray-200 bg-white" data-testid="bottom-nav">
      <div className="mx-auto flex max-w-lg">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) =>
              `flex-1 py-3 text-center text-sm ${isActive ? 'font-semibold text-blue-600' : 'text-gray-500'}`
            }
          >
            {it.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
```

`src/components/StorageWarning.tsx`：

```tsx
import { useEffect, useState } from 'react'

function storageAvailable(): boolean {
  try {
    const k = '__pgos_probe__'
    localStorage.setItem(k, '1')
    localStorage.removeItem(k)
    return true
  } catch {
    return false
  }
}

export default function StorageWarning() {
  const [available, setAvailable] = useState(true)
  useEffect(() => setAvailable(storageAvailable()), [])
  if (available) return null
  return (
    <div className="bg-red-100 px-4 py-2 text-sm text-red-800" data-testid="storage-warning">
      当前浏览器存储不可用（可能是隐私模式），数据不会保存——请尽快导出备份。
    </div>
  )
}
```

`src/features/today/TodayPage.tsx`（占位）：

```tsx
export default function TodayPage() {
  return <div>今日</div>
}
```

`src/features/roadmap/RoadmapPage.tsx`（占位）：

```tsx
export default function RoadmapPage() {
  return <div>路线</div>
}
```

`src/features/settings/SettingsPage.tsx`（占位）：

```tsx
export default function SettingsPage() {
  return <div>设置</div>
}
```

`src/App.tsx` 全量替换：

```tsx
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import StorageWarning from './components/StorageWarning'
import RoadmapPage from './features/roadmap/RoadmapPage'
import SettingsPage from './features/settings/SettingsPage'
import TodayPage from './features/today/TodayPage'

export default function App() {
  return (
    <HashRouter>
      <div className="mx-auto flex min-h-screen max-w-lg flex-col pb-16">
        <StorageWarning />
        <main className="flex-1 px-4 py-3">
          <Routes>
            <Route path="/" element={<Navigate to="/today" replace />} />
            <Route path="/today" element={<TodayPage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </HashRouter>
  )
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `pnpm test`
Expected: 全部通过

Run: `pnpm typecheck`
Expected: 无错误

- [ ] **Step 5: Commit**

```bash
git add src
git commit -m "feat: 三路由外壳 + 底部导航 + 存储不可用警告"
```

---

### Task 7: 今日页（任务 CRUD + 完成延期 + 计划生成）

**Files:**
- Modify: `src/features/today/TodayPage.tsx`（全量替换占位）
- Test: `src/features/today/TodayPage.test.tsx`

**Interfaces:**
- Consumes: `useStore`（Task 4 全部 actions）、`todayStr`（Task 2）、`PlannerResult`（Task 3）
- Produces: 今日页完整交互。区块顺序：日期+档位选择+生成按钮 → 超载警告 → 未排入区 → 逾期区 → 新建表单 → 待办 → 已延期 → 已完成摘要。按钮 aria-label 规则：`完成/延期/编辑/删除/恢复 + 空格 + 任务名`（测试依赖）

- [ ] **Step 1: 写失败测试**

`src/features/today/TodayPage.test.tsx`：

```tsx
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TodayPage from './TodayPage'
import { resetStoreForTests, useStore } from '../../lib/store'

beforeEach(() => {
  localStorage.clear()
  resetStoreForTests()
})

const addTaskViaForm = async (user: ReturnType<typeof userEvent.setup>, title: string, type: string, est: string) => {
  await user.type(screen.getByLabelText('新任务'), title)
  await user.selectOptions(screen.getByLabelText('类型'), type)
  await user.clear(screen.getByLabelText('预计分钟'))
  await user.type(screen.getByLabelText('预计分钟'), est)
  await user.click(screen.getByRole('button', { name: '添加任务' }))
}

describe('今日页', () => {
  it('新建任务出现在待办列表，含类型与分钟', async () => {
    const user = userEvent.setup()
    render(<TodayPage />)
    await addTaskViaForm(user, '写周报', '必做', '20')
    expect(screen.getByText('写周报')).toBeInTheDocument()
    expect(screen.getByText(/必做/)).toBeInTheDocument()
  })

  it('完成流程记录实际耗时并移入已完成摘要', async () => {
    const user = userEvent.setup()
    render(<TodayPage />)
    await addTaskViaForm(user, '读书', '可选', '30')
    await user.click(screen.getByRole('button', { name: '完成 读书' }))
    await user.clear(screen.getByLabelText('实际分钟'))
    await user.type(screen.getByLabelText('实际分钟'), '25')
    await user.click(screen.getByRole('button', { name: '确定完成' }))
    expect(screen.queryByText('读书')).not.toBeInTheDocument()
    expect(screen.getByText(/已完成 1 项，共 25 分钟/)).toBeInTheDocument()
  })

  it('延期需填原因；恢复后回到待办', async () => {
    const user = userEvent.setup()
    render(<TodayPage />)
    await addTaskViaForm(user, '健身', '可选', '15')
    await user.click(screen.getByRole('button', { name: '延期 健身' }))
    await user.type(screen.getByLabelText('延期原因'), '带娃')
    await user.click(screen.getByRole('button', { name: '确定延期' }))
    const deferredSection = screen.getByText(/已延期（1）/).parentElement!
    expect(within(deferredSection).getByText('健身')).toBeInTheDocument()
    expect(within(deferredSection).getByText(/带娃/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '恢复 健身' }))
    expect(screen.getByText(/待办（1）/)).toBeInTheDocument()
  })

  it('生成计划：must 超限出警告，放不下的进未排入区', async () => {
    useStore.getState().updateMinutes('weekday', 'min', 30)
    useStore.getState().updateMinutes('weekend', 'min', 30)
    const user = userEvent.setup()
    render(<TodayPage />)
    await addTaskViaForm(user, '大必做', '必做', '100')
    await addTaskViaForm(user, '放不下', '可选', '60')
    await user.click(screen.getByRole('button', { name: '最低' }))
    await user.click(screen.getByRole('button', { name: '生成今日计划' }))
    expect(screen.getByText(/超过今日上限 30 分钟/)).toBeInTheDocument()
    const unplaced = screen.getByTestId('unplaced')
    expect(within(unplaced).getByText(/放不下/)).toBeInTheDocument()
    expect(within(unplaced).getByText(/分钟/)).toBeInTheDocument()
  })

  it('逾期任务显示在逾期区，待办 todo 标注会被自动带入', async () => {
    useStore.getState().addTask({ title: '过期任务', type: 'optional', estMinutes: 30, date: '2020-01-01' })
    render(<TodayPage />)
    const overdue = screen.getByText(/逾期（1）/).parentElement!
    expect(within(overdue).getByText('过期任务')).toBeInTheDocument()
    expect(within(overdue).getByText(/生成计划时自动带入/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm test src/features/today`
Expected: FAIL —— 今日页仍是占位文本，找不到表单控件

- [ ] **Step 3: 写实现（全量替换 TodayPage.tsx）**

```tsx
import { useState } from 'react'
import { todayStr } from '../../lib/date'
import type { PlannerResult } from '../../lib/planner'
import { useStore } from '../../lib/store'
import type { Goal, Task, TaskType, Tier } from '../../lib/types'

const TYPE_LABEL: Record<TaskType, string> = { must: '必做', optional: '可选', review: '复习' }
const TYPE_ORDER: Record<TaskType, number> = { must: 0, optional: 1, review: 2 }
const TIER_LABEL: Record<Tier, string> = { min: '最低', normal: '正常', plus: '强化' }
const TIERS: Tier[] = ['min', 'normal', 'plus']
const TYPES: TaskType[] = ['must', 'optional', 'review']

export default function TodayPage() {
  const today = todayStr()
  const tasks = useStore((s) => s.tasks)
  const goals = useStore((s) => s.goals)
  const generatePlan = useStore((s) => s.generatePlan)
  const [tier, setTier] = useState<Tier>('normal')
  const [result, setResult] = useState<PlannerResult | null>(null)

  const todays = tasks.filter((t) => t.date === today)
  const todo = todays
    .filter((t) => t.status === 'todo')
    .sort((a, b) => TYPE_ORDER[a.type] - TYPE_ORDER[b.type])
  const deferred = todays.filter((t) => t.status === 'deferred')
  const done = todays.filter((t) => t.status === 'done')
  const overdue = tasks.filter((t) => t.date < today && t.status !== 'done')
  const goalTitle = (id?: string) => goals.find((g) => g.id === id)?.title

  return (
    <div className="space-y-4">
      <header className="space-y-2">
        <h1 className="text-lg font-semibold">今日 · {today}</h1>
        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded border" data-testid="tier-selector">
            {TIERS.map((t) => (
              <button
                key={t}
                onClick={() => setTier(t)}
                aria-pressed={tier === t}
                className={`px-3 py-1 text-sm ${tier === t ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
              >
                {TIER_LABEL[t]}
              </button>
            ))}
          </div>
          <button
            onClick={() => setResult(generatePlan(today, tier))}
            className="rounded bg-blue-600 px-3 py-1 text-sm text-white"
          >
            生成今日计划
          </button>
        </div>
      </header>

      {result?.overloadWarning && (
        <div className="rounded bg-amber-100 px-3 py-2 text-sm text-amber-900">{result.overloadWarning}</div>
      )}
      {result && result.unplaced.length > 0 && (
        <div className="rounded bg-gray-100 px-3 py-2 text-sm text-gray-700" data-testid="unplaced">
          <p className="font-medium">今日放不下（{result.unplaced.length} 项）</p>
          <ul className="mt-1 list-disc pl-4">
            {result.unplaced.map(({ task, reason }) => (
              <li key={task.id}>
                {task.title}：{reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {overdue.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-medium text-orange-700">逾期（{overdue.length}）</h2>
          <ul className="space-y-1 text-sm">
            {overdue.map((t) => (
              <li key={t.id} className="rounded border border-orange-200 px-2 py-1">
                <span>
                  {t.title}（{t.date}）
                </span>
                {t.status === 'deferred' ? (
                  <span className="ml-2 text-gray-500">
                    已延期：{t.deferredReason}
                    <button
                      className="ml-2 text-blue-600 underline"
                      aria-label={`恢复 ${t.title}`}
                      onClick={() => useStore.getState().restoreTask(t.id)}
                    >
                      恢复
                    </button>
                  </span>
                ) : (
                  <span className="ml-2 text-gray-400">生成计划时自动带入</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <NewTaskForm activeGoals={goals.filter((g) => g.status === 'active')} />

      <section className="space-y-2">
        <h2 className="font-medium">待办（{todo.length}）</h2>
        {todo.map((t) => (
          <TaskItem key={t.id} task={t} goalTitle={goalTitle(t.goalId)} />
        ))}
      </section>

      {deferred.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-medium text-gray-500">已延期（{deferred.length}）</h2>
          {deferred.map((t) => (
            <TaskItem key={t.id} task={t} goalTitle={goalTitle(t.goalId)} />
          ))}
        </section>
      )}

      {done.length > 0 && (
        <p className="text-sm text-gray-500" data-testid="done-summary">
          已完成 {done.length} 项，共 {done.reduce((s, t) => s + (t.actualMinutes ?? 0), 0)} 分钟
        </p>
      )}
    </div>
  )
}

function NewTaskForm({ activeGoals }: { activeGoals: Goal[] }) {
  const addTask = useStore((s) => s.addTask)
  const [title, setTitle] = useState('')
  const [type, setType] = useState<TaskType>('optional')
  const [est, setEst] = useState('30')
  const [goalId, setGoalId] = useState('')
  const estNum = Number(est)
  const valid = title.trim() !== '' && Number.isFinite(estNum) && estNum > 0
  return (
    <form
      className="space-y-2 rounded border p-3"
      onSubmit={(e) => {
        e.preventDefault()
        if (!valid) return
        addTask({ title: title.trim(), type, estMinutes: estNum, goalId: goalId || undefined })
        setTitle('')
        setGoalId('')
      }}
    >
      <div className="flex gap-2">
        <input
          className="flex-1 rounded border px-2 py-1 text-sm"
          aria-label="新任务"
          placeholder="新任务"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <select aria-label="类型" className="rounded border px-1 text-sm" value={type} onChange={(e) => setType(e.target.value as TaskType)}>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {TYPE_LABEL[t]}
            </option>
          ))}
        </select>
        <input
          className="w-16 rounded border px-2 py-1 text-sm"
          aria-label="预计分钟"
          type="number"
          min={1}
          value={est}
          onChange={(e) => setEst(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <select
          aria-label="关联目标"
          className="flex-1 rounded border px-1 text-sm"
          value={goalId}
          onChange={(e) => setGoalId(e.target.value)}
        >
          <option value="">不关联目标</option>
          {activeGoals.map((g) => (
            <option key={g.id} value={g.id}>
              {g.title}
            </option>
          ))}
        </select>
        <button
          type="submit"
          name="添加任务"
          className="rounded bg-blue-600 px-3 py-1 text-sm text-white disabled:opacity-50"
          disabled={!valid}
        >
          添加任务
        </button>
      </div>
    </form>
  )
}

function TaskItem({ task, goalTitle }: { task: Task; goalTitle?: string }) {
  const completeTask = useStore((s) => s.completeTask)
  const deferTask = useStore((s) => s.deferTask)
  const restoreTask = useStore((s) => s.restoreTask)
  const deleteTask = useStore((s) => s.deleteTask)
  const updateTask = useStore((s) => s.updateTask)
  const [mode, setMode] = useState<'view' | 'complete' | 'defer' | 'edit'>('view')
  const [actual, setActual] = useState(String(task.estMinutes))
  const [reason, setReason] = useState('')
  const [title, setTitle] = useState(task.title)
  const [est, setEst] = useState(String(task.estMinutes))
  const [type, setType] = useState<TaskType>(task.type)

  const reset = () => {
    setMode('view')
    setActual(String(task.estMinutes))
    setReason('')
    setTitle(task.title)
    setEst(String(task.estMinutes))
    setType(task.type)
  }

  return (
    <div className="space-y-1 rounded border p-2">
      <div className="flex flex-wrap items-center gap-1 text-sm">
        <span className="font-medium">{task.title}</span>
        <span className="rounded bg-gray-100 px-1 text-xs">{TYPE_LABEL[task.type]}</span>
        <span className="text-xs text-gray-500">{task.estMinutes} 分钟</span>
        {goalTitle && <span className="rounded bg-blue-50 px-1 text-xs text-blue-700">{goalTitle}</span>}
        {task.status === 'deferred' && task.deferredReason && (
          <span className="text-xs text-gray-500">已延期：{task.deferredReason}</span>
        )}
        <span className="ml-auto flex gap-1">
          {task.status === 'deferred' ? (
            <button className="text-blue-600 underline" aria-label={`恢复 ${task.title}`} onClick={() => restoreTask(task.id)}>
              恢复
            </button>
          ) : (
            <>
              <button aria-label={`完成 ${task.title}`} onClick={() => setMode('complete')}>
                完成
              </button>
              <button aria-label={`延期 ${task.title}`} onClick={() => setMode('defer')}>
                延期
              </button>
              <button aria-label={`编辑 ${task.title}`} onClick={() => setMode('edit')}>
                编辑
              </button>
            </>
          )}
          <button className="text-red-600" aria-label={`删除 ${task.title}`} onClick={() => deleteTask(task.id)}>
            删除
          </button>
        </span>
      </div>

      {mode === 'complete' && (
        <div className="flex items-center gap-2 text-sm">
          <label>
            实际分钟
            <input
              className="ml-1 w-16 rounded border px-1"
              aria-label="实际分钟"
              type="number"
              min={0}
              value={actual}
              onChange={(e) => setActual(e.target.value)}
            />
          </label>
          <button
            className="rounded bg-blue-600 px-2 py-0.5 text-white"
            onClick={() => {
              const n = Number(actual)
              if (Number.isFinite(n) && n >= 0) completeTask(task.id, n)
              reset()
            }}
          >
            确定完成
          </button>
          <button onClick={reset}>取消</button>
        </div>
      )}

      {mode === 'defer' && (
        <div className="flex items-center gap-2 text-sm">
          <label>
            延期原因
            <input
              className="ml-1 rounded border px-1"
              aria-label="延期原因"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
          <button
            className="rounded bg-blue-600 px-2 py-0.5 text-white"
            onClick={() => {
              if (reason.trim() !== '') deferTask(task.id, reason.trim())
              reset()
            }}
          >
            确定延期
          </button>
          <button onClick={reset}>取消</button>
        </div>
      )}

      {mode === 'edit' && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <input
            className="rounded border px-1"
            aria-label="编辑任务名"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            className="w-16 rounded border px-1"
            aria-label="编辑分钟"
            type="number"
            min={1}
            value={est}
            onChange={(e) => setEst(e.target.value)}
          />
          <select aria-label="编辑类型" value={type} onChange={(e) => setType(e.target.value as TaskType)}>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABEL[t]}
              </option>
            ))}
          </select>
          <button
            className="rounded bg-blue-600 px-2 py-0.5 text-white"
            onClick={() => {
              const n = Number(est)
              if (title.trim() !== '' && Number.isFinite(n) && n > 0) updateTask(task.id, { title: title.trim(), estMinutes: n, type })
              reset()
            }}
          >
            保存编辑
          </button>
          <button onClick={reset}>取消</button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `pnpm test`
Expected: 全部通过（今日页 5 例）

- [ ] **Step 5: Commit**

```bash
git add src/features/today
git commit -m "feat: 今日页（新建/完成/延期/恢复/编辑/删除 + 三档计划生成）"
```

---

### Task 8: 路线页（目标 CRUD + 派生今日任务）

**Files:**
- Modify: `src/features/roadmap/RoadmapPage.tsx`（全量替换占位）
- Test: `src/features/roadmap/RoadmapPage.test.tsx`

**Interfaces:**
- Consumes: `useStore.addGoal / updateGoal / addTask`（Task 4）、`Goal / Goal['horizon']` 类型
- Produces: 目标分组展示（90 天 / 本周）+ 新建目标表单（标题/层级/优先级/截止日）+ 放弃/完成操作 + 每目标「派生今日任务」内联表单（标题默认目标名、分钟、类型）→ `addTask({ goalId })`

- [ ] **Step 1: 写失败测试**

`src/features/roadmap/RoadmapPage.test.tsx`：

```tsx
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RoadmapPage from './RoadmapPage'
import { resetStoreForTests, useStore } from '../../lib/store'

beforeEach(() => {
  localStorage.clear()
  resetStoreForTests()
})

describe('路线页', () => {
  it('新建 90 天目标出现在对应分组，显示优先级与截止日', async () => {
    const user = userEvent.setup()
    render(<RoadmapPage />)
    await user.type(screen.getByLabelText('目标标题'), 'MVP 上线')
    await user.selectOptions(screen.getByLabelText('层级'), 'quarter')
    await user.clear(screen.getByLabelText('优先级'))
    await user.type(screen.getByLabelText('优先级'), '5')
    await user.type(screen.getByLabelText('截止日'), '2027-01-13')
    await user.click(screen.getByRole('button', { name: '添加目标' }))
    const section = screen.getByText('90 天目标').parentElement!
    expect(within(section).getByText('MVP 上线')).toBeInTheDocument()
    expect(within(section).getByText(/P5/)).toBeInTheDocument()
    expect(within(section).getByText(/2027-01-13/)).toBeInTheDocument()
  })

  it('派生今日任务：落库为带 goalId 的当日 todo 任务', async () => {
    useStore.getState().addGoal({ title: '学 planner 设计', horizon: 'week', priority: 2 })
    const user = userEvent.setup()
    render(<RoadmapPage />)
    await user.click(screen.getByRole('button', { name: '派生今日任务 学 planner 设计' }))
    await user.clear(screen.getByLabelText('派生分钟'))
    await user.type(screen.getByLabelText('派生分钟'), '45')
    await user.click(screen.getByRole('button', { name: '确认派生' }))
    const t = useStore.getState().tasks.find((x) => x.title.includes('学 planner 设计'))!
    expect(t).toMatchObject({ status: 'todo', estMinutes: 45, type: 'optional' })
    expect(t.goalId).toBe(useStore.getState().goals[0].id)
    expect(t.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('放弃目标后不再出现在活跃分组', async () => {
    useStore.getState().addGoal({ title: '要放弃的', horizon: 'week', priority: 1 })
    const user = userEvent.setup()
    render(<RoadmapPage />)
    await user.click(screen.getByRole('button', { name: '放弃 要放弃的' }))
    expect(screen.queryByText('要放弃的')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm test src/features/roadmap`
Expected: FAIL —— 路线页仍是占位文本

- [ ] **Step 3: 写实现（全量替换 RoadmapPage.tsx）**

```tsx
import { useState } from 'react'
import { useStore } from '../../lib/store'
import type { Goal } from '../../lib/types'

export default function RoadmapPage() {
  const goals = useStore((s) => s.goals)
  const active = goals.filter((g) => g.status === 'active')
  const quarters = active.filter((g) => g.horizon === 'quarter')
  const weeks = active.filter((g) => g.horizon === 'week')

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">目标路线</h1>
      <NewGoalForm />
      <section className="space-y-2">
        <h2 className="font-medium">90 天目标</h2>
        {quarters.length === 0 && <p className="text-sm text-gray-400">暂无</p>}
        {quarters.map((g) => (
          <GoalItem key={g.id} goal={g} />
        ))}
      </section>
      <section className="space-y-2">
        <h2 className="font-medium">本周目标</h2>
        {weeks.length === 0 && <p className="text-sm text-gray-400">暂无</p>}
        {weeks.map((g) => (
          <GoalItem key={g.id} goal={g} />
        ))}
      </section>
      {active.length === 0 && quarters.length === 0 && weeks.length === 0 && null}
    </div>
  )
}

function NewGoalForm() {
  const addGoal = useStore((s) => s.addGoal)
  const [title, setTitle] = useState('')
  const [horizon, setHorizon] = useState<Goal['horizon']>('quarter')
  const [priority, setPriority] = useState('3')
  const [dueDate, setDueDate] = useState('')
  const pNum = Number(priority)
  const valid = title.trim() !== '' && Number.isFinite(pNum)
  return (
    <form
      className="space-y-2 rounded border p-3"
      onSubmit={(e) => {
        e.preventDefault()
        if (!valid) return
        addGoal({ title: title.trim(), horizon, priority: pNum, dueDate: dueDate || undefined })
        setTitle('')
        setDueDate('')
      }}
    >
      <div className="flex gap-2">
        <input
          className="flex-1 rounded border px-2 py-1 text-sm"
          aria-label="目标标题"
          placeholder="目标标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <select
          aria-label="层级"
          className="rounded border px-1 text-sm"
          value={horizon}
          onChange={(e) => setHorizon(e.target.value as Goal['horizon'])}
        >
          <option value="quarter">90 天</option>
          <option value="week">本周</option>
        </select>
        <input
          className="w-14 rounded border px-2 py-1 text-sm"
          aria-label="优先级"
          type="number"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        />
        <input
          className="rounded border px-2 py-1 text-sm"
          aria-label="截止日"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <button
          type="submit"
          className="rounded bg-blue-600 px-3 py-1 text-sm text-white disabled:opacity-50"
          disabled={!valid}
        >
          添加目标
        </button>
      </div>
    </form>
  )
}

function GoalItem({ goal }: { goal: Goal }) {
  const updateGoal = useStore((s) => s.updateGoal)
  const [deriving, setDeriving] = useState(false)
  const [title, setTitle] = useState(goal.title)
  const [est, setEst] = useState('30')
  return (
    <div className="space-y-1 rounded border p-2 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium">{goal.title}</span>
        <span className="rounded bg-gray-100 px-1 text-xs">P{goal.priority}</span>
        {goal.dueDate && <span className="text-xs text-gray-500">截止 {goal.dueDate}</span>}
        <span className="ml-auto flex gap-1">
          <button
            aria-label={`派生今日任务 ${goal.title}`}
            onClick={() => setDeriving((d) => !d)}
            className="text-blue-600"
          >
            派生今日任务
          </button>
          <button
            aria-label={`完成 ${goal.title}`}
            onClick={() => updateGoal(goal.id, { status: 'done' })}
            className="text-green-700"
          >
            完成
          </button>
          <button
            aria-label={`放弃 ${goal.title}`}
            onClick={() => updateGoal(goal.id, { status: 'dropped' })}
            className="text-red-600"
          >
            放弃
          </button>
        </span>
      </div>
      {deriving && (
        <div className="flex flex-wrap items-center gap-2">
          <input
            className="rounded border px-1"
            aria-label="派生任务名"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            className="w-16 rounded border px-1"
            aria-label="派生分钟"
            type="number"
            min={1}
            value={est}
            onChange={(e) => setEst(e.target.value)}
          />
          <button
            className="rounded bg-blue-600 px-2 py-0.5 text-white"
            onClick={() => {
              const n = Number(est)
              if (title.trim() !== '' && Number.isFinite(n) && n > 0) {
                useStore.getState().addTask({ title: title.trim(), type: 'optional', estMinutes: n, goalId: goal.id })
                setDeriving(false)
              }
            }}
          >
            确认派生
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `pnpm test`
Expected: 全部通过（路线页 3 例）

- [ ] **Step 5: Commit**

```bash
git add src/features/roadmap
git commit -m "feat: 路线页（目标 CRUD + 派生今日任务）"
```

---

### Task 9: 设置页（三档时长 / 导入导出 / 能力边界）+ README

**Files:**
- Modify: `src/features/settings/SettingsPage.tsx`（全量替换占位）
- Create: `README.md`
- Test: `src/features/settings/SettingsPage.test.tsx`

**Interfaces:**
- Consumes: `useStore.updateMinutes / useStore.getState()`（Task 4）、`serializeData / parseImport`（Task 5）
- Produces: 6 个分钟输入（工作日×周末 × 三档）即时生效；导出按钮下载 `pgos-export-YYYYMMDD.json`；导入文件解析成功整体替换、失败显示错误且数据不变；能力边界声明块

- [ ] **Step 1: 写失败测试**

`src/features/settings/SettingsPage.test.tsx`：

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SettingsPage from './SettingsPage'
import { resetStoreForTests, useStore } from '../../lib/store'


beforeEach(() => {
  localStorage.clear()
  resetStoreForTests()
})

describe('设置页', () => {
  it('修改工作日正常档分钟并写入 store', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />)
    const input = screen.getByLabelText('工作日·正常')
    await user.clear(input)
    await user.type(input, '45')
    expect(useStore.getState().settings.weekdayMinutes.normal).toBe(45)
  })

  it('导入合法数据整体替换，非法数据报错且不动现有数据', async () => {
    const user = userEvent.setup()
    useStore.getState().addTask({ title: '现有任务', type: 'must', estMinutes: 10 })
    render(<SettingsPage />)

    const bad = new File(['{oops'], 'bad.json', { type: 'application/json' })
    await user.upload(screen.getByLabelText('导入备份文件'), bad)
    expect(screen.getByText(/JSON 解析失败/)).toBeInTheDocument()
    expect(useStore.getState().tasks).toHaveLength(1)

    const data = { version: 1, goals: [], tasks: [], settings: useStore.getState().settings }
    const good = new File([JSON.stringify(data)], 'good.json', { type: 'application/json' })
    await user.upload(screen.getByLabelText('导入备份文件'), good)
    expect(useStore.getState().tasks).toHaveLength(0)
    expect(screen.getByText(/导入成功/)).toBeInTheDocument()
  })

  it('页面声明能力边界：本地存储不是云同步', () => {
    render(<SettingsPage />)
    expect(screen.getByText(/本地存储不是云同步/)).toBeInTheDocument()
    expect(screen.getByText(/无云同步|不支持多端/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm test src/features/settings`
Expected: FAIL —— 设置页仍是占位文本

- [ ] **Step 3: 写实现（全量替换 SettingsPage.tsx）**

```tsx
import { useState } from 'react'
import { parseImport, serializeData } from '../../lib/exportImport'
import { useStore } from '../../lib/store'
import { todayStr } from '../../lib/date'
import type { Tier } from '../../lib/types'

const TIERS: Array<{ key: Tier; label: string }> = [
  { key: 'min', label: '最低' },
  { key: 'normal', label: '正常' },
  { key: 'plus', label: '强化' },
]

export default function SettingsPage() {
  const settings = useStore((s) => s.settings)
  const updateMinutes = useStore((s) => s.updateMinutes)
  const [message, setMessage] = useState<string | null>(null)

  const onExport = () => {
    const s = useStore.getState()
    const blob = new Blob([serializeData({ version: 1, goals: s.goals, tasks: s.tasks, settings: s.settings })], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pgos-export-${todayStr().replaceAll('-', '')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const onImport = async (file: File) => {
    const text = await file.text()
    const r = parseImport(text)
    if (!r.ok) {
      setMessage(`导入失败：${r.error}（现有数据未改动）`)
      return
    }
    useStore.setState({ goals: r.data.goals, tasks: r.data.tasks, settings: r.data.settings })
    setMessage('导入成功，数据已整体替换')
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">设置</h1>

      <section className="space-y-2">
        <h2 className="font-medium">每日可用分钟</h2>
        <div className="grid grid-cols-3 gap-2">
          {TIERS.map((t) => (
            <label key={`w-${t.key}`} className="text-sm">
              工作日·{t.label}
              <input
                className="mt-1 w-full rounded border px-2 py-1"
                aria-label={`工作日·${t.label}`}
                type="number"
                min={0}
                value={settings.weekdayMinutes[t.key]}
                onChange={(e) => updateMinutes('weekday', t.key, Math.max(0, Number(e.target.value) || 0))}
              />
            </label>
          ))}
          {TIERS.map((t) => (
            <label key={`e-${t.key}`} className="text-sm">
              周末·{t.label}
              <input
                className="mt-1 w-full rounded border px-2 py-1"
                aria-label={`周末·${t.label}`}
                type="number"
                min={0}
                value={settings.weekendMinutes[t.key]}
                onChange={(e) => updateMinutes('weekend', t.key, Math.max(0, Number(e.target.value) || 0))}
              />
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">备份</h2>
        <div className="flex flex-wrap items-center gap-3">
          <button className="rounded bg-blue-600 px-3 py-1 text-sm text-white" onClick={onExport}>
            导出数据（JSON）
          </button>
          <label className="text-sm">
            导入备份文件
            <input
              className="ml-1 text-sm"
              aria-label="导入备份文件"
              type="file"
              accept="application/json,.json"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) void onImport(f)
                e.target.value = ''
              }}
            />
          </label>
        </div>
        {message && <p className="text-sm text-gray-700" data-testid="import-message">{message}</p>}
      </section>

      <section className="space-y-1 rounded border p-3 text-sm text-gray-600">
        <h2 className="font-medium text-gray-800">能力边界（v0.1）</h2>
        <p>· 本地存储不是云同步：数据只存在当前浏览器，换设备或清除浏览器数据会丢失，请定期导出备份</p>
        <p>· 不支持多端同步、离线 PWA、账号体系</p>
        <p>· 计划生成为确定性规则（无 LLM），AI 功能属后续迭代</p>
      </section>
    </div>
  )
}
```

`README.md`：

```markdown
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
```

- [ ] **Step 4: 运行测试确认通过**

Run: `pnpm test`
Expected: 全部通过（设置页 3 例）

Run: `pnpm typecheck`
Expected: 无错误

- [ ] **Step 5: Commit**

```bash
git add src/features/settings README.md
git commit -m "feat: 设置页（三档时长/导入导出/能力边界）+ README"
```

---

### Task 10: CI 部署流水线与 v0.1 上线

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `README.md`（部署节已有，无需改）

**Interfaces:**
- Consumes: `pnpm typecheck / test / build`（Task 1 脚本）、`dist/` 产物、`vite.config.ts` 的 `base`（Task 1 已配）
- Produces: push `main` 自动测试+构建+部署 GitHub Pages；线上 URL `https://<user>.github.io/personal-growth-os/`

- [ ] **Step 1: 写 workflow**

`.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: 本地验证构建产物**

Run: `pnpm build && ls dist`
Expected: `dist/index.html` 存在，资源引用带 `/personal-growth-os/` 前缀

- [ ] **Step 3: Commit**

```bash
git add .github
git commit -m "ci: push main 自动测试构建并部署 GitHub Pages"
```

- [ ] **Step 4: 建 GitHub 远端并推送**

Run: `gh auth status`
- 已登录：`gh repo create personal-growth-os --public --source . --push`
- 未登录：输出两条手动命令（网页建仓 + `git remote add origin … && git push -u origin main`），**不假装已创建**

Expected: 远端 main 与本地一致

- [ ] **Step 5: 启用 Pages（GitHub Actions 源）并等首次部署**

Run: `gh api repos/{owner}/personal-growth-os/pages -X POST -f build_type=workflow` （失败时提示网页手动设置：Settings → Pages → Source: GitHub Actions）
Watch: Actions 运行绿 → `https://<user>.github.io/personal-growth-os/` 返回 200

- [ ] **Step 6: 手动验收清单（浏览器逐项过）**

1. 手机与电脑浏览器打开线上 URL，底部三 Tab 可切换
2. 新建任务 → 编辑 → 完成（填实际分钟）→ 延期（填原因）→ 恢复
3. 刷新页面数据保持（localStorage 生效）
4. 路线页新建目标 → 派生今日任务 → 回今日页可见
5. 设置页导出 JSON → 清浏览器数据 → 导入恢复
6. 隐私模式打开 → 顶部红色警告条出现

- [ ] **Step 7: 回写进度文件**

`D:/Work/AI版/AI_Search/个人/个人成长进度.md` §4 追加：v0.1 上线记录（URL、验收结果、遗留问题）；§1 当前阶段更新为「v0.1 已上线，进入自用循环」

```bash
git add docs
git commit -m "docs: 计划执行完毕记录"   # 若进度文件不在本仓库则跳过（它在仓库外，直接编辑即可）
```

---

## 执行方式

按用户既有裁定（OMP 环境、AI 全程搭建）：**Inline 执行**（executing-plans，逐任务 TDD、每任务 commit、阻塞即停）。
