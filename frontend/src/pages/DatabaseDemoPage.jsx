import React, { useState, useEffect } from 'react';
import { Database, Zap, RefreshCw, Trash2, CheckCircle2, Clock, Layers } from 'lucide-react';
import { bookApi, systemApi } from '../services/api.js';

export const DatabaseDemoPage = ({ toastMessage }) => {
  const [cacheInfo, setCacheInfo] = useState({ redisConnected: false, keysCount: 0, keys: [] });
  const [benchmarkResult, setBenchmarkResult] = useState(null);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);

  // Load current Redis cache keys
  const fetchCacheInfo = async () => {
    try {
      const res = await systemApi.getCacheInfo();
      if (res.data.success) {
        setCacheInfo(res.data);
      }
    } catch (err) {
      console.error('Failed to load cache info:', err);
    }
  };

  useEffect(() => {
    fetchCacheInfo();
  }, []);

  // Run Cache Benchmark: 1st Query (MISS) vs 2nd Query (HIT)
  const runCacheBenchmark = async () => {
    setIsRunningTest(true);
    setBenchmarkResult(null);

    try {
      // Step A: Invalidate cache first so Query 1 is a clean MISS
      await systemApi.clearCache();

      // Step B: Query 1 (Should be Cache MISS from MongoDB)
      const res1 = await bookApi.getBooks('Clean');

      // Step C: Query 2 (Should be Cache HIT from Redis)
      const res2 = await bookApi.getBooks('Clean');

      setBenchmarkResult({
        query1: {
          source: res1.data.source,
          cached: res1.data.cached,
          responseTimeMs: res1.data.responseTimeMs,
        },
        query2: {
          source: res2.data.source,
          cached: res2.data.cached,
          responseTimeMs: res2.data.responseTimeMs,
        },
        speedup: Math.max(1, Math.round(res1.data.responseTimeMs / Math.max(1, res2.data.responseTimeMs))),
      });

      fetchCacheInfo();
      toastMessage('Cache Benchmark completed successfully!');
    } catch (err) {
      console.error('Benchmark failed:', err);
    } finally {
      setIsRunningTest(false);
    }
  };

  // Clear Redis Cache
  const handleClearCache = async () => {
    setIsClearingCache(true);
    try {
      const res = await systemApi.clearCache();
      toastMessage(res.data.message);
      fetchCacheInfo();
    } catch (err) {
      console.error('Clear cache failed:', err);
    } finally {
      setIsClearingCache(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white">Database Demo & Verification</h1>
        <p className="text-xs text-slate-400">
          Interactive verification of MongoDB permanent CRUD storage and Redis in-memory caching
        </p>
      </div>

      {/* Demo Section 1: Redis Caching Interactive Benchmark */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Zap className="h-4 w-4" />
            <span>Redis Caching Demonstration (Cache HIT vs MISS)</span>
          </div>

          <button
            onClick={runCacheBenchmark}
            disabled={isRunningTest}
            className="flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-amber-600/30 transition-all self-start sm:self-auto disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRunningTest ? 'animate-spin' : ''}`} />
            <span>{isRunningTest ? 'Running Test...' : 'Run Cache Benchmark'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Demonstrates how searching for the same query twice uses Redis in-memory caching to drastically reduce response time.
        </p>

        {/* Benchmark Results */}
        {benchmarkResult && (
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-3">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              Benchmark Output (Search for "Clean"):
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* 1st Query Result */}
              <div className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-3">
                <span className="font-semibold text-amber-300">1st Request (Cache MISS)</span>
                <p className="text-xl font-extrabold text-white font-mono mt-1">
                  {benchmarkResult.query1.responseTimeMs} ms
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Served by: <strong>MongoDB</strong> (and saved to Redis)
                </p>
              </div>

              {/* 2nd Query Result */}
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-3">
                <span className="font-semibold text-emerald-300">2nd Request (Cache HIT)</span>
                <p className="text-xl font-extrabold text-emerald-400 font-mono mt-1">
                  {benchmarkResult.query2.responseTimeMs} ms
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Served by: <strong>Redis RAM</strong>
                </p>
              </div>

              {/* Speedup */}
              <div className="rounded-lg border border-indigo-500/30 bg-indigo-950/20 p-3">
                <span className="font-semibold text-indigo-300">Performance Speedup</span>
                <p className="text-xl font-extrabold text-indigo-200 font-mono mt-1">
                  ~{benchmarkResult.speedup}x Faster
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Immediate RAM lookup without disk query
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Demo Section 2: Active Cache Keys & Invalidation */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
            <Layers className="h-4 w-4" />
            <span>Redis Cache Keys & Invalidation</span>
          </div>

          <button
            onClick={handleClearCache}
            disabled={isClearingCache}
            className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 px-3.5 py-1.5 text-xs font-semibold text-rose-300 transition-all self-start sm:self-auto disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear Redis Cache</span>
          </button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Whenever you <strong>Add</strong>, <strong>Edit</strong>, or <strong>Delete</strong> a book in the Books Management page, the backend automatically calls <code className="text-indigo-300 font-mono">invalidateBooksCache()</code> to purge these keys so users never see outdated data.
        </p>

        {/* Keys List */}
        <div>
          <span className="text-xs font-semibold text-slate-300">
            Currently Cached Keys in Redis ({cacheInfo.keysCount}):
          </span>

          {cacheInfo.keys.length === 0 ? (
            <p className="text-xs text-slate-500 italic mt-1.5">
              No keys currently in cache. Search for any book on the Books Management page to populate the cache!
            </p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {cacheInfo.keys.map((key) => (
                <span
                  key={key}
                  className="rounded-lg bg-slate-950 px-2.5 py-1 font-mono text-xs text-amber-300 border border-slate-800"
                >
                  {key}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Demo Section 3: MongoDB Persistence Explanation */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm space-y-3">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
          <Database className="h-4 w-4" />
          <span>MongoDB Permanent Persistence (Source of Truth)</span>
        </div>

        <ul className="space-y-2 text-xs text-slate-400">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Durable Storage:</strong> All books added or edited are written directly to MongoDB disk storage.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Server Restart Persistence:</strong> You can restart the Node.js backend at any time — all book records remain fully intact upon restart.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Schema Validation:</strong> Mongoose enforces that Title, Author, Category, ISBN, and Available Copies are required, and prevents duplicate ISBNs.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};
