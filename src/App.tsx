import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { FindParkingPage } from './pages/FindParkingPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { VehicleEntryPage } from './pages/VehicleEntryPage';
import { VehicleExitPage } from './pages/VehicleExitPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { MyVehiclesPage } from './pages/MyVehiclesPage';
import { ProfilePage } from './pages/ProfilePage';

// Admin Pages
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { AdminFacilitiesPage } from './pages/admin/AdminFacilitiesPage';
import { AdminSlotsPage } from './pages/admin/AdminSlotsPage';
import { AdminReservationsPage } from './pages/admin/AdminReservationsPage';
import { AdminLogsPage } from './pages/admin/AdminLogsPage';
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminSensorsPage } from './pages/admin/AdminSensorsPage';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#F97316] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Admin Route Guard
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#F97316] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9] text-[#292522]">
      <Navbar />
      
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* User Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/find-parking" element={<ProtectedRoute><FindParkingPage /></ProtectedRoute>} />
          <Route path="/bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
          <Route path="/vehicle-entry" element={<ProtectedRoute><VehicleEntryPage /></ProtectedRoute>} />
          <Route path="/vehicle-exit" element={<ProtectedRoute><VehicleExitPage /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
          <Route path="/vehicles" element={<ProtectedRoute><MyVehiclesPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Admin Protected Routes */}
          <Route path="/admin" element={<AdminRoute><AdminOverviewPage /></AdminRoute>} />
          <Route path="/admin/facilities" element={<AdminRoute><AdminFacilitiesPage /></AdminRoute>} />
          <Route path="/admin/slots" element={<AdminRoute><AdminSlotsPage /></AdminRoute>} />
          <Route path="/admin/reservations" element={<AdminRoute><AdminReservationsPage /></AdminRoute>} />
          <Route path="/admin/logs" element={<AdminRoute><AdminLogsPage /></AdminRoute>} />
          <Route path="/admin/payments" element={<AdminRoute><AdminPaymentsPage /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
          <Route path="/admin/sensors" element={<AdminRoute><AdminSensorsPage /></AdminRoute>} />

          {/* Fallback 404 Route */}
          <Route path="*" element={
            <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
              <h2 className="font-display font-black text-4xl text-[#292522]">404</h2>
              <p className="text-sm text-[#3A332E]/80">The requested terminal route does not exist.</p>
              <a href="/" className="inline-block px-5 py-2.5 rounded-xl bg-[#F97316] text-white font-bold text-xs">
                Return to Home
              </a>
            </div>
          } />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

export default App;
