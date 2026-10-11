import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { Book } from '../models/Book.js';
import { Member } from '../models/Member.js';
import { redis } from '../config/redis.js';

// Sample books with the 5 required fields
const sampleBooks = [
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    category: 'Fiction',
    isbn: '978-0743273565',
    availableCopies: 4,
  },
  {
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    category: 'Fiction',
    isbn: '978-0061120084',
    availableCopies: 3,
  },
  {
    title: '1984',
    author: 'George Orwell',
    category: 'Sci-Fi',
    isbn: '978-0451524935',
    availableCopies: 5,
  },
  {
    title: 'Clean Code',
    author: 'Robert C. Martin',
    category: 'Technology',
    isbn: '978-0132350884',
    availableCopies: 2,
  },
  {
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    category: 'Technology',
    isbn: '978-1449373320',
    availableCopies: 3,
  },
  {
    title: 'Dune',
    author: 'Frank Herbert',
    category: 'Sci-Fi',
    isbn: '978-0441172719',
    availableCopies: 4,
  },
  {
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    category: 'History',
    isbn: '978-0062316097',
    availableCopies: 3,
  },
  {
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    category: 'Fantasy',
    isbn: '978-0547928227',
    availableCopies: 4,
  },
];

// Sample members for the dashboard "Total Members" counter
const sampleMembers = [
  { name: 'Alice Johnson', email: 'alice@example.com' },
  { name: 'Bruce Wayne', email: 'bruce@example.com' },
  { name: 'Diana Prince', email: 'diana@example.com' },
  { name: 'Peter Parker', email: 'peter@example.com' },
  { name: 'Clark Kent', email: 'clark@example.com' },
];

const seed = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/library_management';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB');

    // 1. Drop old collections to clear legacy indexes
    try {
      await mongoose.connection.db.dropCollection('books');
      await mongoose.connection.db.dropCollection('members');
      await mongoose.connection.db.dropCollection('borrowrecords');
    } catch {
      // Collections might not exist, ignore
    }
    console.log('[Seed] Cleared legacy MongoDB collections and indexes');

    // 2. Insert books
    await Book.insertMany(sampleBooks);
    console.log(`[Seed] Inserted ${sampleBooks.length} sample books`);

    // 3. Insert members
    await Member.insertMany(sampleMembers);
    console.log(`[Seed] Inserted ${sampleMembers.length} sample members`);

    // 4. Clear Redis cache
    await redis.flushdb();
    console.log('[Seed] Cleared Redis cache');

    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seed();
