const express = require ('express');
const router = express.Router();

const { authenticate } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');
const { generateUserQRCode } = require('../controllers/qrController');
const { getMenu } = require ('../controllers/menuController');

router.get('/profile', authenticate, userController.getProfile);
router.put('/birthday', authenticate, userController.updateBirthday);
router.put('/update', authenticate, userController.updateUserInformation);
router.get('/:userId/generate-qr', authenticate, generateUserQRCode);
router.get('/menu/view', authenticate, getMenu);

module.exports = router;

