import { resetStoreForTests, useStore } from './store'

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
    expect(useStore.getState().tasks[0]).toMatchObject({ status: 'done', actualMinutes: 25 })
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
