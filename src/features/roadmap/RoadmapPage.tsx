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
          <button aria-label={`完成 ${goal.title}`} onClick={() => updateGoal(goal.id, { status: 'done' })} className="text-green-700">
            完成
          </button>
          <button aria-label={`放弃 ${goal.title}`} onClick={() => updateGoal(goal.id, { status: 'dropped' })} className="text-red-600">
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
