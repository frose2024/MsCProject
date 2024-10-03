// This file is for : handling the JWT authentication part. 

const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {

  try {

    const token = req.header('Authorization').replace('Bearer ', '');

    if (!token){
      res.status(401).json({ message : 'No JWT token was found. Authorisation unsuccessful. '});
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  }

catch (error) {
    next(error);
  }

}

module.exports = authenticate;
