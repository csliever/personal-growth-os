import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RoadmapPage from './RoadmapPage'
import { resetStoreForTests, useStore } from '../../lib/store'

beforeEach(() => {
  localStorage.clear()
  resetStoreForTests()
})

describe('路线页', () => {
  it('新建 90 天目标出现在对应分组，显示优先级与截止日', async () => {
    const user = userEvent.setup()
    render(<RoadmapPage />)
    await user.type(screen.getByLabelText('目标标题'), 'MVP 上线')
    await user.selectOptions(screen.getByLabelText('层级'), 'quarter')
    await user.clear(screen.getByLabelText('优先级'))
    await user.type(screen.getByLabelText('优先级'), '5')
    await user.type(screen.getByLabelText('截止日'), '2027-01-13')
    await user.click(screen.getByRole('button', { name: '添加目标' }))
    const section = screen.getByText('90 天目标').parentElement!
    expect(within(section).getByText('MVP 上线')).toBeInTheDocument()
    expect(within(section).getByText(/P5/)).toBeInTheDocument()
    expect(within(section).getByText(/2027-01-13/)).toBeInTheDocument()
  })

  it('派生今日任务：落库为带 goalId 的当日 todo 任务', async () => {
    useStore.getState().addGoal({ title: '学 planner 设计', horizon: 'week', priority: 2 })
    const user = userEvent.setup()
    render(<RoadmapPage />)
    await user.click(screen.getByRole('button', { name: '派生今日任务 学 planner 设计' }))
    await user.clear(screen.getByLabelText('派生分钟'))
    await user.type(screen.getByLabelText('派生分钟'), '45')
    await user.click(screen.getByRole('button', { name: '确认派生' }))
    const t = useStore.getState().tasks.find((x) => x.title.includes('学 planner 设计'))!
    expect(t).toMatchObject({ status: 'todo', estMinutes: 45, type: 'optional' })
    expect(t.goalId).toBe(useStore.getState().goals[0].id)
    expect(t.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('放弃目标后不再出现在活跃分组', async () => {
    useStore.getState().addGoal({ title: '要放弃的', horizon: 'week', priority: 1 })
    const user = userEvent.setup()
    render(<RoadmapPage />)
    await user.click(screen.getByRole('button', { name: '放弃 要放弃的' }))
    expect(screen.queryByText('要放弃的')).not.toBeInTheDocument()
  })
})
