import { Book } from '../models/Book.js';
import {
  buildCacheKey,
  getCachedData,
  setCachedData,
  invalidateBooksCache,
} from '../services/cacheService.js';

/**
 * 1. READ / SEARCH BOOKS
 * Checks Redis cache first. If cache miss, queries MongoDB and stores in Redis.
 */
export const getBooks = async (req, res, next) => {
  const startTime = Date.now();

  try {
    const search = req.query.search || '';
    const cacheKey = buildCacheKey(search);

    // Step 1: Check Redis Cache
    const cachedBooks = await getCachedData(cacheKey);
    if (cachedBooks) {
      const responseTimeMs = Date.now() - startTime;
      return res.status(200).json({
        success: true,
        source: 'redis',
        cached: true,
        responseTimeMs,
        cacheKey,
        books: cachedBooks,
      });
    }

    // Step 2: Cache Miss -> Query MongoDB (Source of Truth)
    const filter = {};
    if (search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ title: regex }, { author: regex }];
    }

    const books = await Book.find(filter).sort({ createdAt: -1 }).lean();

    // Step 3: Save to Redis Cache (TTL = 120 seconds)
    await setCachedData(cacheKey, books, 120);

    const responseTimeMs = Date.now() - startTime;
    return res.status(200).json({
      success: true,
      source: 'mongodb',
      cached: false,
      responseTimeMs,
      cacheKey,
      books,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 2. GET SINGLE BOOK BY ID
 */
export const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    return res.status(200).json({ success: true, book });
  } catch (err) {
    next(err);
  }
};

/**
 * 3. CREATE A NEW BOOK
 * Saves to MongoDB and invalidates Redis cache so list queries stay fresh.
 */
export const createBook = async (req, res, next) => {
  try {
    const { title, author, category, isbn, availableCopies } = req.body;

    // Validate required fields
    if (!title || !author || !category || !isbn || availableCopies === undefined) {
      return res.status(400).json({
        success: false,
        message: 'All fields (title, author, category, isbn, availableCopies) are required',
      });
    }

    // Check duplicate ISBN
    const existingBook = await Book.findOne({ isbn: isbn.trim() });
    if (existingBook) {
      return res.status(400).json({
        success: false,
        message: `A book with ISBN "${isbn}" already exists in the database.`,
      });
    }

    // Save to MongoDB
    const newBook = await Book.create({
      title: title.trim(),
      author: author.trim(),
      category: category.trim(),
      isbn: isbn.trim(),
      availableCopies: parseInt(availableCopies, 10),
    });

    // Invalidate Redis cache
    await invalidateBooksCache();

    return res.status(201).json({
      success: true,
      message: 'Book added to MongoDB and Redis cache invalidated!',
      book: newBook,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 4. UPDATE A BOOK
 * Updates MongoDB and invalidates Redis cache.
 */
export const updateBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, author, category, isbn, availableCopies } = req.body;

    // Check if updating ISBN to one that belongs to another book
    if (isbn) {
      const duplicate = await Book.findOne({ isbn: isbn.trim(), _id: { $ne: id } });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `ISBN "${isbn}" is already used by another book.`,
        });
      }
    }

    const updatedBook = await Book.findByIdAndUpdate(
      id,
      {
        title: title?.trim(),
        author: author?.trim(),
        category: category?.trim(),
        isbn: isbn?.trim(),
        availableCopies: availableCopies !== undefined ? parseInt(availableCopies, 10) : undefined,
      },
      { new: true, runValidators: true }
    );

    if (!updatedBook) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // Invalidate Redis cache
    await invalidateBooksCache();

    return res.status(200).json({
      success: true,
      message: 'Book updated in MongoDB and Redis cache invalidated!',
      book: updatedBook,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 5. DELETE A BOOK
 * Deletes from MongoDB and invalidates Redis cache.
 */
export const deleteBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedBook = await Book.findByIdAndDelete(id);

    if (!deletedBook) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // Invalidate Redis cache
    await invalidateBooksCache();

    return res.status(200).json({
      success: true,
      message: `"${deletedBook.title}" deleted from MongoDB and Redis cache invalidated!`,
    });
  } catch (err) {
    next(err);
  }
};
