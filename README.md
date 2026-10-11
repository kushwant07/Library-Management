# 📚 Library Management System
### Student Project: Polyglot Persistence with MongoDB & Redis

A simple, full-stack Library Management System demonstrating **MongoDB** for permanent storage and **Redis** for in-memory caching.

---

## 🌟 Architecture & Database Roles

| Database | Role | Purpose in Project |
|---|---|---|
| **MongoDB** | **Permanent Storage (Source of Truth)** | Stores book records permanently on disk. Changes persist even after restarting the backend server. |
| **Redis** | **In-Memory Cache (Performance)** | Caches book lists and search results in RAM (1–5ms response time). Automatically invalidates when any book is added, edited, or deleted. |

---

## 📄 Application Pages (3 Pages Only)

1. **Dashboard**: Shows 3 key statistics:
   - **Total Books**
   - **Available Copies**
   - **Total Members**
   - Live MongoDB and Redis connection indicators.
2. **Books Management**: A single page to:
   - View all books in a table.
   - Search books by title or author.
   - See whether a request is a **Redis Cache HIT** or **MongoDB Cache MISS** with measured response time.
   - Add a new book using a simple modal form.
   - Edit an existing book.
   - Delete a book with a confirmation dialog.
3. **Database Demo**: A dedicated demonstration page for evaluation:
   - Run a live Cache Benchmark test (shows Query 1 as a MongoDB MISS, Query 2 as a Redis HIT, and the speedup factor).
   - View currently cached keys in Redis.
   - Clear the Redis cache with one click to demonstrate cache invalidation.

---

## 📋 Book Data Model (5 Fields)

Each book record contains only these 5 essential fields:
- **Title** (String, required)
- **Author** (String, required)
- **Category** (String, required)
- **ISBN** (String, required, unique)
- **Available Copies** (Number, required, min: 0)

---

## 🚀 How to Run the Application

### 1. Start MongoDB and Redis Services (macOS)
```bash
brew services start mongodb-community@8.0
brew services start redis
```

### 2. (Optional) Seed Sample Data
From the project root:
```bash
npm run seed
```
This loads 8 sample books and clears existing Redis keys.

### 3. Start Both Backend & Frontend (Single Command)
From the project root:
```bash
npm run dev
```

- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **Backend REST API**: [http://localhost:5001](http://localhost:5001)

### 4. Stop the Application
In your terminal, simply press **`Ctrl + C`**.

---

## 🎯 How to Demonstrate in a Viva / Evaluation

Follow this simple 4-step demonstration:

1. **Add a Book**:
   - Go to **Books Management** → Click **"Add New Book"**.
   - Enter Title, Author, Category, ISBN, and Available Copies.
   - Click **Save**. The book appears in the table, and the Redis cache is invalidated.
2. **Demonstrate Redis Caching (Hit vs. Miss)**:
   - In the search bar, type `"Clean"`.
   - The first request triggers: **`🐢 MongoDB Cache MISS (~30–50ms)`** (fetched from disk and cached).
   - Clear the search and type `"Clean"` again:
   - The second request triggers: **`⚡ Redis Cache HIT (~1–3ms)`** (served directly from RAM).
3. **Demonstrate Cache Invalidation**:
   - Edit or delete the book.
   - Notice how the backend automatically deletes the cached keys in Redis.
   - Searching again will trigger a **Cache MISS** to fetch the updated data from MongoDB.
4. **Demonstrate MongoDB Persistence**:
   - Stop the backend server in the terminal (`Ctrl + C`).
   - Start it again (`npm run dev`).
   - Notice that all books are still in the table! They were permanently saved to MongoDB.

---

## 📡 REST API Endpoints

- `GET /api/books`: Fetch all books or search (`?search=query`). Checks Redis cache first.
- `GET /api/books/:id`: Fetch a single book by ID.
- `POST /api/books`: Add a new book to MongoDB & invalidate Redis cache.
- `PUT /api/books/:id`: Update book in MongoDB & invalidate Redis cache.
- `DELETE /api/books/:id`: Delete book from MongoDB & invalidate Redis cache.
- `GET /api/system/dashboard-stats`: Returns book counters, member counters, and database connection statuses.
- `GET /api/system/cache-info`: Lists current keys stored in Redis.
- `POST /api/system/clear-cache`: Clears Redis cache on demand for demonstration.
# Library-Management
