import { NavLink } from 'react-router-dom'

const items = [
  { to: '/today', label: '今日' },
  { to: '/roadmap', label: '路线' },
  { to: '/settings', label: '设置' },
]

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 border-t border-gray-200 bg-white" data-testid="bottom-nav">
      <div className="mx-auto flex max-w-lg">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) =>
              `flex-1 py-3 text-center text-sm ${isActive ? 'font-semibold text-blue-600' : 'text-gray-500'}`
            }
          >
            {it.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
