import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { MainLayout } from '../components/layout/MainLayout'
import { LoadingCard } from '../components/feedback/LoadingCard'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicOnlyRoute } from './PublicOnlyRoute'

const AuthPage = lazy(() => import('../pages/auth/AuthPage').then((module) => ({ default: module.AuthPage })))
const SchedulePage = lazy(() => import('../pages/schedule/SchedulePage').then((module) => ({ default: module.SchedulePage })))
const AnnouncementsPage = lazy(() => import('../pages/announcements/AnnouncementsPage').then((module) => ({ default: module.AnnouncementsPage })))
const SettingsPage = lazy(() => import('../pages/settings/SettingsPage').then((module) => ({ default: module.SettingsPage })))
const ChurchServicesPage = lazy(() => import('../pages/church-services/ChurchServicesPage').then((module) => ({ default: module.ChurchServicesPage })))
const RecordedServicesPage = lazy(() => import('../pages/recorded-services/RecordedServicesPage').then((module) => ({ default: module.RecordedServicesPage })))
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage').then((module) => ({ default: module.DashboardPage })))
const EventsPage = lazy(() => import('../pages/events/EventsPage').then((module) => ({ default: module.EventsPage })))
const MembersPage = lazy(() => import('../pages/members/MembersPage').then((module) => ({ default: module.MembersPage })))
const PrayerPage = lazy(() => import('../pages/prayer/PrayerPage').then((module) => ({ default: module.PrayerPage })))
const SupervisorsPage = lazy(() => import('../pages/supervisors/SupervisorsPage').then((module) => ({ default: module.SupervisorsPage })))

const RouteFallback = () => (
  <div className="grid gap-4 md:grid-cols-3">
    {Array.from({ length: 3 }).map((_, idx) => (
      <LoadingCard key={idx} />
    ))}
  </div>
)

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/auth"
          element={(
            <PublicOnlyRoute>
              <Suspense fallback={<RouteFallback />}>
                <AuthPage />
              </Suspense>
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
          <Route path="/" element={<Suspense fallback={<RouteFallback />}><DashboardPage /></Suspense>} />
          <Route path="/cultos" element={<Suspense fallback={<RouteFallback />}><ChurchServicesPage /></Suspense>} />
          <Route path="/eventos" element={<Suspense fallback={<RouteFallback />}><EventsPage /></Suspense>} />
          <Route path="/agenda" element={<Navigate to="/agenda/ministerial" replace />} />
          <Route path="/agenda/ministerial" element={<Suspense fallback={<RouteFallback />}><SchedulePage /></Suspense>} />
          <Route path="/agenda/pastor" element={<Suspense fallback={<RouteFallback />}><SchedulePage /></Suspense>} />
          <Route path="/cultos-registrados" element={<Suspense fallback={<RouteFallback />}><RecordedServicesPage /></Suspense>} />
          <Route path="/membros" element={<Suspense fallback={<RouteFallback />}><MembersPage /></Suspense>} />
          <Route path="/pessoas" element={<Suspense fallback={<RouteFallback />}><SupervisorsPage /></Suspense>} />
          <Route path="/avisos" element={<Suspense fallback={<RouteFallback />}><AnnouncementsPage /></Suspense>} />
          <Route path="/oracao" element={<Suspense fallback={<RouteFallback />}><PrayerPage /></Suspense>} />
          <Route path="/configuracoes" element={<Suspense fallback={<RouteFallback />}><SettingsPage /></Suspense>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
