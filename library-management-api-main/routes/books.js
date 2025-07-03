const express = require('express');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validate, validateQuery, bookValidation, searchSchema } = require('../middleware/validation');

const router = express.Router();

// Mock book storage
let books = [
  {
    _id: 'book1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    ISBN: '978-0-7432-7356-5',
    genre: 'Fiction',
    publishedYear: 1925,
    availableQuantity: 3,
    totalQuantity: 5,
    description: 'A classic American novel set in the Jazz Age',
    publisher: 'Scribner',
    language: 'English',
    pageCount: 180
  },
  {
    _id: 'book2',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    ISBN: '978-0-06-112008-4',
    genre: 'Fiction',
    publishedYear: 1960,
    availableQuantity: 2,
    totalQuantity: 4,
    description: 'A gripping tale of racial injustice and childhood innocence',
    publisher: 'J.B. Lippincott & Co.',
    language: 'English',
    pageCount: 281
  },
  {
    _id: 'book3',
    title: 'Introduction to Algorithms',
    author: 'Thomas H. Cormen',
    ISBN: '978-0-262-03384-8',
    genre: 'Technology',
    publishedYear: 2009,
    availableQuantity: 1,
    totalQuantity: 3,
    description: 'Comprehensive introduction to algorithms and data structures',
    publisher: 'MIT Press',
    language: 'English',
    pageCount: 1312
  }
];

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Get all books with pagination and filtering
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of books per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title, author, or description
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Filter by genre
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Filter by author
 *       - in: query
 *         name: available
 *         schema:
 *           type: boolean
 *         description: Filter by availability
 *     responses:
 *       200:
 *         description: Books retrieved successfully
 */
router.get('/', optionalAuth, validateQuery(searchSchema), (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      genre, 
      author, 
      available,
      sortBy = 'title',
      sortOrder = 'asc'
    } = req.query;

    let filteredBooks = [...books];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredBooks = filteredBooks.filter(book =>
        book.title.toLowerCase().includes(searchLower) ||
        book.author.toLowerCase().includes(searchLower) ||
        (book.description && book.description.toLowerCase().includes(searchLower))
      );
    }

    // Genre filter
    if (genre) {
      filteredBooks = filteredBooks.filter(book => 
        book.genre.toLowerCase() === genre.toLowerCase()
      );
    }

    // Author filter
    if (author) {
      filteredBooks = filteredBooks.filter(book =>
        book.author.toLowerCase().includes(author.toLowerCase())
      );
    }

    // Availability filter
    if (available !== undefined) {
      filteredBooks = filteredBooks.filter(book =>
        available ? book.availableQuantity > 0 : book.availableQuantity === 0
      );
    }

    // Sorting
    filteredBooks.sort((a, b) => {
      const aValue = a[sortBy] || '';
      const bValue = b[sortBy] || '';
      
      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBooks = filteredBooks.slice(startIndex, endIndex);

    const totalBooks = filteredBooks.length;
    const totalPages = Math.ceil(totalBooks / limit);

    res.status(200).json({
      success: true,
      data: {
        books: paginatedBooks,
        pagination: {
          currentPage: page,
          totalPages,
          totalBooks,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Get a single book by ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book retrieved successfully
 *       404:
 *         description: Book not found
 */
router.get('/:id', (req, res) => {
  try {
    const book = books.find(b => b._id === req.params.id);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        book
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Add a new book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       201:
 *         description: Book created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Book with ISBN already exists
 */
router.post('/', authenticateToken, validate(bookValidation.create), (req, res) => {
  try {
    // Check if book with ISBN already exists
    const existingBook = books.find(book => book.ISBN === req.body.ISBN);
    if (existingBook) {
      return res.status(409).json({
        success: false,
        message: 'Book with this ISBN already exists'
      });
    }

    const newBook = {
      _id: `book${books.length + 1}`,
      ...req.body,
      availableQuantity: req.body.availableQuantity || req.body.totalQuantity,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    books.push(newBook);

    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: {
        book: newBook
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/books/{id}:
 *   put:
 *     summary: Update a book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       200:
 *         description: Book updated successfully
 *       404:
 *         description: Book not found
 */
router.put('/:id', authenticateToken, validate(bookValidation.update), (req, res) => {
  try {
    const bookIndex = books.findIndex(b => b._id === req.params.id);
    
    if (bookIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Check if ISBN is being updated and if it conflicts with existing books
    if (req.body.ISBN) {
      const existingBook = books.find(book => 
        book.ISBN === req.body.ISBN && book._id !== req.params.id
      );
      if (existingBook) {
        return res.status(409).json({
          success: false,
          message: 'Book with this ISBN already exists'
        });
      }
    }

    const updatedBook = {
      ...books[bookIndex],
      ...req.body,
      updatedAt: new Date()
    };

    books[bookIndex] = updatedBook;

    res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      data: {
        book: updatedBook
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     summary: Delete a book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book deleted successfully
 *       404:
 *         description: Book not found
 */
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const bookIndex = books.findIndex(b => b._id === req.params.id);
    
    if (bookIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    const deletedBook = books.splice(bookIndex, 1)[0];

    res.status(200).json({
      success: true,
      message: 'Book deleted successfully',
      data: {
        book: deletedBook
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/books/{id}/availability:
 *   get:
 *     summary: Check book availability
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book availability status
 *       404:
 *         description: Book not found
 */
router.get('/:id/availability', (req, res) => {
  try {
    const book = books.find(b => b._id === req.params.id);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        bookId: book._id,
        title: book.title,
        isAvailable: book.availableQuantity > 0,
        availableQuantity: book.availableQuantity,
        totalQuantity: book.totalQuantity,
        status: book.availableQuantity > 0 ? 'Available' : 'Not Available'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;