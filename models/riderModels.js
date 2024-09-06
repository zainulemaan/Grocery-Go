const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const moment = require('moment');
const crypto = require('crypto');

const riderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please Provide Your Name'],
  },
  email: {
    type: String,
    required: [true, 'Please Provide Your Email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide valid Email'],
  },
  phoneNumber: {
    type: String,
    required: [true, 'Please Prove Phone Number'],
    validate: {
      validator: function (v) {
        return /^(\+92)[0-9]{10}$/.test(v);
      },
      message: 'Please Provide a Valid Phone Number (e.g., +923434678660)',
    },
    unique: true,
  },
  emergencyContact: {
    type: String,
    required: [true, 'Please Prove Phone Number'],
    validate: {
      validator: function (v) {
        return /^(\+92)[0-9]{10}$/.test(v);
      },
      message: 'Please Provide a Valid Phone Number (e.g., +923414678420)',
    },
    unique: true,
  },

  dateOfBirth: {
    type: Date,
    required: [true, 'Please Provide Date of Birth'],
    validate: {
      validator: function (value) {
        // Check if the date is at least 18 years ago
        return moment().diff(moment(value), 'years') >= 18;
      },
      message: 'Rider must be at least 18 years old',
    },
  },
  cnicPhoto: {
    type: String,
  },
  gender: {
    type: String,
    required: [true, 'Please Specify Gender'],
    enum: {
      values: ['Male', 'Female', 'Non-binary', 'Other'],
      message: 'Gender is either: Male, Female, Non-binary, or Other',
    },
  },
  numDeliveries: {
    type: Number,
    default: 0,
  },
  vehicleType: {
    type: String,
    enum: ['car', 'motorcycle', 'bicycle'],
    required: [true, 'Please Prove Your Vehicle Type'],
  },
  vehicleNumber: {
    type: String,
    required: [true, 'Please Provide Your Vehicle Number'],
    unique: true,
  },
  image: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'Please Provide A Password'],
    minlength: 8,
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, 'Please Confirm Your Password'],
    // This Validation Works for Create & Save
    validate: {
      validator: function (el) {
        return el === this.password;
      },
    },
    message: 'Passwords Are Not Matching',
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

// pre save middlewaere for password encryption

riderSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  // Hashing(Encryting Password Using Bcrypt)
  this.password = await bcrypt.hash(this.password, 12);

  this.confirmPassword = undefined;
  next();
});

// custom instance method

riderSchema.methods.correctPassword = async function (
  candidatePassword,
  riderPassword,
) {
  return await bcrypt.compare(candidatePassword, riderPassword);
};
riderSchema.methods.resetToken = function () {
  const randomToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(randomToken)
    .digest('hex');
  console.log({ randomToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return randomToken;
};
const Rider = mongoose.model('Rider', riderSchema);
module.exports = Rider;
