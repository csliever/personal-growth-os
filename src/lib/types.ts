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
