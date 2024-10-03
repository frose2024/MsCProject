// This file is for : user schema for mongo.


/* Okay so user information needed would be :
  - Username - make sure is unique and follows specific requirements.
  - Password - make sure is of correct size. 
  - Hashed password via 
  - Privilege status - admin or user 

Model would need to have fields for all of these, and would need username and password to be required fields.
Authorisation controller will handle the authentication part, as well as checking the username and password are valid. 

*/

const mongoDB = require('mongoose');

const userSchema = new mongoose.Schema({
  username : {
    type : String,
    required : true, 
    unique : [true, 'A unique username is required'],
    minlength : [4, 'Username must be at least 4 characters long'],
    maxlength : [30, 'Username must be at most 30 characters long'],
    trim : true, 
  },
  password : {
    type : String,
    required : true,
    minlength : [6, 'Password must be at least 6 characters long'],
    maxlength : [128, 'Password must be at most 128 characters long'],
    select: false,
  },
  role : {
    type : String, 
    enum : ['user', 'admin'],
    default : 'user'
  },

}, { timestamps: true });


module.exports = mongoose.model('User', userSchema);