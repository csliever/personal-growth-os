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
