const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  try {
      let token;
      let decoded;

      if (req.path.includes('/manage-points')) {
          token = req.query.token;

          if (!token) {
              return res.status(401).json({ message: 'No token provided in query string.' });
          }

          decoded = jwt.verify(token, process.env.JWT_SECRET);
          // console.log('Token received in query string:', req.query.token);

          if (req.headers.authorization) {
              const adminToken = req.headers.authorization.split(' ')[1];
              if (!adminToken) {
                  return res.status(401).json({ message: 'No token provided in Authorization header.' });
              }
              const adminDecoded = jwt.verify(adminToken, process.env.JWT_SECRET);
              
              req.user = {
                id: decoded.userId,
                role: adminDecoded.role,
              };
            } else {
              req.user = {
                id: decoded.userId,
                ...decoded,
              };
            }
          } else {
            token = req.headers.authorization?.split(' ')[1];
      
            if (!token) {
              return res.status(401).json({ message: 'No token provided in Authorization header.' });
            }
      
            decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = {
              id: decoded.userId,
              ...decoded,
            };
          }
      
          // Debug: console.log('Decoded user from token:', req.user);
          next();
        } catch (error) {
          console.error('Authentication failed:', error.message);
          res.status(403).json({ message: 'Invalid or expired token.' });
        }
      };


const roleAuthentication = (requiredRole) => {

  return (req, res, next) => {
    // Debug: console.log('Checking user role for access:', req.user.role);
    // Debug: console.log('Required role for access:', requiredRole);

    if (!requiredRole) {
      return res.status(500).json({ message: 'Required role is not defined in middleware.' });
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({ message: "Sorry, you don't have the correct permissions for that." });
    }

    next();
  };
};


module.exports = { authenticate, roleAuthentication };
