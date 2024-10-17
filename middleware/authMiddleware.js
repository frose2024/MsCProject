// This file is for : handling the JWT authentication part. 

const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No JWT token was found. Authentication unsuccessful.' });
    }

    const token = authHeader.replace('Bearer ', '');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token, authorization unsuccessful.' });
  }
};


const roleAuthentication = (requiredRole) => {
  return (req, res, next) => {

    if (req.user.role !== requiredRole){
      return res.status(403).json({ message: "Sorry, you don't have the correct permissions for that."})
    }
    next();
  }
}

module.exports = { authenticate, roleAuthentication};