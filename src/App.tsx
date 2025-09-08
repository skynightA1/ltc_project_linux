import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AIAssistant from './pages/AIAssistant';
import HealthRecords from './pages/HealthRecords';
import Calendar from './pages/Calendar';
import Emergency from './pages/Emergency';
import Settings from './pages/Settings';
import './styles/App.css';

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <div className="app">
          <Routes>
            {/* 公開路由 */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* 受保護的路由 */}
            <Route path="/" element={
              <ProtectedRoute>
                <Navigation />
                <main className="main-content">
                  <Dashboard />
                </main>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Navigation />
                <main className="main-content">
                  <Dashboard />
                </main>
              </ProtectedRoute>
            } />
            
            <Route path="/ai-assistant" element={
              <ProtectedRoute>
                <Navigation />
                <main className="main-content">
                  <AIAssistant />
                </main>
              </ProtectedRoute>
            } />
            
            <Route path="/health-records" element={
              <ProtectedRoute>
                <Navigation />
                <main className="main-content">
                  <HealthRecords />
                </main>
              </ProtectedRoute>
            } />
            
            <Route path="/calendar" element={
              <ProtectedRoute>
                <Navigation />
                <main className="main-content">
                  <Calendar />
                </main>
              </ProtectedRoute>
            } />
            
            <Route path="/emergency" element={
              <ProtectedRoute>
                <Navigation />
                <main className="main-content">
                  <Emergency />
                </main>
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <Navigation />
                <main className="main-content">
                  <Settings />
                </main>
              </ProtectedRoute>
            } />
            
            {/* 預設重導向 */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;

