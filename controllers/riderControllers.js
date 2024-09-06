const catchAsync = require('./../utils/catchAsync');
const Rider = require('./../models/riderModels');

exports.getAllRiders = catchAsync(async (req, res, next) => {
  const riders = await Rider.find();

  // SEND RESPONSE\
  res.status(200).json({
    status: 'success',
    results: riders.length,

    data: {
      riders,
    },
  });
  // next();
});
exports.getRider = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};
exports.createRider = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};
exports.updateRider = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};
exports.deleteRider = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};
