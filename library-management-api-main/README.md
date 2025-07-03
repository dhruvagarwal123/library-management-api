# Library Management System API

A comprehensive RESTful API for managing library operations including books, users, and transactions. Built with Node.js, Express.js with JWT authentication.

## 🚀 Features

### Core Functionality
- **Book Management**: CRUD operations for books with search and filtering
- **User Management**: User registration, authentication, and profile management
- **Transaction System**: Book borrowing, returning, and renewal with late fee calculation
- **Authentication**: JWT-based authentication and authorization
- **Data Validation**: Comprehensive input validation using Joi
- **Security**: Rate limiting, CORS, helmet security headers

### Advanced Features
- **Search & Filter**: Advanced search by title, author, genre with pagination
- **Book Availability**: Real-time availability checking
- **Late Fee Calculation**: Automatic calculation based on overdue days
- **Renewal System**: Book renewal with limits (max 3 renewals)
- **Membership Types**: Different borrowing limits and periods for BASIC, PREMIUM, STUDENT
- **API Documentation**: Interactive Swagger/OpenAPI documentation

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:3000/api-docs`
- **Health Check**: `http://localhost:3000/health`

## 🛠 Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Authentication**: JSON Web Tokens (JWT)
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting
- **Documentation**: Swagger/OpenAPI
- **Testing**: Postman Collection included

## 📁 Project Structure

```
library-management-api/
├── app.js                     # Main application file
├── package.json              # Dependencies and scripts
├── README.md                 # Project documentation
├── config/
│   ├── database.js           # Database configuration (simulated)
│   └── swagger.js            # Swagger/OpenAPI configuration
├── models/
│   ├── Book.js              # Book data model
│   ├── User.js              # User data model
│   └── Transaction.js       # Transaction data model
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── books.js             # Book management routes
│   ├── users.js             # User management routes
│   └── transactions.js      # Transaction routes
├── middleware/
│   ├── auth.js              # JWT authentication middleware
│   └── validation.js        # Request validation schemas
├── data/
│   ├── books.json           # Sample book data
│   ├── users.json           # Sample user data
│   └── transactions.json    # Sample transaction data
└── utils/
    └── seedData.js          # Sample data seeding utility
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables** (Optional)
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRES_IN=7d
   NODE_ENV=development
   ```

3. **Seed Sample Data**
   ```bash
   npm run seed
   ```

4. **Start the Server**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

## 🔐 Authentication

### Register a New User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@library.com",
  "password": "password123",
  "membershipType": "PREMIUM"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@library.com",
  "password": "password123"
}
```

### Test Credentials
- **Email**: `john@library.com` | **Password**: `password123`
- **Email**: `jane@library.com` | **Password**: `password123`

## 📖 API Endpoints

### Books
- `GET /api/books` - Get all books (with pagination & filtering)
- `GET /api/books/:id` - Get single book
- `POST /api/books` - Add new book (requires authentication)
- `PUT /api/books/:id` - Update book (requires authentication)
- `DELETE /api/books/:id` - Delete book (requires authentication)
- `GET /api/books/:id/availability` - Check book availability

### Users
- `GET /api/users` - Get all users (requires authentication)
- `GET /api/users/:id` - Get user profile (requires authentication)
- `PUT /api/users/:id` - Update user profile (requires authentication)
- `GET /api/users/:id/borrowed-books` - Get user's borrowed books

### Transactions
- `POST /api/transactions/borrow` - Borrow a book (requires authentication)
- `POST /api/transactions/return` - Return a book (requires authentication)
- `GET /api/transactions` - Get borrowing history (requires authentication)
- `POST /api/transactions/:id/renew` - Renew a borrowed book (requires authentication)

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile (requires authentication)

## 📊 Data Models

### Book Model
```javascript
{
  title: String (required),
  author: String (required),
  ISBN: String (required, unique),
  genre: String (required),
  publishedYear: Number (required),
  availableQuantity: Number,
  totalQuantity: Number (required),
  description: String,
  publisher: String,
  language: String,
  pageCount: Number
}
```

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  membershipType: String (BASIC|PREMIUM|STUDENT),
  borrowedBooks: [ObjectId],
  isActive: Boolean,
  phone: String,
  address: Object
}
```

### Transaction Model
```javascript
{
  userId: ObjectId (required),
  bookId: ObjectId (required),
  borrowDate: Date (required),
  dueDate: Date (required),
  returnDate: Date,
  status: String (BORROWED|RETURNED|OVERDUE),
  lateFee: Number,
  renewalCount: Number
}
```

## 🔍 Search & Filter Examples

### Search Books
```bash
GET /api/books?search=gatsby&genre=Fiction&available=true&page=1&limit=10
```

### Filter Users
```bash
GET /api/users?membershipType=PREMIUM&isActive=true&page=1&limit=10
```

### Filter Transactions
```bash
GET /api/transactions?status=BORROWED&page=1&limit=10
```

## 💰 Membership Types & Limits

| Membership | Borrowing Limit | Borrowing Period | Features |
|------------|----------------|------------------|----------|
| **BASIC** | 3 books | 14 days | Standard borrowing |
| **PREMIUM** | 10 books | 30 days | Extended period, higher limit |
| **STUDENT** | 5 books | 21 days | Student discount rates |

## 💳 Late Fee System

- **Rate**: $0.50 per day overdue
- **Maximum Fee**: $25.00 per book
- **Calculation**: Automatic when returning books
- **Renewal**: Cannot renew overdue books

## 🧪 Testing with Postman

1. **Import Collection**: Use the generated `Library_Management_API.postman_collection.json`
2. **Set Variables**: 
   - `base_url`: `http://localhost:3000`
   - `auth_token`: Will be set automatically after login
3. **Test Flow**:
   - Register/Login to get authentication token
   - Browse books and check availability
   - Borrow books and manage transactions
   - Test user management features

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt with salt rounds
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Comprehensive validation using Joi
- **Security Headers**: Helmet.js for security headers
- **CORS**: Configurable Cross-Origin Resource Sharing

## 📝 Development Notes

- **Data Storage**: Currently using in-memory storage with JSON files for demo purposes
- **File Organization**: Modular architecture with separated concerns
- **Error Handling**: Comprehensive error handling with proper HTTP status codes
- **Logging**: Morgan middleware for HTTP request logging
- **Validation**: Joi schemas for robust input validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a Pull Request

## 📞 Support

For support or questions:
- Open an issue on GitHub
- Documentation: `http://localhost:3000/api-docs`

---
Output:
![image](https://github.com/user-attachments/assets/0ae04ce3-2dc9-436a-bc46-0fa6d98cf0ba)
![image](https://github.com/user-attachments/assets/7c54af7e-a5bc-44a0-ac50-15e471bc2c28)
![image](https://github.com/user-attachments/assets/1ec29578-ba86-4e2c-bb7f-5f8a8c402171)


**Built with ❤️ for efficient library management**
