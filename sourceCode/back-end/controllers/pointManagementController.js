const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

// Retrieves the points of a specific user based on the token
exports.getUserPoints = async (req, res, next) => {
  try {
    const token = req.query.token;

    // Check that the token is present
    if (!token) {
      return res.status(403).json({ message: 'Token required for access' });
    }

    let decoded;
    try {
      // Verify the token
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      // Handle any token errors
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      } else {
        throw error;
      }
    }

    // Ensure the token has the correct access rights
    if (decoded.access !== 'points') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Retrieve the user based on the decoded userId OR request parameter
    const user = await User.findById(decoded.userId || req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Respond with the user's points
    res.status(200).json({ points: user.points });
  } catch (error) {
    next(error);
  }
};

// Updates the points of a specific user
exports.updateUserPoints = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1]
    : null;

    // Check that the token is present
    if (!token) {
      // Debug: console.log('No token provided');
      return res.status(403).json({ message: 'Token required for access' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Debug: console.log('Token verified, decoded:', decoded);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        // Debug: console.log('Token expired');
        return res.status(401).json({ message: 'Token expired' });
      } else if (error.name === 'JsonWebTokenError') {
        // Debug: console.log('Invalid token');
        return res.status(401).json({ message: 'Invalid token' });
      } else {
        throw error;
      }
    }

    // Check that token belongs to an admin
    if (decoded.role !== 'admin') {
      // Debug: console.log('Access denied: not an admin');
      return res.status(403).json({ message: 'Access denied' });
    }

    // Find the user by iD
    const user = await User.findById(req.params.userId);
    // Debug: console.log('User found:', user);
    if (!user) {
      // Debug: console.log('User not found');
      return res.status(404).json({ message: 'User not found.' });
    }

    // Calculate new points and validate
    const newPoints = user.points + req.body.points;
    // Debug: console.log('New calculated points:', newPoints);
    if (newPoints < 0) {
      // Debug: console.log('Points cannot be negative');
      return res.status(400).json({ message: 'Points cannot be negative.' });
    }

    // Update and save user points
    user.points = newPoints;
    await user.save();
    // Debug: console.log('User points updated and saved:', user.points);

    res.status(200).json({ message: 'Points updated successfully.', newPoints: user.points });
  } catch (error) {
    // Debug: console.log('Error in updateUserPoints:', error);
    next(error);
  }
};
