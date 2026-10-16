import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import StorageWarning from './components/StorageWarning'
import RoadmapPage from './features/roadmap/RoadmapPage'
import SettingsPage from './features/settings/SettingsPage'
import TodayPage from './features/today/TodayPage'

export default function App() {
  return (
    <HashRouter>
      <div className="mx-auto flex min-h-screen max-w-lg flex-col pb-16">
        <StorageWarning />
        <main className="flex-1 px-4 py-3">
          <Routes>
            <Route path="/" element={<Navigate to="/today" replace />} />
            <Route path="/today" element={<TodayPage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </HashRouter>
  )
}
