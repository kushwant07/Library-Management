import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { BooksPage } from './pages/BooksPage.jsx';
import { DatabaseDemoPage } from './pages/DatabaseDemoPage.jsx';
import { systemApi } from './services/api.js';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [systemStats, setSystemStats] = useState(null);
  const [toast, setToast] = useState('');

  const fetchStats = async () => {
    try {
      const res = await systemApi.getDashboardStats();
      if (res.data.success) {
        setSystemStats(res.data.stats);
      }
    } catch {
      // Ignore poll errors
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 4000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (message) => {
    setToast(message);
    fetchStats();
    setTimeout(() => setToast(''), 3500);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl border border-indigo-200 bg-white/95 px-4 py-2.5 text-xs font-semibold text-slate-800 shadow-xl shadow-slate-900/10 backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-indigo-600 animate-ping" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Navbar with 3 Tabs and Redis indicator */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={systemStats}
      />

      {/* Main Page Content (3 Pages Only) */}
      <main className="mx-auto flex-1 w-full max-w-6xl px-4 py-6 sm:px-6">
        {activeTab === 'dashboard' && (
          <DashboardPage setActiveTab={setActiveTab} />
        )}
        {activeTab === 'books' && (
          <BooksPage onDataChange={fetchStats} toastMessage={showToast} />
        )}
        {activeTab === 'demo' && (
          <DatabaseDemoPage toastMessage={showToast} />
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-slate-200 bg-white py-3.5 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-1">
          <span>Library Management System &bull; MongoDB (Storage) & Redis (Cache)</span>
          <span className="font-mono text-[11px] text-slate-400">Student Demonstration Project</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
