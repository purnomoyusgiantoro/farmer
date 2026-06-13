import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Lands from './pages/Lands';
import Equipment from './pages/Equipment';
import Activities from './pages/Activities';
import OrgStructure from './pages/OrgStructure';
import News from './pages/News';
import AdminSettings from './pages/AdminSettings';
import ProfileSettings from './pages/ProfileSettings';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Main Routes wrapped in DashboardLayout shell */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/lands"
            element={
              <ProtectedRoute allowedRoles={['petani', 'pengurus', 'bpp']}>
                <DashboardLayout>
                  <Lands />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/equipment"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Equipment />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/activities"
            element={
              <ProtectedRoute allowedRoles={['petani', 'pengurus']}>
                <DashboardLayout>
                  <Activities />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/org"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <OrgStructure />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/news"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <News />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout>
                  <AdminSettings />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ProfileSettings />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect to Dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
