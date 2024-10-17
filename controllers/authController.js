const bcrypt = require('bcryptjs');                   // Import to hash passwords. 
const User = require('../models/userModel.js');       // Import userModel module.
const jwt  = require('jsonwebtoken');                 // Import to generate json web tokens. 


exports.register = async (req, res, next) => {
  try {
    const { username, password, role } = req.body;
    // console.log('Register request:', req.body);

    if (!username || !password) {
      // console.log('Validation error: Username or password missing.');
      return res.status(400).json({ message: 'Sorry, the password and username are required fields.' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      // console.log('User already exists:', existingUser);
      return res.status(400).json({ message: 'This username already exists.' });
    }

    if (password.length < 6 || password.length > 128) {
      // console.log('Validation error: Invalid password length.');
      return res.status(400).json({ message: 'Sorry, your password needs to be between 6 and 128 characters long.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // console.log('Password hashed successfully.');

    const newUser = new User({
      username,
      password: hashedPassword,
      role: role || 'user'
    });

    await newUser.save();
    // console.log('New user created:', newUser);

    res.status(201).json({ message: 'A new user has been created successfully.' });

  } catch (error) {
    // console.error('Error during registration:', error);
    next(error);
  }
};

// User login process - authenticate user, log them in, generate JWT token. 
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    // console.log('Login request:', req.body);

    if (!username || !password) {
      // console.log('Validation error: Username or password missing.');
      return res.status(400).json({ message: 'Sorry, the password and username are required fields.' });
    }

    const user = await User.findOne({ username }).select('+password');
    // console.log('User retrieved for login:', user);

    if (!user) {
      // console.log('User not found:', username);
      return res.status(400).json({ message: 'Sorry, we have no record of that username.' });
    }

    // console.log('User found:', user);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // console.log('Password mismatch for user:', username);
      return res.status(400).json({ message: 'Sorry, the password and username do not match.' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    // console.log('Token generated for user:', user._id);

    res.status(200).json({ token });

  } catch (error) {
    // console.error('Error during login:', error);
    next(error);
  }
};
