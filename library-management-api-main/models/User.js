const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid email'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  membershipType: {
    type: String,
    required: [true, 'Membership type is required'],
    enum: {
      values: ['BASIC', 'PREMIUM', 'STUDENT'],
      message: 'Membership type must be BASIC, PREMIUM, or STUDENT'
    },
    default: 'BASIC'
  },
  borrowedBooks: [{
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book'
    },
    borrowDate: {
      type: Date,
      default: Date.now
    },
    dueDate: {
      type: Date,
      required: true
    }
  }],
  membershipDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  phone: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^\+?[\d\s-()]+$/.test(v);
      },
      message: 'Please enter a valid phone number'
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'USA'
    }
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Virtual for borrowing limits based on membership type
userSchema.virtual('borrowingLimit').get(function() {
  const limits = {
    BASIC: 3,
    PREMIUM: 10,
    STUDENT: 5
  };
  return limits[this.membershipType] || 3;
});

// Virtual for current borrowed count
userSchema.virtual('currentBorrowedCount').get(function() {
  return this.borrowedBooks ? this.borrowedBooks.length : 0;
});

// Virtual for checking if user can borrow more books
userSchema.virtual('canBorrowMore').get(function() {
  return this.currentBorrowedCount < this.borrowingLimit;
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Indexing for better performance
userSchema.index({ email: 1 });
userSchema.index({ membershipType: 1 });
userSchema.index({ 'borrowedBooks.bookId': 1 });

module.exports = mongoose.model('User', userSchema);