const jwt = require('jsonwebtoken');

// Middleware to authenticate a user based on the provided token
const authenticate = (req, res, next) => {
  try {
    let token;
    let decoded;

    // Check for tokens in query string for /manage-points route
    if (req.path.includes('/manage-points')) {
      token = req.query.token;

      if (!token) {
        // Response if no token is provided in the query string
        return res.status(401).json({ message: 'No token provided in query string.' });
      }

      decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify query token
      // Debug: console.log('Token received in query string:', req.query.token);

      // Check for an admin token in the Authorization header
      if (req.headers.authorization) {
        const adminToken = req.headers.authorization.split(' ')[1];
        if (!adminToken) {
          return res.status(401).json({ message: 'No token provided in Authorization header.' });
        }
        const adminDecoded = jwt.verify(adminToken, process.env.JWT_SECRET); // Verifies admin token

        // Attach user info to the request object, with the admin role
        req.user = {
          id: decoded.userId,
          role: adminDecoded.role,
        };
      } else {
        // Attach user info from query token if no admin token is present
        req.user = {
          id: decoded.userId,
          ...decoded,
        };
      }
    } else {
      // Handle token verification for non-query-based routes
      token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        // Response if no token is provided in the Authorization header
        return res.status(401).json({ message: 'No token provided in Authorization header.' });
      }

      decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token

      // Attach user info to the request object
      req.user = {
        id: decoded.userId,
        ...decoded,
      };
    }

    // Debug: console.log('Decoded user from token:', req.user);
    next(); // Pass to next middleware
  } catch (error) {
    // Log and respond with an error if token verification fails
    console.error('Authentication failed:', error.message);
    res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

// Middleware to restrict access based on user roles
const roleAuthentication = (requiredRole) => {
  return (req, res, next) => {
    // Debug: console.log('Checking user role for access:', req.user.role);
    // Debug: console.log('Required role for access:', requiredRole);

    // Ensure requiredRole is defined
    if (!requiredRole) {
      return res.status(500).json({ message: 'Required role is not defined in middleware.' });
    }

    // Check the user's role matches the required role
    if (req.user.role !== requiredRole) {
      return res.status(403).json({ message: "Sorry, you don't have the correct permissions for that." });
    }

    next(); // Pass to the next middleware
  };
};

module.exports = { authenticate, roleAuthentication };
