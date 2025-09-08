import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import AIAssistant from './pages/AIAssistant';
import HealthRecords from './pages/HealthRecords';
import Calendar from './pages/Calendar';
import Emergency from './pages/Emergency';
import Settings from './pages/Settings';
import './styles/App.css';

function App() {
  return (
    <div className="app">
      <Navigation />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/health-records" element={<HealthRecords />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

