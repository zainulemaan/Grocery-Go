const mongoose = require('mongoose');
const Filter = require('bad-words');
const filter = new Filter();

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  review: {
    type: String,
    required: true,
    trim: true,
  },
  rating: {
    type: Number,
    min: 1,   
    max: 5,   
    required: [true, 'Rating is required'],
    validate: {
      validator: function(value) {
        return value >= 1 && value <= 5; 
      },
      message: 'Rating must be between 1 and 5'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook to filter profanity
reviewSchema.pre('save', function(next) {
  if (filter.isProfane(this.review)) {
    const error = new Error('Review contains inappropriate language.');
    return next(error);
  }
  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
