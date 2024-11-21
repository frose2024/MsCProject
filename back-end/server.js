require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');

const { connectDB } = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Initialising express. 
const app  = express();

connectDB()
  .then(() => console.log("Connected to the database successfully."))
  .catch((error) => {
    console.error("Unable to connect to database. Exiting process", error);
    process.exit(1);
  });

app.use(express.json());   // Parses incoming JSON requests. 

app.use(cors());

// Testing route, commented out when not in use. 
app.get('/api/auth/test', (req, res) => {
  console.log('Test route accessed');
  res.send('Test route works');
});


app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
  next();
});

app.use('/uploads', (req, res, next) => {
  console.log('Static file request:', req.url);
  next();
}, express.static(path.join(__dirname, 'uploads')));


app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/trigger-error', (req, res, next) => {
  next(new Error('Simulated server error'));
});

app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware for error handling. Should append the error object to a text file, with date/time info so I can track the issues easier. 
app.use((err, req, res, next) => {
  const timeStamp = new Date().toISOString();

  // Error object for log
  const logEntry = `
   Time: ${timeStamp}
   Error: ${err.stack}
   Request: ${req.method} ${req.url}
   Body: ${JSON.stringify(req.body)}
   Query: ${JSON.stringify(req.query)}
   Params: ${JSON.stringify(req.params)}
    ------------------------
  `;

  const logFilePath = path.join(__dirname, 'error.log');

  fs.appendFile(logFilePath, logEntry, (fsErr) => {
   if (fsErr) {
      console.error('Failed to write to log file:', fsErr);
   }
  });

  console.error(err.stack);
  res.status(500).send('Something has gone awry.');
});


// Start server listening only when not in test mode
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is listening on port ${PORT} in ${process.env.NODE_ENV} mode`);
  });
}


module.exports = app;
