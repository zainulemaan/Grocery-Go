const { promisify } = require('util');
const Rider = require('./../models/riderModels');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const sendEmail = require('./../utils/nodemailer');
let riderCount = 0;
exports.signuprider = catchAsync(async (req, res, next) => {
  if (riderCount < 15) {
    const newRider = await Rider.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      vehicleNumber: req.body.vehicleNumber,
      vehicleType: req.body.vehicleType,
      phoneNumber: req.body.phoneNumber,
      gender: req.body.gender,
      dateOfBirth: req.body.dateOfBirth,
      emergencyContact: req.body.emergencyContact,
    });
    riderCount++;
    // console.log(newRider);

    const token = jwt.sign(
      { id: newRider._id },
      'my-ultra-secure-my-ultra-specific-radar-key',
      {
        expiresIn: '10d',
      },
    );
    res.status(201).json({
      status: 'success',
      token,
      data: {
        rider: newRider,
      },
    });
  } else {
    res.status(403).json({
      status: 'fail',
      message:
        'Rider signup limit reached. Cannot accept more signups at the moment.',
    });
  }
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Plz Provide Email & Password', 400));
  }
  const rider = await Rider.findOne({ email }).select('+password');
  if (!email || !(await rider.correctPassword(password, rider.password))) {
    return next(new AppError('Password Or Email is incorrect', 401));
  }
  const token = jwt.sign(
    { id: rider._id },
    'my-ultra-secure-my-ultra-specific-radar-key',
    {
      expiresIn: '10d',
    },
  );
  res.status(201).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // Getting token if its there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new AppError('You Are Not Logged In.Plz Login.Thanks!', 401));
  }
  // Verification
  const decoded = await promisify(jwt.verify)(
    token,
    'my-ultra-secure-my-ultra-specific-radar-key',
  );
  console.log(decoded);
  // Check If user is deleted from DB
  const freshRider = await Rider.findById(decoded.id);
  if (!freshRider) {
    return next(new AppError('Rider Not Exists.Plz Signup Again.Thanks!', 401));
  }
  next();
});

exports.forgetPassword = catchAsync(async (req, res, next) => {
  // Checking user by email
  const rider = await Rider.findOne({ email: req.body.email });
  if (!rider) {
    return next(new AppError('User Not Found 404.\nThanks!', 404));
  }
  //  Generating Random reset Token
  const resetTokenForRider = rider.resetToken();
  await rider.save({ validateBeforeSave: false });

  // Send Email

  const URL = `${req.protocol}://${req.get('host')}/api/v1/riders/resetPassword/${resetTokenForRider}`;
  const message = `Forget Your Password?Submit A Request With Your New Password and Confirm Password To: ${URL}.\nThanks!`;

  try {
    await sendEmail({
      email: rider.email,
      subject:
        'Your Password Reset Token Is Valid For Only 10 mintutes.\nThanks!',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    rider.passwordResetToken = undefined;
    rider.passwordResetExpires = undefined;
    rider.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There Is An Error Sending An Email.\n Try Again Later.\nThanks!',
        500,
      ),
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {});
