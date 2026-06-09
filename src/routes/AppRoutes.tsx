import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { MainLayout } from '../components/layout/MainLayout'
import { AuthPage } from '../pages/auth/AuthPage'
import { SchedulePage } from '../pages/schedule/SchedulePage'
import { AnnouncementsPage } from '../pages/announcements/AnnouncementsPage'
import { SettingsPage } from '../pages/settings/SettingsPage'
import { ChurchServicesPage } from '../pages/church-services/ChurchServicesPage'
import { RecordedServicesPage } from '../pages/recorded-services/RecordedServicesPage'
import { DashboardPage } from '../pages/dashboard/DashboardPage'
import { EventsPage } from '../pages/events/EventsPage'
import { MembersPage } from '../pages/members/MembersPage'
import { PrayerPage } from '../pages/prayer/PrayerPage'
import { SupervisorsPage } from '../pages/supervisors/SupervisorsPage'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicOnlyRoute } from './PublicOnlyRoute'

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/auth"
          element={(
            <PublicOnlyRoute>
              <AuthPage />
            </PublicOnlyRoute>
          )}
        />

        <Route
          element={(
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          )}
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/cultos" element={<ChurchServicesPage />} />
          <Route path="/eventos" element={<EventsPage />} />
          <Route path="/agenda" element={<SchedulePage />} />
          <Route path="/cultos-registrados" element={<RecordedServicesPage />} />
          <Route path="/membros" element={<MembersPage />} />
          <Route path="/pessoas" element={<SupervisorsPage />} />
          <Route path="/avisos" element={<AnnouncementsPage />} />
          <Route path="/oracao" element={<PrayerPage />} />
          <Route path="/configuracoes" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
