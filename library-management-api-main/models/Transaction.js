const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Book ID is required']
  },
  borrowDate: {
    type: Date,
    required: [true, 'Borrow date is required'],
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  returnDate: {
    type: Date
  },
  status: {
    type: String,
    enum: {
      values: ['BORROWED', 'RETURNED', 'OVERDUE'],
      message: 'Status must be BORROWED, RETURNED, or OVERDUE'
    },
    required: [true, 'Status is required'],
    default: 'BORROWED'
  },
  lateFee: {
    type: Number,
    default: 0,
    min: [0, 'Late fee cannot be negative']
  },
  renewalCount: {
    type: Number,
    default: 0,
    min: [0, 'Renewal count cannot be negative'],
    max: [3, 'Maximum 3 renewals allowed']
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for calculating days overdue
transactionSchema.virtual('daysOverdue').get(function() {
  if (this.status === 'RETURNED' || !this.dueDate) return 0;
  
  const today = new Date();
  const dueDate = new Date(this.dueDate);
  const diffTime = today - dueDate;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
});

// Virtual for checking if overdue
transactionSchema.virtual('isOverdue').get(function() {
  return this.daysOverdue > 0 && this.status === 'BORROWED';
});

// Method to calculate late fee
transactionSchema.methods.calculateLateFee = function() {
  const daysOverdue = this.daysOverdue;
  if (daysOverdue <= 0) return 0;
  
  const baseFee = 0.50; // $0.50 per day
  const maxFee = 25.00; // Maximum $25
  
  return Math.min(daysOverdue * baseFee, maxFee);
};

// Pre-save middleware to update status and calculate late fee
transactionSchema.pre('save', function(next) {
  // Update status if overdue
  if (this.isOverdue && this.status === 'BORROWED') {
    this.status = 'OVERDUE';
  }
  
  // Calculate late fee
  if (this.status === 'OVERDUE' || this.status === 'RETURNED') {
    this.lateFee = this.calculateLateFee();
  }
  
  next();
});

// Method to set due date based on membership type
transactionSchema.methods.setDueDate = function(membershipType) {
  const borrowPeriods = {
    BASIC: 14,      // 2 weeks
    PREMIUM: 30,    // 1 month
    STUDENT: 21     // 3 weeks
  };
  
  const days = borrowPeriods[membershipType] || 14;
  const dueDate = new Date(this.borrowDate);
  dueDate.setDate(dueDate.getDate() + days);
  
  this.dueDate = dueDate;
  return this.dueDate;
};

// Indexing for better performance
transactionSchema.index({ userId: 1 });
transactionSchema.index({ bookId: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ borrowDate: -1 });
transactionSchema.index({ dueDate: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);