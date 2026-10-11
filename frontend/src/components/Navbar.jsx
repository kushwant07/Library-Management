import React from 'react';
import { BookOpen, LayoutDashboard, Database, Zap } from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab, stats }) => {
  const redisConnected = stats?.redisConnected ?? false;
  const mongoConnected = stats?.mongoConnected ?? false;

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'books', label: 'Books Management', icon: BookOpen },
    { id: 'demo', label: 'Database Demo', icon: Database },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">Library System</h1>
            <p className="text-[11px] text-slate-400">MongoDB & Redis Student Project</p>
          </div>
        </div>

        {/* Navigation Tabs (3 Pages Only) */}
        <nav className="flex items-center gap-1 rounded-xl bg-slate-900 p-1 border border-slate-800">
          {navLinks.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Database Status Indicators */}
        <div className="flex items-center gap-2 text-xs">
          {/* MongoDB Status */}
          <div
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 ${
              mongoConnected
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                : 'border-rose-500/30 bg-rose-500/10 text-rose-400'
            }`}
            title="MongoDB stores permanent book records"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                mongoConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
              }`}
            />
            <span className="font-medium text-[11px]">Mongo: {mongoConnected ? 'Connected' : 'Offline'}</span>
          </div>

          {/* Redis Status */}
          <div
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 ${
              redisConnected
                ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                : 'border-rose-500/30 bg-rose-500/10 text-rose-400'
            }`}
            title="Redis stores in-memory search caches"
          >
            <Zap className="h-3 w-3" />
            <span className="font-medium text-[11px]">Redis: {redisConnected ? 'Connected' : 'Offline'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
