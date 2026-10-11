import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 5000,
});

export const bookApi = {
  // Fetch books with optional search query (returns { source, cached, responseTimeMs, books })
  getBooks: (search = '') => api.get('/books', { params: { search } }),
  // Create a new book
  createBook: (data) => api.post('/books', data),
  // Update an existing book
  updateBook: (id, data) => api.put(`/books/${id}`, data),
  // Delete a book
  deleteBook: (id) => api.delete(`/books/${id}`),
};

export const systemApi = {
  // Get dashboard statistics (totalBooks, availableCopies, totalMembers, redisConnected)
  getDashboardStats: () => api.get('/system/dashboard-stats'),
  // Get Redis cache status and active keys for demo
  getCacheInfo: () => api.get('/system/cache-info'),
  // Clear Redis cache on demand
  clearCache: () => api.post('/system/clear-cache'),
};

export default api;
