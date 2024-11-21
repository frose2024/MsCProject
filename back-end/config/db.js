const mongoose = require('mongoose');

const dbURI = process.env.NODE_ENV === 'production' ? process.env.MONGO_URI_PROD : process.env.MONGO_URI_DEV;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(dbURI);
    console.log(`MongoDB Connected to ${process.env.NODE_ENV === 'production' ? 'production' : 'development'} database: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const closeDB = async () => {
  await mongoose.connection.close();
};

module.exports = { connectDB, closeDB };


