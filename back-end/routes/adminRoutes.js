const express = require('express');
const router = express.Router();
const multer = require('multer');

const { authenticate, roleAuthentication } = require('../middleware/authMiddleware');
const { updateUserPoints } = require('../controllers/pointManagementController');
const { processQRCode, generateUserQRCode } = require('../controllers/qrController');
const { uploadMenu } = require('../controllers/menuController');
const upload = multer({ dest: 'uploads/' });

router.get('/:userId/manage-points', authenticate, roleAuthentication('admin'), processQRCode);
router.post('/:userId/manage-points', authenticate, roleAuthentication('admin'), updateUserPoints, generateUserQRCode);
router.post('/menu/upload', authenticate, roleAuthentication('admin'), upload.single('file'), uploadMenu);


module.exports = router;
