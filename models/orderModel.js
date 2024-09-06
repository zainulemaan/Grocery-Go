// models/orderModel.js
const mongoose = require('mongoose');

// const pakistanAddressRegex =
//   /^[A-Za-z0-9\s,'-]+,\s[A-Za-z\s]+,\s[A-Za-z\s]+,\s[0-9]{5}$/;
const pakistanAddressRegex =
  /^[A-Za-z0-9\s,'-]+,\s[A-Za-z0-9\s\/-]+,\s[A-Za-z\s]+,\s[0-9]{5}$/;
const pakistanPhoneNumberRegex = /^(\+92|0092)?3[0-9]{9}$/;

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      productName: {
        type: String,
        required: true,
      },
      productPrice: {
        type: Number,
        required: true,
      },
      productQuantity: {
        type: Number,
        required: true,
      },
      discountPercentage: {
        type: Number,
        default: 0,
      },
    },
  ],
  subTotal: {
    type: Number,
    required: true,
    validate: {
      validator: Number.isFinite,
      message: '{VALUE} is not a valid number for subTotal',
    },
  },
  address: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        return pakistanAddressRegex.test(value);
      },
      message:
        'Address is not valid. Please enter a valid address for Pakistan.',
    },
  },
  cancellationReason: {
    type: String,
    default: 'no reason', // Default reason if none is given
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'canceled'], // Define possible statuses
    default: 'pending', // Default status
  },
  phoneNumber: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        return pakistanPhoneNumberRegex.test(value);
      },
      message: 'Phone number is not valid. e.g:+923249754112',
    },
  },

  paymentMethod: {
    type: String,
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
