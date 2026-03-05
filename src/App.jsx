import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import NavigationBar from './layouts/Navbar';
import Dashboard from './pages/Dashboard';
import CalendarPage from './pages/CalendarPage';
import CategoryView from './pages/CategoryView';

// Demo mode: no login/register pages — always authenticated as demo user
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <NavigationBar />
          <div className="container mt-4">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/calendar"
                element={
                  <ProtectedRoute>
                    <CalendarPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/categories"
                element={
                  <ProtectedRoute>
                    <CategoryView />
                  </ProtectedRoute>
                }
              />
              {/* Catch-all → dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
