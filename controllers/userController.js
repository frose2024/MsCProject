// This file is for : getting User information from the request. 
const User = require('../models/userModel');

exports.getProfile = async (req, res, next) => {
  try {
    console.log('Profile request user:', req.user);
    if (!req.user || !req.user.userId) {
      return res.status(400).json({ message: 'User not authenticated or userId missing.' });
    }
    
    const user = await User.findById(req.user.userId).select('-password');
    console.log('User profile found:', user);
    
    if (!user) {
      console.log('User not found with userId:', req.user.userId);
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);

  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

