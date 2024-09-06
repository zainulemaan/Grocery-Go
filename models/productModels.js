const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A product must have a name'],
    unique: true,
    trim: true,
  },
  brand: {
    type: String,
    required: [true, 'A product must have a brand'],
  },
  price: {
    type: Number,
    required: [true, 'A product must have a price'],
  },
  description: {
    type: String,
    trim: true,
  },
  category: String,
  quantityAvailable: {
    type: Number,
    default: 0,
    validate: {
      validator: function (v) {
        return v >= 1 && v <= 10000;
      },
      message: (props) =>
        `${props.value} is not a valid discount percentage. It must be between 1 and 99.`,
    },
  },
  expiryDate: Date,
  discountPercentage: {
    type: Number,
    default: 0,
    validate: {
      validator: function (v) {
        return v >= 1 && v <= 99;
      },
      message: (props) =>
        `${props.value} is not a valid discount percentage. It must be between 1 and 99.`,
    },
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    validate: {
      validator: function (value) {
        return value <= 5.0;
      },
      message: 'Ratings average cannot exceed 5.0',
    },
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  size: String,
  photo: {
    type: String,
    required: true,
  },
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
