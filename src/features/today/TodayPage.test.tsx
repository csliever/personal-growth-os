import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TodayPage from './TodayPage'
import { resetStoreForTests, useStore } from '../../lib/store'

beforeEach(() => {
  localStorage.clear()
  resetStoreForTests()
})

const addTaskViaForm = async (user: ReturnType<typeof userEvent.setup>, title: string, type: string, est: string) => {
  await user.type(screen.getByLabelText('新任务'), title)
  await user.selectOptions(screen.getByLabelText('类型'), type)
  await user.clear(screen.getByLabelText('预计分钟'))
  await user.type(screen.getByLabelText('预计分钟'), est)
  await user.click(screen.getByRole('button', { name: '添加任务' }))
}

describe('今日页', () => {
  it('新建任务出现在待办列表，含类型与分钟', async () => {
    const user = userEvent.setup()
    render(<TodayPage />)
    await addTaskViaForm(user, '写周报', '必做', '20')
    expect(screen.getByText('写周报')).toBeInTheDocument()
    expect(useStore.getState().tasks[0]).toMatchObject({ title: '写周报', type: 'must', estMinutes: 20 })
  })

  it('完成流程记录实际耗时并移入已完成摘要', async () => {
    const user = userEvent.setup()
    render(<TodayPage />)
    await addTaskViaForm(user, '读书', '可选', '30')
    await user.click(screen.getByRole('button', { name: '完成 读书' }))
    await user.clear(screen.getByLabelText('实际分钟'))
    await user.type(screen.getByLabelText('实际分钟'), '25')
    await user.click(screen.getByRole('button', { name: '确定完成' }))
    expect(screen.queryByText('读书')).not.toBeInTheDocument()
    expect(screen.getByText(/已完成 1 项，共 25 分钟/)).toBeInTheDocument()
  })

  it('延期需填原因；恢复后回到待办', async () => {
    const user = userEvent.setup()
    render(<TodayPage />)
    await addTaskViaForm(user, '健身', '可选', '15')
    await user.click(screen.getByRole('button', { name: '延期 健身' }))
    await user.type(screen.getByLabelText('延期原因'), '带娃')
    await user.click(screen.getByRole('button', { name: '确定延期' }))
    const deferredSection = screen.getByText(/已延期（1）/).parentElement!
    expect(within(deferredSection).getByText('健身')).toBeInTheDocument()
    expect(within(deferredSection).getByText(/带娃/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '恢复 健身' }))
    expect(screen.getByText(/待办（1）/)).toBeInTheDocument()
  })

  it('生成计划：must 超限出警告，放不下的进未排入区', async () => {
    useStore.getState().updateMinutes('weekday', 'min', 30)
    useStore.getState().updateMinutes('weekend', 'min', 30)
    const user = userEvent.setup()
    render(<TodayPage />)
    await addTaskViaForm(user, '大必做', '必做', '100')
    await addTaskViaForm(user, '放不下', '可选', '60')
    await user.click(screen.getByRole('button', { name: '最低' }))
    await user.click(screen.getByRole('button', { name: '生成今日计划' }))
    expect(screen.getByText(/超过今日上限 30 分钟/)).toBeInTheDocument()
    const unplaced = screen.getByTestId('unplaced')
    expect(within(unplaced).getByText(/放不下：剩余/)).toBeInTheDocument()
    expect(within(unplaced).getByText(/分钟/)).toBeInTheDocument()
  })

  it('逾期任务显示在逾期区，待办 todo 标注会被自动带入', () => {
    useStore.getState().addTask({ title: '过期任务', type: 'optional', estMinutes: 30, date: '2020-01-01' })
    render(<TodayPage />)
    const overdue = screen.getByText(/逾期（1）/).parentElement!
    expect(within(overdue).getByText(/过期任务/)).toBeInTheDocument()
    expect(within(overdue).getByText(/生成计划时自动带入/)).toBeInTheDocument()
  })
})
