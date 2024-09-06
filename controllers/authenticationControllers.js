const crypto = require('crypto');
const { promisify } = require('util');
const User = require('./../models/Usermodels');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/nodemailer');

const signToken = (id) => {
  // Replace 'your_jwt_secret' and numbers with your actual values
  return jwt.sign({ id }, 'my-ultra-secure-and-ultra-long-secret', {
    expiresIn: '90d', // Replace with your expiration time, e.g., '90d'
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  res.cookie('jwt', token, {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: false, // Set to false if you need to access it via JavaScript
    secure: false, // Replace with your JWT_COOKIE_EXPIRES_IN logic
    // httpOnly: true,
    // secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });
  createSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please Provide Email & Password', 400));
  }

  // Find the user by email
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect Email Or Password', 401));
  }

  // Check the role of the user
  const role = user.role;
  if (role === 'admin') {
    createSendToken(user, 200, req, res);
  } else {
    createSendToken(user, 200, req, res);
  }
});
exports.logout = catchAsync(async (req, res, next) => {
  // Clear the JWT cookie by setting its expiry date to a past date
  res.cookie('jwt', 'loggedOut', {
    expires: new Date(Date.now() - 1000), // Set expiration to one second in the past
    httpOnly: false, // Set to true if you want to restrict access to the cookie via JavaScript
    secure: false, // Set to true if you are using HTTPS
  });

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401),
    );
  }
  try {
    // Verification of Token
    const decoded = await promisify(jwt.verify)(
      token,
      'my-ultra-secure-and-ultra-long-secret',
    );
    console.log(decoded);

    // Check If user still exists
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
      return next(new AppError('The User Does Not Exist Anymore!', 401));
    }
    // Check If User Changed Password
    if (freshUser.ChangedPassword(decoded.iat)) {
      return next(
        new AppError(
          'You had Changed Password.Please Login Again.Thanks!.',
          401,
        ),
      );
    }
    req.user = freshUser;
    res.locals.user = freshUser;
    next();
  } catch (err) {
    return next(new AppError('Invalid token! Please log in again.', 401));
  }
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // Check if user is admin
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'You Do Not Have Permission To Perform This Action.Thanks!',
          403,
        ),
      );
    }
    next();
  };
};
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // Check User by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new AppError(
        'There Is No User Exists With That Email Address.Thanks!',
        404,
      ),
    );
  }
  // Generating Random reset token
  const resetToken = user.resetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // const sendEmail
  const Urlreset = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forget Your Password?Submit A Request With Your New Password and Confirm Password To: ${Urlreset}.\nThanks!`;
  try {
    await sendEmail({
      email: user.email,
      subject:
        'Your Password Reset Token Is Valid For Only 10 mintutes.\nThanks!',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
      token: resetToken,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There Is An Error Sending An Email.\n Try Again Later.\nThanks!',
        500,
      ),
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // Getting the user by token
  const encryptedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: encryptedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // Set new password if the token is not expired & the user is there
  if (!user) {
    return next(new AppError('Token Has Expired', 400));
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;

  await user.save();
  // Log the user in send JWT
  createSendToken(user, 200, req, res);
});
exports.updateUserPassword = catchAsync(async (req, res, next) => {
  // Find The User By Id
  const user = await User.findById(req.user.id).select('+password');
  // Check if the password given by the user is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(
      new AppError('Wrong Password.\nPlease Provide Correct Password', 401),
    );
  }
  // Otherwise Update the password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();
  // Login the User & send Jwt
  const token = jwt.sign(
    { id: user._id },
    'my-ultra-secure-and-ultra-long-secret',
    {
      expiresIn: '90d',
    },
  );
  res.status(200).json({
    status: 'success',
    token,
  });
});
