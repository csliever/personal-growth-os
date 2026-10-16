import { useState } from 'react'
import { todayStr } from '../../lib/date'
import { parseImport, serializeData } from '../../lib/exportImport'
import { useStore } from '../../lib/store'
import type { Tier } from '../../lib/types'

const TIERS: Array<{ key: Tier; label: string }> = [
  { key: 'min', label: '最低' },
  { key: 'normal', label: '正常' },
  { key: 'plus', label: '强化' },
]

const readAsText = (file: File): Promise<string> => {
  const { promise, resolve, reject } = Promise.withResolvers<string>()
  const reader = new FileReader()
  reader.onload = () => resolve(String(reader.result))
  reader.onerror = () => reject(reader.error)
  reader.readAsText(file)
  return promise
}

export default function SettingsPage() {
  const settings = useStore((s) => s.settings)
  const updateMinutes = useStore((s) => s.updateMinutes)
  const [message, setMessage] = useState<string | null>(null)

  const onExport = () => {
    const s = useStore.getState()
    const blob = new Blob([serializeData({ version: 1, goals: s.goals, tasks: s.tasks, settings: s.settings })], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pgos-export-${todayStr().replaceAll('-', '')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const onImport = async (file: File) => {
    const text = await readAsText(file)
    const r = parseImport(text)
    if (!r.ok) {
      setMessage(`导入失败：${r.error}（现有数据未改动）`)
      return
    }
    useStore.setState({ goals: r.data.goals, tasks: r.data.tasks, settings: r.data.settings })
    setMessage('导入成功，数据已整体替换')
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">设置</h1>

      <section className="space-y-2">
        <h2 className="font-medium">每日可用分钟</h2>
        <div className="grid grid-cols-3 gap-2">
          {TIERS.map((t) => (
            <label key={`w-${t.key}`} className="text-sm">
              工作日·{t.label}
              <input
                className="mt-1 w-full rounded border px-2 py-1"
                aria-label={`工作日·${t.label}`}
                type="number"
                min={0}
                value={settings.weekdayMinutes[t.key]}
                onChange={(e) => updateMinutes('weekday', t.key, Math.max(0, Number(e.target.value) || 0))}
              />
            </label>
          ))}
          {TIERS.map((t) => (
            <label key={`e-${t.key}`} className="text-sm">
              周末·{t.label}
              <input
                className="mt-1 w-full rounded border px-2 py-1"
                aria-label={`周末·${t.label}`}
                type="number"
                min={0}
                value={settings.weekendMinutes[t.key]}
                onChange={(e) => updateMinutes('weekend', t.key, Math.max(0, Number(e.target.value) || 0))}
              />
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">备份</h2>
        <div className="flex flex-wrap items-center gap-3">
          <button className="rounded bg-blue-600 px-3 py-1 text-sm text-white" onClick={onExport}>
            导出数据（JSON）
          </button>
          <label className="text-sm">
            导入备份文件
            <input
              className="ml-1 text-sm"
              aria-label="导入备份文件"
              type="file"
              accept="application/json,.json"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) void onImport(f)
                e.target.value = ''
              }}
            />
          </label>
        </div>
        {message && (
          <p className="text-sm text-gray-700" data-testid="import-message">
            {message}
          </p>
        )}
      </section>

      <section className="space-y-1 rounded border p-3 text-sm text-gray-600">
        <h2 className="font-medium text-gray-800">能力边界（v0.1）</h2>
        <p>· 本地存储不是云同步：数据只存在当前浏览器，换设备或清除浏览器数据会丢失，请定期导出备份</p>
        <p>· 不支持多端同步、离线 PWA、账号体系</p>
        <p>· 计划生成为确定性规则（无 LLM），AI 功能属后续迭代</p>
      </section>
    </div>
  )
}
