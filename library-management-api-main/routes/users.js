const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { validate, validateQuery, userValidation, paginationSchema } = require('../middleware/validation');

const router = express.Router();

// Import users from auth route (in production, use database)
let users = [
  {
    _id: 'user1',
    name: 'John Doe',
    email: 'john@library.com',
    membershipType: 'PREMIUM',
    isActive: true,
    borrowedBooks: [],
    phone: '+1-555-123-4567',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    createdAt: new Date('2024-01-15')
  },
  {
    _id: 'user2',
    name: 'Jane Smith',
    email: 'jane@library.com',
    membershipType: 'STUDENT',
    isActive: true,
    borrowedBooks: [],
    phone: '+1-555-987-6543',
    address: {
      street: '456 Oak Ave',
      city: 'Boston',
      state: 'MA',
      zipCode: '02101',
      country: 'USA'
    },
    createdAt: new Date('2024-02-01')
  },
  {
    _id: 'user3',
    name: 'Mike Johnson',
    email: 'mike@library.com',
    membershipType: 'BASIC',
    isActive: true,
    borrowedBooks: [],
    createdAt: new Date('2024-02-10')
  }
];

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
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
 *         description: Number of users per page
 *       - in: query
 *         name: membershipType
 *         schema:
 *           type: string
 *           enum: [BASIC, PREMIUM, STUDENT]
 *         description: Filter by membership type
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticateToken, validateQuery(paginationSchema), (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      membershipType, 
      isActive,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    let filteredUsers = [...users];

    // Membership type filter
    if (membershipType) {
      filteredUsers = filteredUsers.filter(user => 
        user.membershipType === membershipType
      );
    }

    // Active status filter
    if (isActive !== undefined) {
      filteredUsers = filteredUsers.filter(user => 
        user.isActive === isActive
      );
    }

    // Sorting
    filteredUsers.sort((a, b) => {
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
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    // Remove passwords from response
    const sanitizedUsers = paginatedUsers.map(user => {
      const { password, ...userWithoutPassword } = user;
      return {
        ...userWithoutPassword,
        borrowingLimit: getBorrowingLimit(user.membershipType),
        currentBorrowedCount: user.borrowedBooks.length,
        canBorrowMore: user.borrowedBooks.length < getBorrowingLimit(user.membershipType)
      };
    });

    const totalUsers = filteredUsers.length;
    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({
      success: true,
      data: {
        users: sanitizedUsers,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers,
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
 * /api/users/{id}:
 *   get:
 *     summary: Get user profile by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const user = users.find(u => u._id === req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Users can only view their own profile (unless admin)
    if (req.user._id !== user._id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own profile.'
      });
    }

    // Remove password from response
    const { password, ...userResponse } = user;
    
    const userWithStats = {
      ...userResponse,
      borrowingLimit: getBorrowingLimit(user.membershipType),
      currentBorrowedCount: user.borrowedBooks.length,
      canBorrowMore: user.borrowedBooks.length < getBorrowingLimit(user.membershipType)
    };

    res.status(200).json({
      success: true,
      data: {
        user: userWithStats
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
 * /api/users/{id}:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zipCode:
 *                     type: string
 *                   country:
 *                     type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 *       403:
 *         description: Access denied
 */
router.put('/:id', authenticateToken, validate(userValidation.update), (req, res) => {
  try {
    const userIndex = users.findIndex(u => u._id === req.params.id);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Users can only update their own profile (unless admin)
    if (req.user._id !== req.params.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own profile.'
      });
    }

    const updatedUser = {
      ...users[userIndex],
      ...req.body,
      updatedAt: new Date()
    };

    users[userIndex] = updatedUser;

    // Remove password from response
    const { password, ...userResponse } = updatedUser;

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: userResponse
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
 * /api/users/{id}/borrowed-books:
 *   get:
 *     summary: Get user's borrowed books
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Borrowed books retrieved successfully
 *       404:
 *         description: User not found
 *       403:
 *         description: Access denied
 */
router.get('/:id/borrowed-books', authenticateToken, (req, res) => {
  try {
    const user = users.find(u => u._id === req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Users can only view their own borrowed books (unless admin)
    if (req.user._id !== user._id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own borrowed books.'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        borrowedBooks: user.borrowedBooks || [],
        currentBorrowedCount: user.borrowedBooks ? user.borrowedBooks.length : 0,
        borrowingLimit: getBorrowingLimit(user.membershipType),
        canBorrowMore: (user.borrowedBooks ? user.borrowedBooks.length : 0) < getBorrowingLimit(user.membershipType)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Helper function to get borrowing limit
function getBorrowingLimit(membershipType) {
  const limits = {
    BASIC: 3,
    PREMIUM: 10,
    STUDENT: 5
  };
  return limits[membershipType] || 3;
}

module.exports = router;