const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/userModel');
const authController = require('../../controllers/authController');
process.env.NODE_ENV = 'test';

describe('authController - register', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {
        username: 'testUser',
        password: 'password123',
        role: 'user'
      }
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    };
    next = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });


  it('should return 400 if the username already exists', async () => {
    sinon.stub(User, 'findOne').resolves({ username: 'testUser' });

    await authController.register(req, res, next);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWith({ message: 'This username already exists'}))
  });


  it('should return 400 if the password is less than 6 or greater than 128 characters', async () => {
    sinon.stub(User, 'findOne').resolves(null);
    req.body.password = '123';

    await authController.register(req, res, next);
  
    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWith({ message: 'Sorry, your password needs to be between 6 and 128 characters long.'})).to.be.true;
  });


  it('should create a new user and hash the password', async () => {
    sinon.stub(User, 'findOne').resolves(null);
    const hashStub = sinon.stub(bcrypt, 'hash').resolves('hashedPassword');
    const saveStub = sinon.stub(User.prototype, 'save').resolves();

    await authController.register(req, res, next);

    expect(hashStub.calledWith('password123', 10)).to.be.true;
    expect(saveStub.called).to.be.true;
    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith({ message : 'A new user has been created successfully'}));
  });


  it('should pass errors to next when an error occures', async () => {
    sinon.stub(User, 'findOne').throws(new Error('Database error'));

    await authController.register(req, res, next);

    expect(next.calledWith(sinon.match.instanceOf(Error))).to.be.true;
  });


  it('should return 400 if username or password is missing', async () => {
    req.body.username = '';
    req.body.password = '';
  
    await authController.register(req, res, next);
  
    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWith({ message: 'Sorry, the password and username are required fields.' })).to.be.true;
  });
  

  it('should set role to "user" if not provided', async () => {
    req.body.role = '';
    sinon.stub(User, 'findOne').resolves(null);
    sinon.stub(bcrypt, 'hash').resolves('hashedPassword');
    const saveStub = sinon.stub(User.prototype, 'save').resolves();
  
    await authController.register(req, res, next);
  
    const savedUser = saveStub.getCall(0).thisValue;
    expect(savedUser.role).to.equal('user'); // Ensuring the role is set to 'user'
    expect(saveStub.called).to.be.true;
    expect(res.status.calledWith(201)).to.be.true;
  });
  

  it('should handle bcrypt hashing errors', async () => {
    sinon.stub(User, 'findOne').resolves(null);
    sinon.stub(bcrypt, 'hash').throws(new Error('Hashing error'));
  
    await authController.register(req, res, next);
  
    expect(next.calledWith(sinon.match.instanceOf(Error))).to.be.true;
  });

  it('should create a new user and retrieve it from the database', async function() {
    const findOneStub = sinon.stub(User, 'findOne').resolves(null);
  
    const hashStub = sinon.stub(bcrypt, 'hash').resolves('hashedPassword');
  
    const saveStub = sinon.stub(User.prototype, 'save').resolves();
  
    await authController.register(req, res, next);
  
    expect(saveStub.called).to.be.true;
    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith({ message: 'A new user has been created successfully.' })).to.be.true;
  
    findOneStub.restore();
  
    sinon.stub(User, 'findOne').resolves({
      username: 'testUser',
      password: 'hashedPassword',
      role: 'user'
    });
    const user = await User.findOne({ username: 'testUser' });
  
    expect(user).to.exist;
    expect(user.username).to.equal('testUser');
    expect(user.role).to.equal('user');
  });
  
});

describe('authController - login', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {
        username: 'testUser',
        password: 'password123'
      }
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    };
    next = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });


  it('should return 400 if the user does not exist', async () => {
    sinon.stub(User, 'findOne').returns({
      select: sinon.stub().resolves(null),
    });
  
    await authController.login(req, res, next);
  
    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWith({ message: 'Sorry, we have no record of that username.' })).to.be.true;
  });
  

  it('should return 400 if the password does not match', async () => {
    const user = { username: 'testUser', password: 'hashedPassword' };
    sinon.stub(User, 'findOne').returns({
      select: sinon.stub().resolves(user),
    });
    sinon.stub(bcrypt, 'compare').resolves(false);
  
    await authController.login(req, res, next);
  
    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWith({ message: 'Sorry, the password and username do not match.' })).to.be.true;
  });
  

  it('should generate a JWT token for valid credentials', async () => {
    const user = { _id: '123', username: 'testUser', password: 'hashedPassword', role: 'user' };
    sinon.stub(User, 'findOne').returns({
      select: sinon.stub().resolves(user),
    });
    sinon.stub(bcrypt, 'compare').resolves(true);
    const jwtStub = sinon.stub(jwt, 'sign').returns('jwtToken');
  
    await authController.login(req, res, next);
  
    expect(jwtStub.calledWith(
      { userId: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    )).to.be.true;
    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith({ token: 'jwtToken' })).to.be.true;
  });
  

  it('should return 400 if username or password is missing', async () => {
    req.body.username = '';
    req.body.password = '';

    await authController.login(req, res, next);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWith({ message: 'Sorry, the password and username are required fields.' })).to.be.true;
  });


  it('should pass errors to next when an error occurs', async () => {
    sinon.stub(User, 'findOne').throws(new Error('Database error')); 

    await authController.login(req, res, next);

    expect(next.calledWith(sinon.match.instanceOf(Error))).to.be.true;
  });


  it('should handle JWT signing errors', async () => {
    const user = { _id: '123', username: 'testUser', password: 'hashedPassword', role: 'user' };
    sinon.stub(User, 'findOne').resolves(user);
    sinon.stub(bcrypt, 'compare').resolves(true);
    sinon.stub(jwt, 'sign').throws(new Error('JWT error'));

    await authController.login(req, res, next);

    expect(next.calledWith(sinon.match.instanceOf(Error))).to.be.true;
  });
});
