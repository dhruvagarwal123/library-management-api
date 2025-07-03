const Joi = require('joi');

// Book validation schemas
const bookValidation = {
  create: Joi.object({
    title: Joi.string().trim().max(200).required(),
    author: Joi.string().trim().max(100).required(),
    ISBN: Joi.string().trim().pattern(/^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/).required(),
    genre: Joi.string().valid('Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Biography', 'Fantasy', 'Mystery', 'Romance', 'Thriller', 'Educational').required(),
    publishedYear: Joi.number().integer().min(1000).max(new Date().getFullYear()).required(),
    totalQuantity: Joi.number().integer().min(1).required(),
    availableQuantity: Joi.number().integer().min(0).optional(),
    description: Joi.string().max(1000).optional(),
    publisher: Joi.string().max(100).optional(),
    language: Joi.string().max(20).default('English'),
    pageCount: Joi.number().integer().min(1).optional()
  }),
  
  update: Joi.object({
    title: Joi.string().trim().max(200).optional(),
    author: Joi.string().trim().max(100).optional(),
    ISBN: Joi.string().trim().pattern(/^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/).optional(),
    genre: Joi.string().valid('Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Biography', 'Fantasy', 'Mystery', 'Romance', 'Thriller', 'Educational').optional(),
    publishedYear: Joi.number().integer().min(1000).max(new Date().getFullYear()).optional(),
    totalQuantity: Joi.number().integer().min(1).optional(),
    availableQuantity: Joi.number().integer().min(0).optional(),
    description: Joi.string().max(1000).optional(),
    publisher: Joi.string().max(100).optional(),
    language: Joi.string().max(20).optional(),
    pageCount: Joi.number().integer().min(1).optional()
  }).min(1)
};

// User validation schemas
const userValidation = {
  register: Joi.object({
    name: Joi.string().trim().max(50).required(),
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(6).required(),
    membershipType: Joi.string().valid('BASIC', 'PREMIUM', 'STUDENT').default('BASIC'),
    phone: Joi.string().pattern(/^\+?[\d\s-()]+$/).optional(),
    address: Joi.object({
      street: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      zipCode: Joi.string().optional(),
      country: Joi.string().default('USA')
    }).optional()
  }),
  
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),
  
  update: Joi.object({
    name: Joi.string().trim().max(50).optional(),
    phone: Joi.string().pattern(/^\+?[\d\s-()]+$/).optional(),
    address: Joi.object({
      street: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      zipCode: Joi.string().optional(),
      country: Joi.string().optional()
    }).optional()
  }).min(1)
};

// Transaction validation schemas
const transactionValidation = {
  borrow: Joi.object({
    bookId: Joi.string().required(),
    notes: Joi.string().max(500).optional()
  }),
  
  return: Joi.object({
    transactionId: Joi.string().required(),
    condition: Joi.string().valid('EXCELLENT', 'GOOD', 'FAIR', 'POOR').default('GOOD'),
    notes: Joi.string().max(500).optional()
  })
};

// Generic validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    req.body = value;
    next();
  };
};

// Query parameter validation
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Query validation failed',
        errors
      });
    }

    req.query = value;
    next();
  };
};

// Common query schemas
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc')
});

const searchSchema = paginationSchema.keys({
  search: Joi.string().trim().optional(),
  genre: Joi.string().optional(),
  author: Joi.string().optional(),
  available: Joi.boolean().optional()
});

module.exports = {
  validate,
  validateQuery,
  bookValidation,
  userValidation,
  transactionValidation,
  paginationSchema,
  searchSchema
};