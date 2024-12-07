const multer = require('multer');
const Menu = require('../models/menuModel.js');

// Configures file upload using multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save uploaded files in the "uploads" folder
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Adds timestamp to avoid filename conflicts
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/png') {
      cb(null, true); // Accept only PNG files
    } else {
      cb(null, false); // Reject invalid file types
      req.fileValidationError = 'Only PNG files are allowed';
    }
  },
});


// Handles the menu upload
const uploadMenu = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }
    
    if (req.fileValidationError) {
      return res.status(400).json({ message: req.fileValidationError });
    }
    
    if (!req.user || !req.user.id) {
      return res.status(400).json({ message: 'User information is missing.' });
    }

    const menu = new Menu({
      url: `/uploads/${req.file.filename}`,
      uploadedBy: req.user.id,
    });

    await menu.save();
    res.status(200).json({ message: 'Menu uploaded successfully', menu });
  } catch (error) {
    res.status(500).json({ message: 'Failure to upload the menu.', error });
  }
};

// Retrieves the menu for viewing
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