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
