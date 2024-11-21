const multer = require('multer');
const Menu = require('../models/menuModel.js');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Only PNG files are allowed'), false);
    }
  },
});

const uploadMenu = async (req, res) => {
  try {
    if (!req.file) {
      console.error('Error: no file uploaded');
      return res.status(400).json({ message: 'No file uploaded.'});
    }

    if (!req.user || !req.user.id) {
      console.error('Error: User information is missing in the request.');
      return res.status(400).json({ message: 'User information is missing.' });
    }

    const menu = new Menu({
      url: `/uploads/${req.file.filename}`,
      uploadedBy: req.user.id,
    });

    // Debug: console.log('Saving menu to the database...');
    await menu.save();
    // Debug: console.log('Menu saved successfully:', menu);

    res.status(200).json({ message: 'Menu uploaded successfully', menu });
  } catch (error) {
    console.error('Error uploading menu:', error);
    res.status(500).json({ message: 'Failure to upload the menu.', error });
  }
};

const getMenu = async (req, res) => {
  try {
    // Debug: console.log('Received request to fetch menu...');
    // Debug: console.log('Request headers:', req.headers);

    const menu = await Menu.findOne().sort({ createdAt: -1 });
    if (!menu) {
      console.warn('No menu found in the database.');
      return res.status(404).json({ message: 'No menu found.' });
    }

    // Debug: console.log('Menu found:', menu);
    res.status(200).json({ menu });
  } catch (error) {
    console.error('Error fetching the menu:', error);
    res.status(500).json({ message: 'Unable to fetch the menu.', error });
  }
};

module.exports = { uploadMenu, getMenu };
