const chai = require('chai');
const supertest = require('supertest');
const jwt = require('jsonwebtoken');
const { expect } = chai;
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const app = require('../../server');
const User = require('../../models/userModel');
const Admin = require('../../models/adminModel');
const Menu = require('../../models/menuModel');

let server;

describe('/admin Integration Tests', () => {
  before((done) => {
    server = app.listen(4000, () => done());
  });

  after((done) => {
    server.close(done);
  });

  let adminToken, testAdmin, testUser;

  beforeEach(async () => {
    await User.deleteMany({});
    await Admin.deleteMany({});
    await Menu.deleteMany({});

    testAdmin = await Admin.create({
      username: 'adminUser',
      email: 'admin@example.com',
      password: 'adminPass',
      role: 'admin',
    });

    testUser = await User.create({
      username: 'testUser',
      email: 'user@example.com',
      password: 'userPass',
      role: 'user',
      points: 50,
    });

    adminToken = jwt.sign({ userId: testAdmin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Admin.deleteMany({});
    await Menu.deleteMany({});
  });

  describe('GET /:userId/manage-points', () => {
    it('should process a valid QR code and allow admin access', async () => {
      const qrToken = jwt.sign(
        { userId: testUser._id, points: testUser.points, generationCount: 1, access: 'manage-points' },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      const res = await supertest(server)
        .get(`/api/admin/${testUser._id}/manage-points`)
        .query({ token: qrToken })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal('Admin access granted. You can manage points.');
      expect(res.body.userId).to.equal(String(testUser._id));
    });

    it('should return 403 for a QR code with invalid access', async () => {
      const qrToken = jwt.sign({ userId: testUser._id, access: 'view' }, process.env.JWT_SECRET, { expiresIn: '15m' });

      const res = await supertest(server)
        .get(`/api/admin/${testUser._id}/manage-points`)
        .query({ token: qrToken })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(403);
      expect(res.body.message).to.equal("Sorry, you don't have the correct permissions for that.");
    });

    it('should return 404 for a non-existent user', async () => {
      const invalidUserId = new mongoose.Types.ObjectId();
      const qrToken = jwt.sign({ userId: invalidUserId, access: 'manage-points' }, process.env.JWT_SECRET, { expiresIn: '15m' });

      const res = await supertest(server)
        .get(`/api/admin/${invalidUserId}/manage-points`)
        .query({ token: qrToken })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(404);
      expect(res.body.message).to.equal('User not found.');
    });
  });


  describe('POST /:userId/manage-points', () => {
    it('should update points successfully and regenerate QR code', async () => {
      const queryToken = jwt.sign(
        { userId: testUser._id, role: 'admin', access: 'manage-points' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
  
      const headerToken = jwt.sign(
        { userId: testAdmin._id, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
  
      const res = await supertest(server)
        .post(`/api/admin/${testUser._id}/manage-points`)
        .query({ token: queryToken }) // Query token for `manage-points`
        .set('Authorization', `Bearer ${headerToken}`) // Header token for admin verification
        .send({ points: 10 }); // Add points
  
      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal('Points updated successfully.');
      expect(res.body.newPoints).to.equal(60); // Initial points + added points
    });
  
    it('should return 400 if new points are negative', async () => {
      const queryToken = jwt.sign(
        { userId: testUser._id, role: 'admin', access: 'manage-points' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
  
      const headerToken = jwt.sign(
        { userId: testAdmin._id, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
  
      const res = await supertest(server)
        .post(`/api/admin/${testUser._id}/manage-points`)
        .query({ token: queryToken })
        .set('Authorization', `Bearer ${headerToken}`)
        .send({ points: -100 });
  
      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal('Points cannot be negative.');
    });
  
    it('should return 404 for a non-existent user', async () => {
      const invalidUserId = new mongoose.Types.ObjectId();
      const queryToken = jwt.sign(
        { userId: invalidUserId, role: 'admin', access: 'manage-points' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
  
      const headerToken = jwt.sign(
        { userId: testAdmin._id, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
  
      const res = await supertest(server)
        .post(`/api/admin/${invalidUserId}/manage-points`)
        .query({ token: queryToken })
        .set('Authorization', `Bearer ${headerToken}`)
        .send({ points: 10 });
  
      expect(res.status).to.equal(404);
      expect(res.body.message).to.equal('User not found.');
    });
  });
  

  describe('POST /menu/upload', () => {
    it('should upload a valid menu file', async () => {
      const filePath = path.resolve(__dirname, '../fixtures/testMenu.png');

      const res = await supertest(server)
        .post('/api/admin/menu/upload')
        .attach('file', filePath)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal('Menu uploaded successfully');
      expect(res.body.menu.url).to.include('/uploads/');
    });

    it('should return 400 if no file is uploaded', async () => {
      const res = await supertest(server)
        .post('/api/admin/menu/upload')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal('No file uploaded.');
    });
  });
});
