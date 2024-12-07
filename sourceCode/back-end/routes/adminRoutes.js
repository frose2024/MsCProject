const express = require('express');
const router = express.Router();
const multer = require('multer');

const { authenticate, roleAuthentication } = require('../middleware/authMiddleware');
const { updateUserPoints } = require('../controllers/pointManagementController');
const { processQRCode, generateUserQRCode } = require('../controllers/qrController');
const { uploadMenu } = require('../controllers/menuController');
const upload = multer({ dest: 'uploads/' });

// Admin point management routes
router.get('/:userId/manage-points', authenticate, roleAuthentication('admin'), processQRCode); // Process QR code
router.post('/:userId/manage-points', authenticate, roleAuthentication('admin'), updateUserPoints, generateUserQRCode); // Update user points and regenerate QR code

// Menu upload route for admins
router.post('/menu/upload', authenticate, roleAuthentication('admin'), upload.single('file'), uploadMenu); // Upload a new menu

module.exports = router;
