// This file is for : getting User information from the request. 
const User = require('../models/userModel');


exports.getProfile = async (req, res, next) => {
  try {
    // Retrieve the user based on the ID stored in req.user (set by authMiddleware)
    const user = await User.findById(req.user.userId).select('-password');  // Exclude the password from the response

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
