import React, { useEffect, useState } from 'react';
import { BookOpen, Users, CheckCircle, Database, Zap, ArrowRight } from 'lucide-react';
import { systemApi } from '../services/api.js';

export const DashboardPage = ({ setActiveTab }) => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableCopies: 0,
    totalMembers: 0,
    mongoConnected: false,
    redisConnected: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await systemApi.getDashboardStats();
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">System Dashboard</h1>
        <p className="text-xs text-slate-500">
          Overview of library inventory and polyglot persistence storage engines
        </p>
      </div>

      {/* 3 Simple Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Stat 1: Total Books */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Total Books</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 font-mono">
            {isLoading ? '...' : stats.totalBooks}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Unique book titles in catalog</p>
        </div>

        {/* Stat 2: Available Books (Copies) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Available Copies</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <CheckCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 font-mono">
            {isLoading ? '...' : stats.availableCopies}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Total physical copies on shelves</p>
        </div>

        {/* Stat 3: Total Members */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Total Members</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-purple-700 font-mono">
            {isLoading ? '...' : stats.totalMembers}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Registered library patrons</p>
        </div>
      </div>

      {/* Database Roles Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* MongoDB Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-emerald-700 font-bold text-sm">
            <Database className="h-4 w-4" />
            <span>MongoDB (Permanent Storage)</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Acts as the <strong>Source of Truth</strong>. All book records (titles, authors, categories, ISBNs, and copy counts) are permanently persisted to disk. Data survives backend server restarts.
          </p>
        </div>

        {/* Redis Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-amber-700 font-bold text-sm">
            <Zap className="h-4 w-4" />
            <span>Redis (In-Memory Cache)</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Acts as the <strong>Performance Accelerator</strong>. Caches book list and search query results in RAM (1–5ms response time). Automatically invalidates when any book is added, modified, or deleted.
          </p>
        </div>
      </div>

      {/* Quick Navigation CTA */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <span className="text-xs text-slate-600">Ready to manage books or test database caching?</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('books')}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 text-xs font-bold text-white transition-all shadow-md shadow-indigo-600/20"
          >
            <span>Manage Books</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setActiveTab('demo')}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-700 transition-all"
          >
            <span>Database Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
