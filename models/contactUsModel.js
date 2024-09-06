const mongoose = require('mongoose');

const contactUsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  queryType: {
    type: String,
    enum: ['General', 'Complaint', 'Suggestion', 'Other'],
    required: true,
  },
  email: {
    type: String,
    required: true,
    match: [/.+@.+\..+/, 'Please enter a valid email address'],
  },
  phoneNumber: {
    type: String,
    required: true,
    match: [
      /^(\+92|0)?[1-9][0-9]{9}$/,
      'Please enter a valid Pakistani phone number',
    ],
  },
  details: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'solved'],
    default: 'pending', // Default status is 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ContactUs = mongoose.model('ContactUs', contactUsSchema);
module.exports = ContactUs;
