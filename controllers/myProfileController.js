const Profile = require('../models/myProfileModels');
const User = require('./../models/Usermodels');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const jwt = require('jsonwebtoken');


const JWT_SECRET_KEY = 'my-ultra-secure-and-ultra-long-secret';
exports.getProfile = catchAsync(async (req, res, next) => {
  // Check if JWT token is present in cookies
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

  // Find the profile by userId and populate the user details
  const profile = await Profile.findOne({ userId })
    .populate({
      path: 'userId',
      select: 'name email', // Select fields to retrieve from the User model
    })
    .exec();

  if (!profile) {
    return res.status(404).json({ message: 'Profile not found' });
  }

  // Respond with the profile data including user details
  res.status(200).json({
    status: 'success',
    data: {
      profile,
    },
  });
});
