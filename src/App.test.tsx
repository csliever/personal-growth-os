import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('应用外壳', () => {
  it('默认进入今日页', () => {
    render(<App />)
    expect(window.location.hash).toContain('#/today')
  })

  it('底部导航可在三页间切换', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('link', { name: '路线' }))
    expect(window.location.hash).toContain('#/roadmap')
    await user.click(screen.getByRole('link', { name: '设置' }))
    expect(window.location.hash).toContain('#/settings')
    await user.click(screen.getByRole('link', { name: '今日' }))
    expect(window.location.hash).toContain('#/today')
  })
})
