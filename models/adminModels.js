const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    reqiure: [true, 'Please Provide Your Username'],
  },
  email: {
    type: String,
    require: [true, 'Please Provide Your Email'],
    unique: true,
  },
  password: {
    type: String,
    require: [true, 'Please Provide Your Password'],
  },
});

// adminSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next();

//   this.password = await bcrypt.hash(this.password, 12);
//   next();
// });
