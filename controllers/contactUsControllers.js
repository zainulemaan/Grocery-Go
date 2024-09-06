const ContactUs = require('./../models/contactUsModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const User = require('./../models/Usermodels');
const jwt = require('jsonwebtoken');

const JWT_SECRET_KEY = 'my-ultra-secure-and-ultra-long-secret';
exports.createContactUs = catchAsync(async (req, res, next) => {
  if (!req.cookies.jwt) {
    return res.status(401).json({
      status: 'fail',
      message: 'JWT token missing',
    });
  }

  const token = req.cookies.jwt;

  try {
    const decoded = jwt.verify(token, JWT_SECRET_KEY);
    const userId = decoded.id;

    // Optional: Validate that the user exists
    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const contactUs = new ContactUs({
      userId: userId,
      name: req.body.name,
      queryType: req.body.queryType,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      details: req.body.details,
    });

    await contactUs.save();
    res.status(201).json({
      message: 'Contact entry created successfully',
      contactUs,
    });
  } catch (err) {
    return next(new AppError('Invalid token. Please log in again.', 401));
  }
});

// Get all contact entries
exports.getAllContactUs = catchAsync(async (req, res, next) => {
  const contactUsEntries = await ContactUs.find();
  if (!contactUsEntries) {
    new AppError(next('No Complaints Found', 404));
  }
  res.status(200).json({
    message: 'Contact entries retrieved successfully',
    contactUsEntries,
  });
});

// Get all contact entries (complaints) for admin
exports.getAllContactUs = catchAsync(async (req, res, next) => {
  const contactUsEntries = await ContactUs.find();
  if (!contactUsEntries || contactUsEntries.length === 0) {
    return next(new AppError('No Complaints Found', 404));
  }
  res.status(200).json({
    message: 'Contact entries retrieved successfully',
    contactUsEntries,
  });
});

// Get all pending and solved complaints
exports.getComplaintsByStatus = catchAsync(async (req, res, next) => {
  const pendingComplaints = await ContactUs.find({ status: 'pending' });
  const solvedComplaints = await ContactUs.find({ status: 'solved' });

  res.status(200).json({
    message: 'Complaints retrieved successfully',
    pendingComplaints,
    solvedComplaints,
  });
});

// Count pending complaints
exports.countPendingComplaints = catchAsync(async (req, res, next) => {
  const pendingCount = await ContactUs.countDocuments({ status: 'pending' });

  res.status(200).json({
    message: 'Pending complaints count retrieved successfully',
    pendingCount,
  });
});

// Controller to search complaints based on various fields
exports.searchComplaints = catchAsync(async (req, res, next) => {
  const { name, status, email, phoneNumber, queryType } = req.query;

  // Build the query object based on provided search parameters
  const query = {};

  if (name) {
    query.name = { $regex: new RegExp(name, 'i') }; // Case-insensitive search
  }
  if (status) {
    query.status = status;
  }
  if (email) {
    query.email = { $regex: new RegExp(email, 'i') }; // Case-insensitive search
  }
  if (phoneNumber) {
    query.phoneNumber = { $regex: new RegExp(phoneNumber, 'i') }; // Case-insensitive search
  }
  if (queryType) {
    query.queryType = queryType;
  }

  const complaints = await ContactUs.find(query);

  if (!complaints.length) {
    return next(new AppError('No complaints found matching the criteria', 404));
  }

  res.status(200).json({
    message: 'Complaints retrieved successfully',
    complaints,
  });
});

exports.markComplaintAsSolved = catchAsync(async (req, res, next) => {
  const complaintId = req.params.id;

  // Find the complaint by ID
  const complaint = await ContactUs.findById(complaintId);
  if (!complaint) {
    return next(new AppError('Complaint not found', 404));
  }

  // Check if the complaint is already solved
  if (complaint.status === 'solved') {
    return next(new AppError('Complaint is already marked as solved', 400));
  }

  // Update the status of the complaint
  complaint.status = 'solved';
  await complaint.save();

  res.status(200).json({
    message: 'Complaint status updated to solved successfully',
    complaint,
  });
});
