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
      tasks: [task({ id: 'low', title: '低优', goalId: 'g2' }), task({ id: 'high', title: '高优', goalId: 'g1' })],
    })
    expect(r.plan.map((t) => t.id)).toEqual(['high', 'low'])
  })

  it('放不下整任务进 unplaced，继续尝试更小的后续任务', () => {
    const r = run({
      tier: 'min',
      tasks: [task({ id: 'big', title: '大', estMinutes: 45 }), task({ id: 'small', title: '小', estMinutes: 15 })],
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
