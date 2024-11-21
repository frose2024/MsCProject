const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');         

exports.getProfile = async (req, res, next) => {
  try {
    // Debug: console.log('Profile request user:', req.user);
    if (!req.user || !req.user.userId) {
      return res.status(400).json({ message: 'User not authenticated or userId missing.' });
    }
    
    const user = await User.findById(req.user.userId).select('-password');
    // Debug: console.log('User profile found:', user);
    
    if (!user) {
      // Debug: console.log('User not found with userId:', req.user.userId);
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json(user);

  } catch (error) {
    console.error('Error fetching profile:', error);
    next(error);
  }
};

exports.updateBirthday = async (req, res, next) => {
  try {
    const { birthday } = req.body;
    const userId = req.user.userId;
    
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.birthday = new Date(birthday);

    const today = new Date();
    const isBirthdayToday = 
      today.getDate() === user.birthday.getDate() && 
      today.getMonth() === user.birthday.getMonth();

    // Debug: console.log("Is today user's birthday?", isBirthdayToday);
    // Debug: console.log("Last birthday award date:", user.lastBirthdayAward);

    if (isBirthdayToday) {
      const lastAwardDate = user.lastBirthdayAward ? new Date(user.lastBirthdayAward) : null;
      const oneYearAgo = new Date(today);
      oneYearAgo.setDate(today.getDate() - 365);

      // Debug info: console.log("One year ago:", oneYearAgo);
      // Debug info: console.log("Should award points?", !lastAwardDate || lastAwardDate < oneYearAgo); // Debugging info

      if (!lastAwardDate || lastAwardDate <= oneYearAgo) {
        user.points += 100;
        user.lastBirthdayAward = today;
      }
    }

    await user.save();
    res.status(200).json({ message: 'Birthday updated successfully.' });
  } catch (error) {
    console.error('Error updating birthday:', error);
    next(error);
  }
};

exports.updateUserInformation = async (req, res, next) => {
  const { username, email, password, oldPassword } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  try {
    const user = await User.findById(userId).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'Sorry, that user was not found.' });
    }

    // Debug: console.log('Incoming update request body:', req.body);
    // Debug: log('Retrieved user password from DB:', user.password);

    if (oldPassword) {
      const isOldPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
      if (!isOldPasswordCorrect) {
        return res.status(400).json({ message: 'Old password is incorrect.' });
      }
    } else {
      return res.status(400).json({ message: 'Old password is required to update information.' });
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    await user.save();
    res.status(200).json({ message: 'User information updated successfully.' });

  } catch (error) {
    console.error('Error updating user information:', error);
    res.status(500).json({ message: 'Failed to update user information.' });
  }
};
