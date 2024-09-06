const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
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
  image: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user',
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

// PreSave middleware for password encryption

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  // Hashing(Encryting Password Using Bcrypt)
  this.password = await bcrypt.hash(this.password, 12);

  this.confirmPassword = undefined;
  next();
});


userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// custom instance method
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.ChangedPassword = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return JWTTimestamp < changedTimeStamp;
  }
  return false;
};
userSchema.methods.resetPasswordToken = function () {
  const RandomToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(RandomToken)
    .digest('hex');

  console.log({ RandomToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return RandomToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
