require('dotenv').config();

// Requirements
const fs = require('fs');
const path = require('path');
const express = require('express');
const { connectDB } = require('./config/db');
const authRoutes = require('./routes/authRoutes');


// Initialising express. 
const app  = express();


connectDB()
  .then(() => console.log("Connected to the database successfully."))
  .catch((error) => {
    console.error("Unable to connect to database. Exiting process", error);
    process.exit(1);
  });

app.use(express.json());   // Parses incoming JSON requests. 

app.use('/api/auth', authRoutes);   // Setting base path for the authentication-related routes.

app.get('/api/trigger-error', (req, res, next) => {
  next(new Error('Simulated server error'));  // Simulating an unhandled error for test purpose. 
});

// 404 handler is for a requested route doesn't exist. 
app.use((req, res, next) => {
   res.status(404).json({ message: 'Route not found' });
 });

   // Potentially move to separate module?
   // Potential for log getting very long and unweirdly. Tweak it so that errors are categorised based on cause, sent to different log documents?
         // Sort by status code? Sort by extracting some sort of key word. Could tweak error object to add a 'cause' key, give it a code, logging function
            // extracts that code and directs the error appropriately?
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

// Suggested improvement, 'graceful shutdown' handler?

// Start server listening only when not in test mode
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });
}

module.exports = app;

// Suggested security middleware :
   // helemt to set HTTP headers
   // express-rate-limit to limit number of requests users can send