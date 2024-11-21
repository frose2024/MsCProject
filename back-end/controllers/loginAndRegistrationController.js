const bcrypt = require('bcryptjs');                   // Import to hash passwords.      // Import userModel module.
const jwt  = require('jsonwebtoken');                 

const Admin = require('../models/adminModel.js');
const User = require('../models/userModel.js');  
const QRCode = require('qrcode');

exports.register = async (req, res, next) => {
  //Debug: console.log('Initial request body:', req.body);
  try {
    const { username, password, role, email } = req.body;
    // Debug: console.log('Register request:', req.body);

    if (!username || !password || !email) {
      // Debug: console.log('Validation error: Username or password missing.');
      return res.status(400).json({ message: 'Sorry, password, username and email are required fields.' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      // Debug: console.log('User already exists:', existingUser);
      return res.status(400).json({ message: 'This username already exists.' });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'This email is already in use.'})
    } 

    if (password.length < 6 || password.length > 128) {
      // Debug: console.log('Validation error: invalid password length.');
      return res.status(400).json({ message: 'Sorry, your password needs to be between 6 and 128 characters long.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // Debug: console.log('Password hashed successfully.');

    const newUser = new User({
      username,
      password: hashedPassword,
      role: role || 'user',
      email,
      qrCode: null
    });

    if (newUser.role === 'user') {
      newUser.points = 0;
      newUser.qrCodeGenerationCount = 1;

      const token = jwt.sign(
        { userId: newUser._id, points: newUser.points, generationCount: newUser.qrCodeGenerationCount, access: 'manage_points' },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      const qrUrl = `http://192.168.1.106:3000/api/users/${newUser._id}/manage-points?token=${token}`;
      const qrCodeData = await QRCode.toDataURL(qrUrl);

      newUser.qrCode = qrCodeData;
    }
    await newUser.save();
    // Debug: console.log('New user created:', newUser);

    res.status(201).json({ message: 'A new user has been created successfully.' });

  } catch (error) {
    // Debug: console.error('Error during registration:', error);
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Username or email are required fields.' });
    }

    // First, attempt to find the user in the User collection
    let user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }]
    }).select('+password');

    // If not found in User, attempt to find in Admin collection
    if (!user) {
      user = await Admin.findOne({
        $or: [{ username: identifier }, { email: identifier }]
      }).select('+password');
    }

    // If still no user found, return an error
    if (!user) {
      return res.status(400).json({ message: 'Sorry, we have no record of that user.' });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password.' });
    }

    // Generate JWT token based on user role
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Generate QR code if the user is not an admin
    let qrCodeData = null;
    if (user.role === 'user') {
      const qrToken = jwt.sign(
        { userId: user._id, access: 'view' },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      const qrUrl = `http://192.168.1.106:3000/api/users/${user._id}/points?token=${qrToken}`;
      qrCodeData = await QRCode.toDataURL(qrUrl);
    }

    // Respond with token, user details, and QR code (if applicable)
    res.status(200).json({ token, userId: user._id, role: user.role, qrCode: qrCodeData });

  } catch (error) {
    next(error);
  }
};
