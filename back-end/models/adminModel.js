const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
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
    enum: ['admin'],
    default: 'admin',
  },
}, { collection: 'admins', timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
