const mongoose = require('mongoose');

const myProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

});

const Profile = mongoose.model('Profile', myProfileSchema);
module.exports = Profile;
