const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
  },
  { timestamps: true}
);

const Menu = mongoose.model('Menu', menuSchema);

module.exports = Menu;