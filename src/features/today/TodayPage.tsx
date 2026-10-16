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
  const todo = todays.filter((t) => t.status === 'todo').sort((a, b) => TYPE_ORDER[a.type] - TYPE_ORDER[b.type])
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
        <select
          aria-label="类型"
          className="rounded border px-1 text-sm"
          value={type}
          onChange={(e) => setType(e.target.value as TaskType)}
        >
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
            <button
              className="text-blue-600 underline"
              aria-label={`恢复 ${task.title}`}
              onClick={() => restoreTask(task.id)}
            >
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
              if (title.trim() !== '' && Number.isFinite(n) && n > 0)
                updateTask(task.id, { title: title.trim(), estMinutes: n, type })
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
