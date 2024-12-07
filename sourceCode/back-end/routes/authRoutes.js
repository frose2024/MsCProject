const express = require('express');
const router = express.Router();

const loginAndRegistrationController = require('../controllers/loginAndRegistrationController');

// Authentication routes for login and registration
router.post('/login', loginAndRegistrationController.login); // User login
router.post('/register', loginAndRegistrationController.register); // User registration

module.exports = router;
