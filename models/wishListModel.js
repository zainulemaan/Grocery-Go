const mongoose = require('mongoose');

const WishListSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        refrence: 'Product',
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
      productPhoto: {
        type: String,
        required: true,
      },
      discountPercentage: {
        type: Number,
        default: 0,
      },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
const WishList = mongoose.model('WishList', WishListSchema);
module.exports = WishList;
