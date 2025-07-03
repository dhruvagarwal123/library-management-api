const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  author: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true,
    maxlength: [100, 'Author name cannot be more than 100 characters']
  },
  ISBN: {
    type: String,
    required: [true, 'ISBN is required'],
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/.test(v);
      },
      message: 'Please enter a valid ISBN'
    }
  },
  genre: {
    type: String,
    required: [true, 'Genre is required'],
    enum: {
      values: ['Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Biography', 'Fantasy', 'Mystery', 'Romance', 'Thriller', 'Educational'],
      message: 'Genre must be one of the predefined categories'
    }
  },
  publishedYear: {
    type: Number,
    required: [true, 'Published year is required'],
    min: [1000, 'Published year must be after 1000'],
    max: [new Date().getFullYear(), 'Published year cannot be in the future']
  },
  availableQuantity: {
    type: Number,
    default: 0,
    min: [0, 'Available quantity cannot be negative']
  },
  totalQuantity: {
    type: Number,
    required: [true, 'Total quantity is required'],
    min: [1, 'Total quantity must be at least 1']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  publisher: {
    type: String,
    maxlength: [100, 'Publisher name cannot be more than 100 characters']
  },
  language: {
    type: String,
    default: 'English',
    maxlength: [20, 'Language cannot be more than 20 characters']
  },
  pageCount: {
    type: Number,
    min: [1, 'Page count must be at least 1']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for checking if book is available
bookSchema.virtual('isAvailable').get(function() {
  return this.availableQuantity > 0;
});

// Pre-save middleware to set availableQuantity
bookSchema.pre('save', function(next) {
  if (this.isNew && this.availableQuantity === 0) {
    this.availableQuantity = this.totalQuantity;
  }
  next();
});

// Indexing for better search performance
bookSchema.index({ title: 'text', author: 'text', genre: 'text' });
bookSchema.index({ ISBN: 1 });
bookSchema.index({ genre: 1 });
bookSchema.index({ author: 1 });

module.exports = mongoose.model('Book', bookSchema);