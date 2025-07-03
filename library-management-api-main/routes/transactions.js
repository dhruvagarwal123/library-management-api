const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { validate, validateQuery, transactionValidation, paginationSchema } = require('../middleware/validation');

const router = express.Router();

// Mock data storage
let transactions = [
  {
    _id: 'trans1',
    userId: 'user1',
    bookId: 'book1',
    borrowDate: new Date('2024-01-15'),
    dueDate: new Date('2024-02-14'),
    status: 'BORROWED',
    lateFee: 0,
    renewalCount: 0
  },
  {
    _id: 'trans2',
    userId: 'user2',
    bookId: 'book2',
    borrowDate: new Date('2024-01-10'),
    dueDate: new Date('2024-02-01'),
    returnDate: new Date('2024-01-30'),
    status: 'RETURNED',
    lateFee: 0,
    renewalCount: 1
  }
];

// Mock users and books data
const users = [
  { _id: 'user1', name: 'John Doe', membershipType: 'PREMIUM', borrowedBooks: [] },
  { _id: 'user2', name: 'Jane Smith', membershipType: 'STUDENT', borrowedBooks: [] }
];

const books = [
  { _id: 'book1', title: 'The Great Gatsby', availableQuantity: 3, totalQuantity: 5 },
  { _id: 'book2', title: 'To Kill a Mockingbird', availableQuantity: 2, totalQuantity: 4 },
  { _id: 'book3', title: 'Introduction to Algorithms', availableQuantity: 1, totalQuantity: 3 }
];

/**
 * @swagger
 * /api/transactions/borrow:
 *   post:
 *     summary: Borrow a book
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookId
 *             properties:
 *               bookId:
 *                 type: string
 *                 description: ID of the book to borrow
 *               notes:
 *                 type: string
 *                 description: Optional notes
 *     responses:
 *       201:
 *         description: Book borrowed successfully
 *       400:
 *         description: Book not available or user limit reached
 *       404:
 *         description: Book not found
 */
router.post('/borrow', authenticateToken, validate(transactionValidation.borrow), (req, res) => {
  try {
    const { bookId, notes } = req.body;
    const userId = req.user._id;

    // Find book
    const book = books.find(b => b._id === bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Check book availability
    if (book.availableQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Book is not available for borrowing'
      });
    }

    // Find user
    const user = users.find(u => u._id === userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check borrowing limit
    const borrowingLimit = getBorrowingLimit(user.membershipType);
    const currentBorrowedCount = transactions.filter(t => 
      t.userId === userId && t.status === 'BORROWED'
    ).length;

    if (currentBorrowedCount >= borrowingLimit) {
      return res.status(400).json({
        success: false,
        message: `Borrowing limit reached. ${user.membershipType} members can borrow up to ${borrowingLimit} books.`
      });
    }

    // Check if user already borrowed this book
    const existingTransaction = transactions.find(t => 
      t.userId === userId && t.bookId === bookId && t.status === 'BORROWED'
    );

    if (existingTransaction) {
      return res.status(400).json({
        success: false,
        message: 'You have already borrowed this book'
      });
    }

    // Calculate due date based on membership type
    const borrowDate = new Date();
    const dueDate = calculateDueDate(borrowDate, user.membershipType);

    // Create transaction
    const newTransaction = {
      _id: `trans${transactions.length + 1}`,
      userId,
      bookId,
      borrowDate,
      dueDate,
      status: 'BORROWED',
      lateFee: 0,
      renewalCount: 0,
      notes: notes || '',
      createdAt: new Date()
    };

    transactions.push(newTransaction);

    // Update book availability
    const bookIndex = books.findIndex(b => b._id === bookId);
    books[bookIndex].availableQuantity -= 1;

    res.status(201).json({
      success: true,
      message: 'Book borrowed successfully',
      data: {
        transaction: {
          ...newTransaction,
          book: {
            _id: book._id,
            title: book.title
          },
          user: {
            _id: user._id,
            name: user.name
          }
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
 * /api/transactions/return:
 *   post:
 *     summary: Return a borrowed book
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - transactionId
 *             properties:
 *               transactionId:
 *                 type: string
 *                 description: ID of the transaction to return
 *               condition:
 *                 type: string
 *                 enum: [EXCELLENT, GOOD, FAIR, POOR]
 *                 description: Condition of the returned book
 *               notes:
 *                 type: string
 *                 description: Optional return notes
 *     responses:
 *       200:
 *         description: Book returned successfully
 *       400:
 *         description: Invalid transaction or already returned
 *       404:
 *         description: Transaction not found
 */
router.post('/return', authenticateToken, validate(transactionValidation.return), (req, res) => {
  try {
    const { transactionId, condition = 'GOOD', notes } = req.body;
    const userId = req.user._id;

    // Find transaction
    const transactionIndex = transactions.findIndex(t => t._id === transactionId);
    if (transactionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    const transaction = transactions[transactionIndex];

    // Check if transaction belongs to user
    if (transaction.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This transaction does not belong to you.'
      });
    }

    // Check if book is already returned
    if (transaction.status === 'RETURNED') {
      return res.status(400).json({
        success: false,
        message: 'Book has already been returned'
      });
    }

    // Calculate late fee
    const returnDate = new Date();
    const lateFee = calculateLateFee(transaction.dueDate, returnDate);

    // Update transaction
    const updatedTransaction = {
      ...transaction,
      returnDate,
      status: 'RETURNED',
      lateFee,
      returnCondition: condition,
      returnNotes: notes || '',
      updatedAt: new Date()
    };

    transactions[transactionIndex] = updatedTransaction;

    // Update book availability
    const book = books.find(b => b._id === transaction.bookId);
    if (book) {
      const bookIndex = books.findIndex(b => b._id === transaction.bookId);
      books[bookIndex].availableQuantity += 1;
    }

    res.status(200).json({
      success: true,
      message: 'Book returned successfully',
      data: {
        transaction: {
          ...updatedTransaction,
          book: book ? {
            _id: book._id,
            title: book.title
          } : null,
          daysOverdue: Math.max(0, Math.ceil((returnDate - new Date(transaction.dueDate)) / (1000 * 60 * 60 * 24)))
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
 * /api/transactions:
 *   get:
 *     summary: Get borrowing history with pagination
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
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
 *         description: Number of transactions per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [BORROWED, RETURNED, OVERDUE]
 *         description: Filter by status
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID (admin only)
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 */
router.get('/', authenticateToken, validateQuery(paginationSchema), (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      userId,
      sortBy = 'borrowDate',
      sortOrder = 'desc'
    } = req.query;

    let filteredTransactions = [...transactions];

    // Filter by user (non-admin users can only see their own transactions)
    if (req.user.role !== 'ADMIN') {
      filteredTransactions = filteredTransactions.filter(t => t.userId === req.user._id);
    } else if (userId) {
      filteredTransactions = filteredTransactions.filter(t => t.userId === userId);
    }

    // Status filter
    if (status) {
      filteredTransactions = filteredTransactions.filter(t => t.status === status);
    }

    // Update overdue status
    const now = new Date();
    filteredTransactions = filteredTransactions.map(transaction => {
      if (transaction.status === 'BORROWED' && new Date(transaction.dueDate) < now) {
        return { ...transaction, status: 'OVERDUE' };
      }
      return transaction;
    });

    // Sorting
    filteredTransactions.sort((a, b) => {
      const aValue = new Date(a[sortBy] || a.borrowDate);
      const bValue = new Date(b[sortBy] || b.borrowDate);
      
      if (sortOrder === 'desc') {
        return bValue - aValue;
      }
      return aValue - bValue;
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

    // Enrich with book and user details
    const enrichedTransactions = paginatedTransactions.map(transaction => {
      const book = books.find(b => b._id === transaction.bookId);
      const user = users.find(u => u._id === transaction.userId);
      
      return {
        ...transaction,
        book: book ? {
          _id: book._id,
          title: book.title
        } : null,
        user: user ? {
          _id: user._id,
          name: user.name
        } : null,
        daysOverdue: transaction.status === 'OVERDUE' || transaction.status === 'RETURNED' ? 
          Math.max(0, Math.ceil((new Date(transaction.returnDate || new Date()) - new Date(transaction.dueDate)) / (1000 * 60 * 60 * 24))) : 0
      };
    });

    const totalTransactions = filteredTransactions.length;
    const totalPages = Math.ceil(totalTransactions / limit);

    res.status(200).json({
      success: true,
      data: {
        transactions: enrichedTransactions,
        pagination: {
          currentPage: page,
          totalPages,
          totalTransactions,
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
 * /api/transactions/{id}/renew:
 *   post:
 *     summary: Renew a borrowed book
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Book renewed successfully
 *       400:
 *         description: Cannot renew (max renewals reached or overdue)
 *       404:
 *         description: Transaction not found
 */
router.post('/:id/renew', authenticateToken, (req, res) => {
  try {
    const transactionId = req.params.id;
    const userId = req.user._id;

    // Find transaction
    const transactionIndex = transactions.findIndex(t => t._id === transactionId);
    if (transactionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    const transaction = transactions[transactionIndex];

    // Check if transaction belongs to user
    if (transaction.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This transaction does not belong to you.'
      });
    }

    // Check if book is still borrowed
    if (transaction.status !== 'BORROWED') {
      return res.status(400).json({
        success: false,
        message: 'Can only renew currently borrowed books'
      });
    }

    // Check renewal limit
    if (transaction.renewalCount >= 3) {
      return res.status(400).json({
        success: false,
        message: 'Maximum renewal limit (3) reached'
      });
    }

    // Check if overdue
    const now = new Date();
    if (new Date(transaction.dueDate) < now) {
      return res.status(400).json({
        success: false,
        message: 'Cannot renew overdue books. Please return the book and pay any late fees.'
      });
    }

    // Find user to get membership type
    const user = users.find(u => u._id === userId);
    
    // Calculate new due date
    const newDueDate = calculateDueDate(new Date(transaction.dueDate), user.membershipType);

    // Update transaction
    const updatedTransaction = {
      ...transaction,
      dueDate: newDueDate,
      renewalCount: transaction.renewalCount + 1,
      updatedAt: new Date()
    };

    transactions[transactionIndex] = updatedTransaction;

    res.status(200).json({
      success: true,
      message: 'Book renewed successfully',
      data: {
        transaction: updatedTransaction,
        newDueDate,
        renewalsRemaining: 3 - updatedTransaction.renewalCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Helper functions
function getBorrowingLimit(membershipType) {
  const limits = {
    BASIC: 3,
    PREMIUM: 10,
    STUDENT: 5
  };
  return limits[membershipType] || 3;
}

function calculateDueDate(borrowDate, membershipType) {
  const borrowPeriods = {
    BASIC: 14,      // 2 weeks
    PREMIUM: 30,    // 1 month
    STUDENT: 21     // 3 weeks
  };
  
  const days = borrowPeriods[membershipType] || 14;
  const dueDate = new Date(borrowDate);
  dueDate.setDate(dueDate.getDate() + days);
  
  return dueDate;
}

function calculateLateFee(dueDate, returnDate) {
  const dueDateObj = new Date(dueDate);
  const returnDateObj = new Date(returnDate);
  
  if (returnDateObj <= dueDateObj) return 0;
  
  const daysOverdue = Math.ceil((returnDateObj - dueDateObj) / (1000 * 60 * 60 * 24));
  const baseFee = 0.50; // $0.50 per day
  const maxFee = 25.00; // Maximum $25
  
  return Math.min(daysOverdue * baseFee, maxFee);
}

module.exports = router;