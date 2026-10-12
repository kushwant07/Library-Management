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
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Books Management</h1>
          <p className="text-xs text-slate-500">
            View, add, edit, and search books stored in MongoDB with Redis caching
          </p>
        </div>

        <button
          onClick={() => {
            setBookToEdit(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Book</span>
        </button>
      </div>

      {/* Search Bar & Live Cache Hit/Miss Telemetry */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 space-y-3 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search books by title or author... (demonstrates Redis caching)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Cache Hit / Miss Telemetry Indicator */}
        {cacheMeta && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Request Result:</span>

              {cacheMeta.cached ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                  <Zap className="h-3.5 w-3.5 animate-pulse text-emerald-600" />
                  <span>Redis Cache HIT</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                  <Database className="h-3.5 w-3.5 text-amber-600" />
                  <span>MongoDB Cache MISS</span>
                </span>
              )}

              <span className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                <Clock className="h-3 w-3" />
                {cacheMeta.responseTimeMs} ms
              </span>
            </div>

            <span className="font-mono text-[11px] text-slate-400">
              Key: <span className="text-slate-700">{cacheMeta.cacheKey}</span>
            </span>
          </div>
        )}
      </div>

      {/* Books Table */}
      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500 shadow-sm">
          Loading books...
        </div>
      ) : books.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-sm font-semibold text-slate-700">No books found</p>
          <p className="text-xs text-slate-400 mt-1">Try a different search or click "Add New Book".</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3">Title</th>
                  <th className="px-5 py-3">Author</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3 font-mono">ISBN</th>
                  <th className="px-5 py-3 text-center">Available Copies</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {books.map((book) => (
                  <tr key={book._id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Title */}
                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                      {book.title}
                    </td>

                    {/* Author */}
                    <td className="px-5 py-3.5 text-slate-600">
                      {book.author}
                    </td>

                    {/* Category */}
                    <td className="px-5 py-3.5">
                      <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700 border border-indigo-100">
                        {book.category}
                      </span>
                    </td>

                    {/* ISBN */}
                    <td className="px-5 py-3.5 font-mono text-slate-500 text-[11px]">
                      {book.isbn}
                    </td>

                    {/* Available Copies */}
                    <td className="px-5 py-3.5 text-center font-mono font-bold text-emerald-600">
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
                          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                          title="Edit book"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBook(book)}
                          className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
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
