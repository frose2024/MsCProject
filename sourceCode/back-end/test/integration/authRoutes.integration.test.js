const chai = require('chai');
const supertest = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { expect } = chai;
const mongoose = require('mongoose');

const app = require('../../server');
const User = require('../../models/userModel');
const Admin = require('../../models/adminModel');
process.env.NODE_ENV = 'test';

let server;

describe('/api/auth Integration Tests', () => {
  before((done) => {
    server = app.listen(4000, () => done());
  });

  after((done) => {
    server.close(done);
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Admin.deleteMany({});
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Admin.deleteMany({});
  });


  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await supertest(server)
        .post('/api/auth/register')
        .send({
          username: 'newUser',
          email: 'new@example.com',
          password: 'password123',
        });

      expect(res.status).to.equal(201);
      expect(res.body.message).to.equal('A new user has been created successfully.');
      const user = await User.findOne({ username: 'newUser' });
      expect(user).to.exist;
    });

    it('should return 400 if username already exists', async () => {
      await User.create({
        username: 'existingUser',
        email: 'existing@example.com',
        password: bcrypt.hashSync('password123', 10),
      });

      const res = await supertest(server)
        .post('/api/auth/register')
        .send({
          username: 'existingUser',
          email: 'new@example.com',
          password: 'password123',
        });

      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal('This username already exists.');
    });

    it('should return 400 if email already exists', async () => {
      await User.create({
        username: 'uniqueUser',
        email: 'existing@example.com',
        password: bcrypt.hashSync('password123', 10),
      });

      const res = await supertest(server)
        .post('/api/auth/register')
        .send({
          username: 'newUser',
          email: 'existing@example.com',
          password: 'password123',
        });

      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal('This email is already in use.');
    });

    it('should return 400 if password is too short', async () => {
      const res = await supertest(server)
        .post('/api/auth/register')
        .send({
          username: 'newUser',
          email: 'new@example.com',
          password: '123',
        });

      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal(
        'Sorry, your password needs to be between 6 and 128 characters long.'
      );
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await supertest(server).post('/api/auth/register').send({});

      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal(
        'Sorry, password, username and email are required fields.'
      );
    });
  });


  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await User.create({
        username: 'testUser',
        email: 'test@example.com',
        password: bcrypt.hashSync('password123', 10),
        role: 'user',
      });

      await Admin.create({
        username: 'adminUser',
        email: 'admin@example.com',
        password: bcrypt.hashSync('adminPass123', 10),
        role: 'admin',
      });
    });

    it('should login a user with valid credentials', async () => {
      const res = await supertest(server)
        .post('/api/auth/login')
        .send({ identifier: 'testUser', password: 'password123' });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('token');
      expect(res.body).to.have.property('userId');
      expect(res.body).to.have.property('role', 'user');
    });

    it('should login an admin with valid credentials', async () => {
      const res = await supertest(server)
        .post('/api/auth/login')
        .send({ identifier: 'adminUser', password: 'adminPass123' });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('token');
      expect(res.body).to.have.property('userId');
      expect(res.body).to.have.property('role', 'admin');
    });

    it('should return 400 if username/email does not exist', async () => {
      const res = await supertest(server)
        .post('/api/auth/login')
        .send({ identifier: 'nonExistentUser', password: 'password123' });

      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal('Sorry, we have no record of that user.');
    });

    it('should return 400 if password is incorrect', async () => {
      const res = await supertest(server)
        .post('/api/auth/login')
        .send({ identifier: 'testUser', password: 'wrongPassword' });

      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal('Incorrect password.');
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await supertest(server).post('/api/auth/login').send({});

      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal('Username or email are required fields.');
    });
  });
});
