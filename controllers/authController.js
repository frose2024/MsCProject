// This file is for : handling registration and login logic. 
const bcrypt = require('bycryptjs');
const User = require('../models/userModel.js');
const jwt  = require('jsonwebtoken');

exports.register =  async (req, res, next) => {
    try {

    const { username, password, role} = req.body;
    const existingUser = await User.findOne({ username });
        
    if (existingUser) {
      return res.status(400).json({ message : 'This username already exists.'});
    }

    if (password.length < 6 || password.length > 128){
      return res.status(400).json({ message : 'Sorry, your password needs to be between 6 and 128 characters long.'})
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = new User({
      username: username, 
      password: hashedPassword,
      role: role || 'user'
    });

    await newUser.save();

    res.status(201).json({ message : 'A new user has been created successfully.'});

  } catch (error) {
    next(error);
  }

}

// User login process - authenticate user, log them in, generate JWT token. 
exports.login = async(req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({username});

    // If user does not exist, exit with error.
    if (!user){
      res.status(400).json({ message : 'Sorry, we have no record of that username.'});
    }

    // Compare password with encrypted one.
    const isMatch = await bcrypt.compare(password, user.password);

    // If user does exist, but password does not match, exit with error.
    if (!isMatch){
      res.status(400).json({ message : 'Sorry, the password and username do not match.'});
    }

    // Generate the JWT token for the user.
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h'}
    )

    res.status(200).json({ token });

  } catch (error){
    next(error);
  }

}
