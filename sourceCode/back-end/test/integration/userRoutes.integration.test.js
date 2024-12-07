const chai = require('chai');
const supertest = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { expect } = chai;
const mongoose = require('mongoose');

const app = require('../../server');
const User = require('../../models/userModel');
const Menu = require('../../models/menuModel');
process.env.NODE_ENV = 'test';

let server;

describe('/user Integration Tests', () => {
  before((done) => {
    server = app.listen(4000, () => done());
  });

  after((done) => {
    server.close(done);
  });

  let testUser;
  let token;

  beforeEach(async () => {
    await User.deleteMany({});
    await Menu.deleteMany({});
    testUser = await User.create({
      username: 'testUser',
      email: 'test@example.com',
      password: bcrypt.hashSync('password123', 10),
      role: 'user',
      points: 50,
      birthday: new Date('1990-01-01'),
      lastBirthdayAward: null,
    });

    token = jwt.sign({ userId: testUser._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Menu.deleteMany({});
  });


  describe('GET /user/profile', () => {
    it('should fetch the user profile successfully', async () => {
      const res = await supertest(server)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('username', 'testUser');
    });

    it('should return 401 for unauthenticated requests', async () => {
      const res = await supertest(server).get('/api/user/profile');

      expect(res.status).to.equal(401);
      expect(res.body.message).to.equal('No token provided in Authorization header.');
    });

    it('should return 404 for a non-existing user', async () => {
      await User.deleteMany({});
      const res = await supertest(server)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).to.equal(404);
      expect(res.body.message).to.equal('User not found.');
    });
  });


  describe('PUT /user/birthday', () => {
    it('should update the birthday and award points if today is the birthday', async () => {
      const today = new Date();
      const formattedToday = today.toISOString().split('T')[0];

      const res = await supertest(server)
        .put('/api/user/birthday')
        .send({ birthday: formattedToday })
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal('Birthday updated successfully.');

      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.points).to.equal(150); // 50 + 100
      expect(updatedUser.lastBirthdayAward).to.exist;
    });

    it('should not award points if it’s not the user’s birthday', async () => {
      const res = await supertest(server)
        .put('/api/user/birthday')
        .send({ birthday: '1990-01-01' }) // Not today
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal('Birthday updated successfully.');

      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.points).to.equal(50); // No change
    });

    it('should return 400 for an invalid birthday format', async () => {
      const res = await supertest(server)
        .put('/api/user/birthday')
        .send({ birthday: 'invalid-date' })
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal('Invalid birthday format.');
    });
  });

  
  describe('PUT /user/update', () => {
    it('should update user information with valid old password', async () => {
      const res = await supertest(server)
        .put('/api/user/update')
        .send({ oldPassword: 'password123', username: 'updatedUser', email: 'updated@example.com' })
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal('User information updated successfully.');

      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.username).to.equal('updatedUser');
      expect(updatedUser.email).to.equal('updated@example.com');
    });

    it('should return 400 for invalid old password', async () => {
      const res = await supertest(server)
        .put('/api/user/update')
        .send({ oldPassword: 'wrongPassword', username: 'updatedUser' })
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal('Old password is incorrect.');
    });

    it('should return 400 for invalid update payload', async () => {
      const res = await supertest(server)
        .put('/api/user/update')
        .send({})
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal('Old password is required to update information.');
    });
  });


  describe('GET /user/:userId/generate-qr', () => {
    it('should generate a QR code for a valid user', async () => {
      const res = await supertest(server)
        .get(`/api/user/${testUser._id}/generate-qr`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('qrCode');
    });

    it('should return 403 if the user is not a regular user', async () => {
      await User.updateOne({ _id: testUser._id }, { role: 'admin' });

      const res = await supertest(server)
        .get(`/api/user/${testUser._id}/generate-qr`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).to.equal(403);
      expect(res.body.message).to.equal('QR code generation is for users only.');
    });

    it('should return 404 for an invalid user ID', async () => {
      const invalidUserId = new mongoose.Types.ObjectId();

      const res = await supertest(server)
        .get(`/api/user/${invalidUserId}/generate-qr`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).to.equal(404);
      expect(res.body.message).to.equal('User not found.');
    });
  });


  describe('GET /user/menu/view', () => {

    it('should return the latest menu if it exists', async () => {
      const testMenu = await Menu.create({
        url: 'http://example.com/menu.pdf',
        uploadedBy: testUser._id,
      });

      const res = await supertest(server)
        .get('/api/user/menu/view')
        .set('Authorization', `Bearer ${token}`);
  
      expect(res.status).to.equal(200);
      expect(res.body.menu.url).to.equal(testMenu.url);
    });
  

    it('should return 404 if no menu exists', async () => {
      await Menu.deleteMany({});
  
      const res = await supertest(server)
        .get('/api/user/menu/view')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).to.equal(404);
      expect(res.body.message).to.equal('No menu found.');
    });
  });  
});
