const mongoose = require('mongoose');
const Review = require('./../models/reviewsmodels');
const Product = require('./../models/productModels');
const User = require('./../models/Usermodels');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Filter = require('bad-words');
const Order = require('./../models/orderModel');
const jwt = require('jsonwebtoken');

const filter = new Filter();
// Creating Reviews
const JWT_SECRET_KEY = 'my-ultra-secure-and-ultra-long-secret';
exports.createReview = catchAsync(async (req, res, next) => {
  if (!req.cookies.jwt) {
    return res.status(401).json({
      status: 'fail',
      message: 'JWT token missing',
    });
  }

  const token = req.cookies.jwt;
  const decoded = jwt.verify(token, JWT_SECRET_KEY);
  const userId = decoded.id;

  // Check if the user has completed orders
  const completedOrders = await Order.find({ userId, status: 'completed' });
  if (!completedOrders.length === 0) {
    return res.status(403).json({
      status: 'fail',
      message: 'You must have completed orders to leave a review.',
    });
  }

  // Check the number of reviews the user has already submitted
  const existingReviews = await Review.find({ userId });
  if (existingReviews.length >= completedOrders.length) {
    return res.status(403).json({
      status: 'fail',
      message:
        'You have already submitted the maximum number of reviews allowed.',
    });
  }

  const { review, rating } = req.body;

  const newReview = await Review.create({
    userId,
    review,
    rating,
  });

  res.status(201).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});
// Getting All Reviews
exports.getAllReveiws = catchAsync(async (req, res, next) => {
  const reviews = await Review.find().populate({
    path: 'userId',
    select: 'name', // Select only the name field
  });

  if (reviews.length === 0) {
    return res.status(404).json({
      status: 'fail',
      message: 'No reviews found.',
    });
  }

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

// Getting One Review Based On Review ID
exports.getReview = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid review ID', 400));
  }

  const review = await Review.findById(id);

  if (!review) {
    return next(
      new AppError('There Is No Review Based On This ID.\nThanks!', 404),
    );
  }

  res.status(200).json({
    status: 'succes',
    data: {
      review,
    },
  });
});

// Getting Reviews By Users
exports.getReviewsByUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return next(new AppError('Invalid user ID', 400));
  }

  const reviews = await Review.find({ user: userId });
  if (reviews.length === 0) {
    return next(new AppError('No reviews found for this user', 404));
  }

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});
exports.getReviewsByProduct = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return next(new AppError('Inavlid product ID', 400));
  }
  const reviews = await Review.find({ product: productId });
  if (reviews.length === 0) {
    return next(new AppError('No reviews found for this user', 404));
  }

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

// Deleting Review
exports.deleteReview = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid review ID', 400));
  }

  const review = await Review.findByIdAndDelete(id);

  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }
  res.status(204).send();
  // res.status(204).json({
  //   status: 'success',
  //   data: null,
  // });
});
