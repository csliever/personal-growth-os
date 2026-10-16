import { useEffect, useState } from 'react'

function storageAvailable(): boolean {
  try {
    const k = '__pgos_probe__'
    localStorage.setItem(k, '1')
    localStorage.removeItem(k)
    return true
  } catch {
    return false
  }
}

export default function StorageWarning() {
  const [available, setAvailable] = useState(true)
  useEffect(() => setAvailable(storageAvailable()), [])
  if (available) return null
  return (
    <div className="bg-red-100 px-4 py-2 text-sm text-red-800" data-testid="storage-warning">
      当前浏览器存储不可用（可能是隐私模式），数据不会保存——请尽快导出备份。
    </div>
  )
}
