const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String, 
    required: true,
    unique: true,
    minlength: 4,
    maxlength: 30,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 128,
    select: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /.+\@.+\..+/,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  points: {
    type: Number, 
    default: 0,
    min: 0,
  },
  qrCode: {
    type: String,
    default: null,
  },
  qrCodeRetrievalCount: {
    type: Number,
    default: 0,
  },
  birthday: {
    type: Date,
    default: null,
  },
  lastBirthdayAward: {
    type: Date, 
    default: null,
  },
}, { collection: 'users', timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
