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
