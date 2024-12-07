const QRCode = require('qrcode');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.generateUserQRCode = async (req, res) => {
    // Debug: console.log('Accessing QR code generation route');
    try {
        const userId = req.params.userId;

        // Check the user exists and isn't an admin
        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({ message: 'User not found.' }); // Change from 403 to 404
        }
        if (user.role !== 'user') {
          return res.status(403).json({ message: 'QR code generation is for users only.' });
        }
    
    // Increments QR code retrieval count
    user.qrCodeRetrievalCount = (user.qrCodeRetrievalCount || 0) + 1;
    await user.save();

    // Generate the token and QR code
    const token = jwt.sign(
        {
            userId,
            points: user.points,
            generationCount: user.qrCodeRetrievalCount,
            access: 'manage-points'
        },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );

    const qrUrl = `http://192.168.1.106:3000/api/admin/${userId}/manage-points?token=${token}`;
    const qrCodeData = await QRCode.toDataURL(qrUrl);
    user.qrCode = qrCodeData;
    
    res.status(200).json({ qrCode: qrCodeData });
    } catch (error) {
        console.error('Error generating QR code:', error);
        res.status(500).json({ message: 'An error occured whilst generating the QR code.'});
    }
};

// Processes a QR code and validates access
exports.processQRCode = async (req, res) => {
    try {
        const token = req.query.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Debug: console.log('Processing QR code with user:', req.user);

        // Check the token grants the correct access
        if (decoded.access === 'manage-points' && req.user.role === 'admin') {
            const user = await User.findById(decoded.userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }

            res.json({ 
                message: 'Admin access granted. You can manage points.', 
                userId: user._id,
                points: decoded.points,
                generationCount: decoded.generationCount
            });
        } else {
            res.status(403).json({ message: "Sorry, you don't have the correct permissions for that." });
        }
    } catch (error) {
        console.error('Error processing QR code:', error);
        res.status(500).json({ message: 'Invalid or expired token.' });
    }
};
