const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const Admin = require('../models/adminModel');
const MONGO_URI = process.env.NODE_ENV === 'production' ? process.env.MONGO_URI_PROD : process.env.MONGO_URI_DEV;

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to db.'))
  .catch(err => console.error("Couldn't connect to db.", err));

async function createAdmin() {
  try{
    const hashedPassword = await bcrypt.hash('test1234', 10); // Replace 'admin_password' w/ chosen password. 

    const adminUser = new Admin({
      username: 'devAdmin',    // Change to desired username.
      password: hashedPassword,     // Do not change. 
      email: 'admin@example.com',   // Change to desired email. 
      role: 'admin'                 // Do not change.
    });

    await adminUser.save();
    console.log('Admin created successfully.');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    mongoose.connection.close();
  }
}

createAdmin();

