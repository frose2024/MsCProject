// This file is for : authentication routes, mapping the HTTP requests to the correct controller functions. 


// Import necessary modules (jwtwebtoken, express routes).
const express = require('express');
const router = express.Router();

const { authenticate, roleAuthentication } = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

// Route syntax is - router.HTTPverb('/path', middleware, controller function)


// Authentication routes - login and register.
router.post('/login', authController.login);
router.post('/register', authController.register);

// User routes  -  GET user profile (protected)
router.get('/profile', authenticate, userController.getProfile);


// Admin routes - manage user accounts, update the menu, scan/decode QR codes, change point total. 
// QR codes - generate QR code, view my QR code. 
// Menu - retrieve the current menu, update the menu. 


module.exports = router;