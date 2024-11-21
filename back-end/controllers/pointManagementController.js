const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

exports.getUserPoints = async (req, res, next) => {
  try {
    const token = req.query.token;

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

    if (decoded.access !== 'points') {
      // Debug: console.log('Access denied: insufficient access rights');
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(decoded.userId || req.params.userId);
    // Debug: console.log('User found:', user);

    if (!user) {
      // Debug: console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ points: user.points });
  } catch (error) {
    // Debug: console.log('Error in getUserPoints:', error);
    next(error);
  }
};

exports.updateUserPoints = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1]
    : null;


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

    if (decoded.role !== 'admin') {
      // Debug: console.log('Access denied: not an admin');
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(req.params.userId);
    // Debug: console.log('User found:', user);

    if (!user) {
      // Debug: console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    const newPoints = user.points + req.body.points;
     Debug: console.log('New calculated points:', newPoints);

    if (newPoints < 0) {
      // Debug: console.log('Points cannot be negative');
      return res.status(400).json({ message: 'Points cannot be negative.' });
    }

    user.points = newPoints;
    await user.save();
    Debug: console.log('User points updated and saved:', user.points);

    res.status(200).json({ message: 'Points updated successfully.', newPoints: user.points });
  } catch (error) {
    // Debug: console.log('Error in updateUserPoints:', error);
    next(error);
  }
};
