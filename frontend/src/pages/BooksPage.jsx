import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Zap, Database, Clock, RefreshCw } from 'lucide-react';
import { bookApi } from '../services/api.js';
import { BookModal } from '../components/BookModal.jsx';

export const BooksPage = ({ onDataChange, toastMessage }) => {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cacheMeta, setCacheMeta] = useState(null); // { source, cached, responseTimeMs, cacheKey }

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState(null);

  // Fetch books with caching telemetry
  const fetchBooks = async (query = searchQuery) => {
    setIsLoading(true);
    try {
      const res = await bookApi.getBooks(query);
      if (res.data.success) {
        setBooks(res.data.books);
        setCacheMeta({
          source: res.data.source,
          cached: res.data.cached,
          responseTimeMs: res.data.responseTimeMs,
          cacheKey: res.data.cacheKey,
        });
      }
    } catch (err) {
      console.error('Failed to load books:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchBooks(searchQuery);
    }, 250);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  // Delete Book with Confirmation Dialog
  const handleDeleteBook = async (book) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${book.title}"?\n\nThis will remove it permanently from MongoDB and invalidate the Redis cache.`
    );

    if (confirmed) {
      try {
        await bookApi.deleteBook(book._id);
        toastMessage(`Deleted "${book.title}". Redis cache automatically invalidated.`);
        fetchBooks(searchQuery);
        if (onDataChange) onDataChange();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete book');
      }
    }
  };

  const handleModalSuccess = (msg) => {
    toastMessage(msg);
    fetchBooks(searchQuery);
    if (onDataChange) onDataChange();
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Books Management</h1>
          <p className="text-xs text-slate-400">
            View, add, edit, and search books stored in MongoDB with Redis caching
          </p>
        </div>

        <button
          onClick={() => {
            setBookToEdit(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Book</span>
        </button>
      </div>

      {/* Search Bar & Live Cache Hit/Miss Telemetry */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-3.5 space-y-3 backdrop-blur-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search books by title or author... (demonstrates Redis caching)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
            >
              Clear
            </button>
          )}
        </div>

        {/* Cache Hit / Miss Telemetry Indicator */}
        {cacheMeta && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pt-2.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Request Result:</span>

              {cacheMeta.cached ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
                  <Zap className="h-3.5 w-3.5 animate-pulse" />
                  <span>Redis Cache HIT</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-400">
                  <Database className="h-3.5 w-3.5" />
                  <span>MongoDB Cache MISS</span>
                </span>
              )}

              <span className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                <Clock className="h-3 w-3" />
                {cacheMeta.responseTimeMs} ms
              </span>
            </div>

            <span className="font-mono text-[11px] text-slate-500">
              Key: <span className="text-slate-400">{cacheMeta.cacheKey}</span>
            </span>
          </div>
        )}
      </div>

      {/* Books Table */}
      {isLoading ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-8 text-center text-xs text-slate-400">
          Loading books...
        </div>
      ) : books.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-10 text-center">
          <p className="text-sm font-semibold text-slate-300">No books found</p>
          <p className="text-xs text-slate-500 mt-1">Try a different search or click "Add New Book".</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3">Title</th>
                  <th className="px-5 py-3">Author</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3 font-mono">ISBN</th>
                  <th className="px-5 py-3 text-center">Available Copies</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {books.map((book) => (
                  <tr key={book._id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Title */}
                    <td className="px-5 py-3.5 font-semibold text-slate-100">
                      {book.title}
                    </td>

                    {/* Author */}
                    <td className="px-5 py-3.5 text-slate-300">
                      {book.author}
                    </td>

                    {/* Category */}
                    <td className="px-5 py-3.5">
                      <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-indigo-300 border border-slate-700/60">
                        {book.category}
                      </span>
                    </td>

                    {/* ISBN */}
                    <td className="px-5 py-3.5 font-mono text-slate-400 text-[11px]">
                      {book.isbn}
                    </td>

                    {/* Available Copies */}
                    <td className="px-5 py-3.5 text-center font-mono font-bold text-emerald-400">
                      {book.availableCopies}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setBookToEdit(book);
                            setIsModalOpen(true);
                          }}
                          className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-indigo-300 transition-colors"
                          title="Edit book"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBook(book)}
                          className="rounded-lg p-1 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                          title="Delete book"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for Adding and Editing Books */}
      <BookModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setBookToEdit(null);
        }}
        bookToEdit={bookToEdit}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};
