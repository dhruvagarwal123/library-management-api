const fs = require('fs');
const path = require('path');

// Sample data for seeding
const sampleBooks = [
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
  },
  {
    _id: 'book4',
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    ISBN: '978-0-316-76948-0',
    genre: 'Fiction',
    publishedYear: 1951,
    availableQuantity: 4,
    totalQuantity: 6,
    description: 'A controversial coming-of-age story',
    publisher: 'Little, Brown and Company',
    language: 'English',
    pageCount: 234
  },
  {
    _id: 'book5',
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    ISBN: '978-0-553-10953-5',
    genre: 'Science',
    publishedYear: 1988,
    availableQuantity: 2,
    totalQuantity: 3,
    description: 'A landmark volume in science writing',
    publisher: 'Bantam Books',
    language: 'English',
    pageCount: 256
  }
];

const sampleUsers = [
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
  },
  {
    _id: 'user4',
    name: 'Sarah Wilson',
    email: 'sarah@library.com',
    membershipType: 'PREMIUM',
    isActive: true,
    borrowedBooks: [],
    phone: '+1-555-456-7890',
    createdAt: new Date('2024-01-20')
  },
  {
    _id: 'user5',
    name: 'David Brown',
    email: 'david@library.com',
    membershipType: 'STUDENT',
    isActive: true,
    borrowedBooks: [],
    createdAt: new Date('2024-02-05')
  }
];

const sampleTransactions = [
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
  },
  {
    _id: 'trans3',
    userId: 'user3',
    bookId: 'book3',
    borrowDate: new Date('2024-01-05'),
    dueDate: new Date('2024-01-19'),
    returnDate: new Date('2024-01-25'),
    status: 'RETURNED',
    lateFee: 3.00, // 6 days overdue * $0.50
    renewalCount: 0
  },
  {
    _id: 'trans4',
    userId: 'user1',
    bookId: 'book4',
    borrowDate: new Date('2024-02-01'),
    dueDate: new Date('2024-03-02'),
    status: 'BORROWED',
    lateFee: 0,
    renewalCount: 0
  }
];

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Function to seed data
function seedData() {
  try {
    // Write sample data to JSON files
    fs.writeFileSync(
      path.join(dataDir, 'books.json'), 
      JSON.stringify(sampleBooks, null, 2)
    );
    
    fs.writeFileSync(
      path.join(dataDir, 'users.json'), 
      JSON.stringify(sampleUsers, null, 2)
    );
    
    fs.writeFileSync(
      path.join(dataDir, 'transactions.json'), 
      JSON.stringify(sampleTransactions, null, 2)
    );

    console.log('✅ Sample data seeded successfully!');
    console.log(`📁 Data files created in: ${dataDir}`);
    console.log(`📚 ${sampleBooks.length} books added`);
    console.log(`👥 ${sampleUsers.length} users added`);
    console.log(`📋 ${sampleTransactions.length} transactions added`);
    
    // Display login credentials
    console.log('\n🔐 Test Login Credentials:');
    console.log('Email: john@library.com | Password: password123');
    console.log('Email: jane@library.com | Password: password123');
    
    console.log('\n🚀 You can now start the server with: npm start');
    
  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    process.exit(1);
  }
}

// Create Postman collection
function createPostmanCollection() {
  const postmanCollection = {
    info: {
      name: 'Library Management System API',
      description: 'Complete RESTful API for Library Management System',
      version: '1.0.0'
    },
    auth: {
      type: 'bearer',
      bearer: [
        {
          key: 'token',
          value: '{{auth_token}}',
          type: 'string'
        }
      ]
    },
    variable: [
      {
        key: 'base_url',
        value: 'http://localhost:3000',
        type: 'string'
      },
      {
        key: 'auth_token',
        value: '',
        type: 'string'
      }
    ],
    item: [
      {
        name: 'Authentication',
        item: [
          {
            name: 'Register User',
            request: {
              method: 'POST',
              header: [
                {
                  key: 'Content-Type',
                  value: 'application/json'
                }
              ],
              body: {
                mode: 'raw',
                raw: JSON.stringify({
                  name: 'Test User',
                  email: 'test@library.com',
                  password: 'password123',
                  membershipType: 'BASIC'
                }, null, 2)
              },
              url: {
                raw: '{{base_url}}/api/auth/register',
                host: ['{{base_url}}'],
                path: ['api', 'auth', 'register']
              }
            }
          },
          {
            name: 'Login User',
            event: [
              {
                listen: 'test',
                script: {
                  exec: [
                    'if (pm.response.code === 200) {',
                    '    const response = pm.response.json();',
                    '    pm.collectionVariables.set("auth_token", response.data.token);',
                    '}'
                  ]
                }
              }
            ],
            request: {
              method: 'POST',
              header: [
                {
                  key: 'Content-Type',
                  value: 'application/json'
                }
              ],
              body: {
                mode: 'raw',
                raw: JSON.stringify({
                  email: 'john@library.com',
                  password: 'password123'
                }, null, 2)
              },
              url: {
                raw: '{{base_url}}/api/auth/login',
                host: ['{{base_url}}'],
                path: ['api', 'auth', 'login']
              }
            }
          },
          {
            name: 'Get Profile',
            request: {
              method: 'GET',
              header: [
                {
                  key: 'Authorization',
                  value: 'Bearer {{auth_token}}'
                }
              ],
              url: {
                raw: '{{base_url}}/api/auth/me',
                host: ['{{base_url}}'],
                path: ['api', 'auth', 'me']
              }
            }
          }
        ]
      },
      {
        name: 'Books',
        item: [
          {
            name: 'Get All Books',
            request: {
              method: 'GET',
              url: {
                raw: '{{base_url}}/api/books?page=1&limit=10',
                host: ['{{base_url}}'],
                path: ['api', 'books'],
                query: [
                  {
                    key: 'page',
                    value: '1'
                  },
                  {
                    key: 'limit',
                    value: '10'
                  }
                ]
              }
            }
          },
          {
            name: 'Search Books',
            request: {
              method: 'GET',
              url: {
                raw: '{{base_url}}/api/books?search=gatsby&genre=Fiction',
                host: ['{{base_url}}'],
                path: ['api', 'books'],
                query: [
                  {
                    key: 'search',
                    value: 'gatsby'
                  },
                  {
                    key: 'genre',
                    value: 'Fiction'
                  }
                ]
              }
            }
          },
          {
            name: 'Get Book by ID',
            request: {
              method: 'GET',
              url: {
                raw: '{{base_url}}/api/books/book1',
                host: ['{{base_url}}'],
                path: ['api', 'books', 'book1']
              }
            }
          },
          {
            name: 'Add New Book',
            request: {
              method: 'POST',
              header: [
                {
                  key: 'Content-Type',
                  value: 'application/json'
                },
                {
                  key: 'Authorization',
                  value: 'Bearer {{auth_token}}'
                }
              ],
              body: {
                mode: 'raw',
                raw: JSON.stringify({
                  title: 'New Book Title',
                  author: 'Author Name',
                  ISBN: '978-1-234-56789-0',
                  genre: 'Fiction',
                  publishedYear: 2024,
                  totalQuantity: 5,
                  description: 'A great new book'
                }, null, 2)
              },
              url: {
                raw: '{{base_url}}/api/books',
                host: ['{{base_url}}'],
                path: ['api', 'books']
              }
            }
          },
          {
            name: 'Check Book Availability',
            request: {
              method: 'GET',
              url: {
                raw: '{{base_url}}/api/books/book1/availability',
                host: ['{{base_url}}'],
                path: ['api', 'books', 'book1', 'availability']
              }
            }
          }
        ]
      },
      {
        name: 'Transactions',
        item: [
          {
            name: 'Borrow Book',
            request: {
              method: 'POST',
              header: [
                {
                  key: 'Content-Type',
                  value: 'application/json'
                },
                {
                  key: 'Authorization',
                  value: 'Bearer {{auth_token}}'
                }
              ],
              body: {
                mode: 'raw',
                raw: JSON.stringify({
                  bookId: 'book1',
                  notes: 'Looking forward to reading this!'
                }, null, 2)
              },
              url: {
                raw: '{{base_url}}/api/transactions/borrow',
                host: ['{{base_url}}'],
                path: ['api', 'transactions', 'borrow']
              }
            }
          },
          {
            name: 'Return Book',
            request: {
              method: 'POST',
              header: [
                {
                  key: 'Content-Type',
                  value: 'application/json'
                },
                {
                  key: 'Authorization',
                  value: 'Bearer {{auth_token}}'
                }
              ],
              body: {
                mode: 'raw',
                raw: JSON.stringify({
                  transactionId: 'trans1',
                  condition: 'GOOD',
                  notes: 'Great book!'
                }, null, 2)
              },
              url: {
                raw: '{{base_url}}/api/transactions/return',
                host: ['{{base_url}}'],
                path: ['api', 'transactions', 'return']
              }
            }
          },
          {
            name: 'Get Borrowing History',
            request: {
              method: 'GET',
              header: [
                {
                  key: 'Authorization',
                  value: 'Bearer {{auth_token}}'
                }
              ],
              url: {
                raw: '{{base_url}}/api/transactions?page=1&limit=10',
                host: ['{{base_url}}'],
                path: ['api', 'transactions'],
                query: [
                  {
                    key: 'page',
                    value: '1'
                  },
                  {
                    key: 'limit',
                    value: '10'
                  }
                ]
              }
            }
          },
          {
            name: 'Renew Book',
            request: {
              method: 'POST',
              header: [
                {
                  key: 'Authorization',
                  value: 'Bearer {{auth_token}}'
                }
              ],
              url: {
                raw: '{{base_url}}/api/transactions/trans1/renew',
                host: ['{{base_url}}'],
                path: ['api', 'transactions', 'trans1', 'renew']
              }
            }
          }
        ]
      },
      {
        name: 'Users',
        item: [
          {
            name: 'Get All Users',
            request: {
              method: 'GET',
              header: [
                {
                  key: 'Authorization',
                  value: 'Bearer {{auth_token}}'
                }
              ],
              url: {
                raw: '{{base_url}}/api/users',
                host: ['{{base_url}}'],
                path: ['api', 'users']
              }
            }
          },
          {
            name: 'Get User by ID',
            request: {
              method: 'GET',
              header: [
                {
                  key: 'Authorization',
                  value: 'Bearer {{auth_token}}'
                }
              ],
              url: {
                raw: '{{base_url}}/api/users/user1',
                host: ['{{base_url}}'],
                path: ['api', 'users', 'user1']
              }
            }
          },
          {
            name: 'Get User Borrowed Books',
            request: {
              method: 'GET',
              header: [
                {
                  key: 'Authorization',
                  value: 'Bearer {{auth_token}}'
                }
              ],
              url: {
                raw: '{{base_url}}/api/users/user1/borrowed-books',
                host: ['{{base_url}}'],
                path: ['api', 'users', 'user1', 'borrowed-books']
              }
            }
          }
        ]
      }
    ]
  };

  const collectionPath = path.join(__dirname, '..', 'Library_Management_API.postman_collection.json');
  fs.writeFileSync(collectionPath, JSON.stringify(postmanCollection, null, 2));
  console.log(`📫 Postman collection created: ${collectionPath}`);
}

// Run seeding if called directly
if (require.main === module) {
  console.log('🌱 Seeding sample data...\n');
  seedData();
  createPostmanCollection();
}

module.exports = {
  seedData,
  createPostmanCollection,
  sampleBooks,
  sampleUsers,
  sampleTransactions
};