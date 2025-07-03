const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Library Management System API',
      version: '1.0.0',
      description: 'A comprehensive RESTful API for managing library operations including books, users, and transactions',
      contact: {
        name: 'Library Management API',
        email: 'admin@library.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Book: {
          type: 'object',
          required: ['title', 'author', 'ISBN', 'genre', 'publishedYear', 'totalQuantity'],
          properties: {
            id: {
              type: 'string',
              description: 'Book ID'
            },
            title: {
              type: 'string',
              description: 'Book title'
            },
            author: {
              type: 'string',
              description: 'Book author'
            },
            ISBN: {
              type: 'string',
              description: 'International Standard Book Number'
            },
            genre: {
              type: 'string',
              description: 'Book genre'
            },
            publishedYear: {
              type: 'integer',
              description: 'Year of publication'
            },
            availableQuantity: {
              type: 'integer',
              description: 'Available copies',
              default: 0
            },
            totalQuantity: {
              type: 'integer',
              description: 'Total copies'
            }
          }
        },
        User: {
          type: 'object',
          required: ['name', 'email', 'membershipType'],
          properties: {
            id: {
              type: 'string',
              description: 'User ID'
            },
            name: {
              type: 'string',
              description: 'User full name'
            },
            email: {
              type: 'string',
              description: 'User email address'
            },
            membershipType: {
              type: 'string',
              enum: ['BASIC', 'PREMIUM', 'STUDENT'],
              description: 'Membership type'
            },
            borrowedBooks: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Array of borrowed book IDs'
            }
          }
        },
        Transaction: {
          type: 'object',
          required: ['userId', 'bookId', 'borrowDate', 'status'],
          properties: {
            id: {
              type: 'string',
              description: 'Transaction ID'
            },
            userId: {
              type: 'string',
              description: 'User ID'
            },
            bookId: {
              type: 'string',
              description: 'Book ID'
            },
            borrowDate: {
              type: 'string',
              format: 'date',
              description: 'Date when book was borrowed'
            },
            returnDate: {
              type: 'string',
              format: 'date',
              description: 'Date when book was returned'
            },
            status: {
              type: 'string',
              enum: ['BORROWED', 'RETURNED', 'OVERDUE'],
              description: 'Transaction status'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js']
};

module.exports = swaggerOptions;