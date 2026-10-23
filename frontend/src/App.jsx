import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import AppLayout from './layouts/AppLayout.jsx';

// Pages
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import VehiclesPage from './pages/VehiclesPage.jsx';
import DriversPage from './pages/DriversPage.jsx';
import TripsPage from './pages/TripsPage.jsx';
import LiveTrackingPage from './pages/LiveTrackingPage.jsx';
import FuelPage from './pages/FuelPage.jsx';
import MaintenancePage from './pages/MaintenancePage.jsx';
import AttendancePage from './pages/AttendancePage.jsx';
import ExpensesPage from './pages/ExpensesPage.jsx';
import PayrollPage from './pages/PayrollPage.jsx';
import ProfitabilityPage from './pages/ProfitabilityPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import AlertsPage from './pages/AlertsPage.jsx';
import DocumentsPage from './pages/DocumentsPage.jsx';
import SubscriptionPage from './pages/SubscriptionPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import OrganizationsPage from './pages/OrganizationsPage.jsx';
import AuditLogsPage from './pages/AuditLogsPage.jsx';
import UsersPage from './pages/UsersPage.jsx';

import { ShieldAlert } from 'lucide-react';

// 403 Forbidden
const ForbiddenPage = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '1rem', background: 'var(--background)' }}>
    <ShieldAlert size={56} color="var(--danger)" />
    <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Access Denied</h1>
    <p style={{ color: 'var(--text-muted)', maxWidth: '420px', textAlign: 'center' }}>
      Your role does not have authorization to access this enterprise module. Contact your organization administrator.
    </p>
    <a href="/dashboard" className="btn btn-primary">Return to Dashboard</a>
  </div>
);

// 404 Not Found
const NotFoundPage = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '1rem', background: 'var(--background)' }}>
    <h1 style={{ fontSize: '5rem', fontWeight: 800, color: 'var(--text-subtle)', lineHeight: 1 }}>404</h1>
    <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Page Not Found</h2>
    <p style={{ color: 'var(--text-muted)' }}>The requested FleetOS module or resource could not be found.</p>
    <a href="/dashboard" className="btn btn-primary">Return to Dashboard</a>
  </div>
);

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Authentication */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/403" element={<ForbiddenPage />} />

          {/* Protected Enterprise Shell */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Operations */}
            <Route
              path="/vehicles"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'org_admin', 'fleet_manager', 'driver', 'maintenance_staff', 'maintenance', 'analyst']}>
                  <VehiclesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/drivers"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'org_admin', 'fleet_manager', 'driver', 'maintenance_staff', 'maintenance', 'analyst']}>
                  <DriversPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trips"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'org_admin', 'fleet_manager', 'driver', 'maintenance_staff', 'maintenance', 'analyst']}>
                  <TripsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tracking"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'org_admin', 'fleet_manager', 'driver', 'maintenance_staff', 'maintenance', 'analyst']}>
                  <LiveTrackingPage />
                </ProtectedRoute>
              }
            />

            {/* Records & Finance */}
            <Route
              path="/fuel"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'org_admin', 'fleet_manager', 'driver', 'maintenance_staff', 'maintenance', 'analyst']}>
                  <FuelPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/maintenance"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'org_admin', 'fleet_manager', 'driver', 'maintenance_staff', 'maintenance', 'analyst']}>
                  <MaintenancePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'org_admin', 'fleet_manager', 'driver', 'maintenance_staff', 'maintenance', 'analyst']}>
                  <AttendancePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/expenses"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'org_admin', 'fleet_manager', 'driver', 'maintenance_staff', 'maintenance', 'analyst']}>
                  <ExpensesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'org_admin', 'fleet_manager', 'driver', 'analyst']}>
                  <PayrollPage />
                </ProtectedRoute>
              }
            />

            {/* Analytics & Compliance */}
            <Route
              path="/profitability"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'org_admin', 'fleet_manager', 'analyst']}>
                  <ProfitabilityPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'org_admin', 'fleet_manager', 'driver', 'maintenance_staff', 'maintenance', 'analyst']}>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/alerts"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'org_admin', 'fleet_manager', 'maintenance_staff', 'maintenance', 'analyst']}>
                  <AlertsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/documents"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'org_admin', 'fleet_manager', 'maintenance_staff', 'maintenance', 'analyst']}>
                  <DocumentsPage />
                </ProtectedRoute>
              }
            />

            {/* Platform & Administration */}
            <Route
              path="/organizations"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <OrganizationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'org_admin']}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subscription"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'org_admin']}>
                  <SubscriptionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit-logs"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'org_admin', 'fleet_manager', 'analyst']}>
                  <AuditLogsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'org_admin', 'fleet_manager']}>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
