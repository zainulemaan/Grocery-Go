const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/Usermodels');
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

  const user = await User.findById(userId).select('name email');

  if (!user) {
    return res.status(404).json({
      status: 'fail',
      message: 'User not found',
    });
  }

  // Send the response with user's name and email
  res.status(200).json({
    status: 'success',
    data: {
      name: user.name,
      email: user.email,
    },
  });
});
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  // SEND RESPONSE\
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
  // next();
});

exports.getUser = catchAsync(async (req, res, next) => {
  const userId = req.params.id; // Ensure the parameter name matches the route
  console.log(`Received userId: ${userId}`);

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({
      status: 'fail',
      message: 'User not found',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};
