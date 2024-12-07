const express = require ('express');
const router = express.Router();

const { authenticate } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');
const { generateUserQRCode } = require('../controllers/qrController');
const { getMenu } = require ('../controllers/menuController');

// User profile-related routes
router.get('/profile', authenticate, userController.getProfile); // Fetch user profile
router.put('/birthday', authenticate, userController.updateBirthday); // Update user birthday
router.put('/update', authenticate, userController.updateUserInformation); // Update user information
router.get('/:userId/generate-qr', authenticate, generateUserQRCode); // Generate user QR code
router.get('/menu/view', authenticate, getMenu); // View the menu

module.exports = router;

