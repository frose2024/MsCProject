const express = require('express');
const router = express.Router();

const loginAndRegistrationController = require('../controllers/loginAndRegistrationController');

router.post('/login', loginAndRegistrationController.login);
router.post('/register', loginAndRegistrationController.register);

module.exports = router;
