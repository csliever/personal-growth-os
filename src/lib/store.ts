import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { isWeekend, todayStr } from './date'
import { newId } from './id'
import { generateDailyPlan } from './planner'
import type { PlannerResult } from './planner'
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
  generatePlan: (date: string, tier: Tier) => PlannerResult
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
      updateTask: (id, patch) => set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
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
      updateGoal: (id, patch) => set((s) => ({ goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)) })),
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
