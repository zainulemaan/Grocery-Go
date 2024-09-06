const WishList = require('./../models/wishListModel');
const AppError = require('./../utils/appError');
const Product = require('./../models/productModels');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/Usermodels');
const jwt = require('jsonwebtoken');

const JWT_SECRET_KEY = 'my-ultra-secure-and-ultra-long-secret';

exports.createWishList = catchAsync(async (req, res, next) => {
  if (!req.cookies.jwt) {
    return res.status(401).json({
      status: 'fail',
      message: 'JWT token missing',
    });
  }

  // Extract userId from the token payload
  const token = req.cookies.jwt;
  const decoded = jwt.verify(token, JWT_SECRET_KEY);
  const userId = decoded.id;
  const { productId, productQuantity } = req.body;
  if (!productId || !productQuantity) {
    return res.status(400).json({
      status: 'fail',
      message: 'All product details must be provided',
    });
  }
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({
      status: 'fail',
      message: 'Product not found',
    });
  }
  if (product.quantityAvailable < productQuantity) {
    return next(
      new AppError(
        'Not Enogh Stock Avaialable.\nWe Will Let You Know If we Have This Later.\nThanks!',
        400,
      ),
    );
  }

  let wishList = await WishList.findOne({ userId }).populate('items.productId');
  if (!wishList) {
    wishList = new WishList({
      userId,
      items: [],
    });
  }
  const WishListItem = wishList.items.find(
    (item) => item.productId.toString() === productId,
  );
  if (WishListItem) {
    WishListItem.productQuantity += productQuantity;
  } else {
    wishList.items.push({
      productId: product._id,
      productName: product.name,
      productPrice: product.price,
      productPhoto: product.photo,
      productQuantity,
      discountPercentage: product.discountPercentage || 0,
    });
  }
  await wishList.save();
  const populatedWishList = await WishList.findById(wishList._id).populate({
    path: 'items.productId',
    model: 'Product',
    select: 'name price photo discountPercentage',
  });

  res.status(200).json({
    status: 'success',
    data: populatedWishList,
  });
});

exports.getWishList = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const wishList = await WishList.findOne({ userId });
  if (!wishList) {
    return next(new AppError('Wishlist Not Found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: wishList,
  });
});

exports.clearWishList = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  // Find the wishlist for the user
  const wishList = await WishList.findOne({ userId });

  if (!wishList) {
    return next(new AppError('Wishlist Not Found', 404));
  }

  // Clear all items in the wishlist
  wishList.items = [];
  await wishList.save();

  // Send response
  res.status(200).json({
    status: 'success',
    message: 'Wishlist cleared successfully',
  });
});
