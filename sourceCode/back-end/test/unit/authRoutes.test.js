const chai = require('chai');
const sinon = require('sinon');
const supertest = require('supertest');
const bcrypt = require('bcryptjs');
const { expect } = chai;

const app = require('../../server');
const loginAndRegistrationController = require('../../controllers/loginAndRegistrationController');
const authMiddleware = require('../../middleware/authMiddleware');
const userController = require('../../controllers/userController');
const User = require('../../models/userModel');

let server;


describe('Auth Routes Tests', () => {

  before((done) => {
    server = app.listen(4000, () => {
      console.log('Test server started on port 4000');
      done();
    });
  });
  
  beforeEach(async () => {
    await User.deleteMany({ username: { $in: ['testUser', 'testUser2'] } });
  });

  afterEach(async () => {
    sinon.restore();

    await User.deleteMany({ username: { $in: ['testUser', 'testUser2'] } });
  });

  after((done) => {
    if (server) {
      console.log('Shutting down the test server...');
      server.close(done);
    }
  });

  beforeEach(() => {
    sinon.stub(authMiddleware, 'authenticate').callsFake((req, res, next) => {
      req.user = { userId: 'testUserId', role: 'user' }; 
      console.log('Stubbed authenticate called, req.user:', req.user); 
      next();
    });
  });  


  it('should call loginAndRegistrationController.login when POST /login is hit', async () => {
    console.log("Creating test user in database...");
    await new User({
      username: 'testUser',
      password: await bcrypt.hash('password123', 10),
      role: 'user',
      email: 'email@123.com'
    }).save();
  
    sinon.stub(loginAndRegistrationController, 'login').callsFake((req, res) => {
      console.log('Login controller hit');
      res.status(200).json({ token: 'dummyToken' });
    });
  
    console.log("Sending login request...");
    const res = await supertest(server)
      .post('/api/auth/login')
      .send({ identifier: 'testUser', password: 'password123' })
      .expect(200);

    console.log("Login response:", res.body);
    expect(res.body).to.have.property('token');
  });
  


  it('should call loginAndRegistrationController.register when POST /register is hit', (done) => {
    sinon.stub(loginAndRegistrationController, 'register').callsFake((req, res) => {
      console.log('Register controller hit');
      res.status(201).json({ message: 'A new user has been created successfully.' });
    });

    console.log("Sending register request...");
    supertest(server)
      .post('/api/auth/register')
      .send({ username: 'testUser2', email: 'test2@example.com', password: 'password123' })
      .expect(201)
      .end((err, res) => {
        if (err) {
          console.error("Error during register test:", err);
          return done(err); 
        }
        console.log("Register response:", res.body);
        expect(res.body).to.have.property('message', 'A new user has been created successfully.');
        done();
      });
  });


  it('should call userController.getProfile when GET /profile is hit', async () => {
    console.log("Creating test user in database for profile test...");
    const savedUser = await new User({
      username: 'testUser',
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'user'
    }).save();
  
    console.log("Logging in to get token...");
    const loginRes = await supertest(server)
      .post('/api/auth/login')
      .send({ identifier: 'testUser', password: 'password123' });

    const token = loginRes.body.token;
    console.log("Login token received:", token);
  
    sinon.stub(userController, 'getProfile').callsFake((req, res) => {
      console.log('Profile controller hit');
      res.status(200).json({ username: savedUser.username });
    });
  
    console.log("Sending profile request...");
    const profileRes = await supertest(server)
      .get('/api/user/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    console.log("Profile response:", profileRes.body);
    expect(profileRes.body).to.have.property('username', 'testUser');
  });
  

  it('should return 404 for undefined routes', (done) => {
    console.log("Sending undefined route request...");
    supertest(server)
      .get('/api/unknown-route')
      .expect(404)
      .end((err, res) => {
        if (err) {
          console.error("Error during undefined route test:", err);
          return done(err);
        }
        console.log("Undefined route response:", res.body);
        expect(res.body).to.have.property('message', 'Route not found');
        done();
      });
  });
});