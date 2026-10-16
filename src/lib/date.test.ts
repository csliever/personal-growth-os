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
