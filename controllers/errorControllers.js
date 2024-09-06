const devconfig = require('./../utils/devconfig');
const AppError = require('./../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};
const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  console.log(field, ':', value);
  const message = `Duplicate field value: ${field}:(${value}) Please use another value!`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};
const HandleJwtErrorDB = (err) => {
  return new AppError('Invalid Token Please Log In Again!', 401);
};
const HandleJwtExipryErrorDB = (err) => {
  return new AppError('Your Token Is Expired Please Login Again!',401);
};

const sendDevError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};
const sendProdError = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('Error', err);

    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (devconfig.mode === 'development') {
    sendDevError(err, res);
  } else if (devconfig.mode === 'production') {
    let error = {
      ...err,
      name: err.name,
      message: err.message,
      stack: err.stack,
      path: err.path,
      value: err.value,
    };
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = HandleJwtErrorDB(error);
    if (error.name === 'TokenExpiredError')
      error = HandleJwtExipryErrorDB(error);
    sendProdError(error, res);
  }
};
