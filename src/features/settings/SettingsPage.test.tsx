import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SettingsPage from './SettingsPage'
import { resetStoreForTests, useStore } from '../../lib/store'

beforeEach(() => {
  localStorage.clear()
  resetStoreForTests()
})

describe('设置页', () => {
  it('修改工作日正常档分钟并写入 store', async () => {
    const user = userEvent.setup()
    render(<SettingsPage />)
    const input = screen.getByLabelText('工作日·正常')
    await user.clear(input)
    await user.type(input, '45')
    expect(useStore.getState().settings.weekdayMinutes.normal).toBe(45)
  })

  it('导入合法数据整体替换，非法数据报错且不动现有数据', async () => {
    const user = userEvent.setup()
    useStore.getState().addTask({ title: '现有任务', type: 'must', estMinutes: 10 })
    render(<SettingsPage />)

    const bad = new File(['{oops'], 'bad.json', { type: 'application/json' })
    await user.upload(screen.getByLabelText('导入备份文件'), bad)
    expect(screen.getByText(/JSON 解析失败/)).toBeInTheDocument()
    expect(useStore.getState().tasks).toHaveLength(1)

    const data = { version: 1, goals: [], tasks: [], settings: useStore.getState().settings }
    const good = new File([JSON.stringify(data)], 'good.json', { type: 'application/json' })
    await user.upload(screen.getByLabelText('导入备份文件'), good)
    expect(useStore.getState().tasks).toHaveLength(0)
    expect(screen.getByText(/导入成功/)).toBeInTheDocument()
  })

  it('页面声明能力边界：本地存储不是云同步', () => {
    render(<SettingsPage />)
    expect(screen.getByText(/本地存储不是云同步/)).toBeInTheDocument()
    expect(screen.getByText(/不支持多端/)).toBeInTheDocument()
  })
})
