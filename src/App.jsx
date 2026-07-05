import { useState } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import AuthGate from './components/AuthGate'
import DataGate from './components/DataGate'
import Layout from './components/Layout'
import QuickAddModal from './components/QuickAddModal'
import BackupModal from './components/BackupModal'
import MigrationPrompt from './components/MigrationPrompt'
import ExecutiveDashboard from './pages/ExecutiveDashboard'
import GoalsKPIs from './pages/GoalsKPIs'
import WeeklyPlanner from './pages/WeeklyPlanner'
import HealthDashboard from './pages/HealthDashboard'
import WeeklyReviews from './pages/WeeklyReviews'
import IdeasInbox from './pages/IdeasInbox'

export default function App() {
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [backupOpen, setBackupOpen] = useState(false)

  return (
    <AuthProvider>
      <AuthGate>
        <DataProvider>
          <DataGate>
            <HashRouter>
              <Routes>
                <Route element={<Layout onQuickAdd={() => setQuickAddOpen(true)} onBackup={() => setBackupOpen(true)} />}>
                  <Route path="/" element={<ExecutiveDashboard />} />
                  <Route path="/goals" element={<GoalsKPIs />} />
                  <Route path="/planner" element={<WeeklyPlanner />} />
                  <Route path="/health" element={<HealthDashboard />} />
                  <Route path="/reviews" element={<WeeklyReviews />} />
                  <Route path="/ideas" element={<IdeasInbox />} />
                </Route>
              </Routes>
            </HashRouter>
            <QuickAddModal open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
            <BackupModal open={backupOpen} onClose={() => setBackupOpen(false)} />
            <MigrationPrompt />
          </DataGate>
        </DataProvider>
      </AuthGate>
    </AuthProvider>
  )
}
