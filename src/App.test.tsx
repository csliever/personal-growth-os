import { render, screen } from '@testing-library/react'
import App from './App'

describe('App 冒烟', () => {
  it('渲染应用标题', () => {
    render(<App />)
    expect(screen.getByText('个人成长 OS')).toBeInTheDocument()
  })
})
