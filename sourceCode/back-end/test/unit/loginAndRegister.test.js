const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../../models/userModel');
const loginAndRegistrationController = require('../../controllers/loginAndRegistrationController');
process.env.NODE_ENV = 'development';


describe('Registration tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {
        username: 'testUser',
        email: 'test@example.com',
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

    await loginAndRegistrationController.register(req, res, next);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWith({ message: 'This username already exists.' })).to.be.true;
  });


  it('should return 400 if the email already exists', async () => {
    sinon.stub(User, 'findOne').callsFake((query) => {
      if (query.email === 'test@example.com') {
        return Promise.resolve({ email: 'test@example.com' });
      }
      return Promise.resolve(null);
    });
  
    req.body.email = 'test@example.com';
    req.body.username = 'newUsername';
  
    await loginAndRegistrationController.register(req, res, next);
  
    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWith({ message: 'This email is already in use.' })).to.be.true;
  });  


  it('should return 400 if the password is less than 6 or greater than 128 characters', async () => {
    sinon.stub(User, 'findOne').resolves(null);
    req.body.password = '123';

    await loginAndRegistrationController.register(req, res, next);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWith({ message: 'Sorry, your password needs to be between 6 and 128 characters long.' })).to.be.true;
  });


  it('should create a new user and hash the password', async () => {
    sinon.stub(User, 'findOne').resolves(null);
    const hashStub = sinon.stub(bcrypt, 'hash').resolves('hashedPassword');
    const saveStub = sinon.stub(User.prototype, 'save').resolves();

    await loginAndRegistrationController.register(req, res, next);

    expect(hashStub.calledWith('password123', 10)).to.be.true;
    expect(saveStub.called).to.be.true;
    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith({ message: 'A new user has been created successfully.' })).to.be.true;
  });


  it('should pass errors to next when an error occurs', async () => {
    sinon.stub(User, 'findOne').throws(new Error('Database error'));

    await loginAndRegistrationController.register(req, res, next);

    expect(next.calledWith(sinon.match.instanceOf(Error))).to.be.true;
  });


  it('should return 400 if username, password, or email is missing', async () => {
    req.body.username = '';
    req.body.password = '';
    req.body.email = '';

    await loginAndRegistrationController.register(req, res, next);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWith({ message: 'Sorry, password, username and email are required fields.' })).to.be.true;
  });


  it('should set role to "user" if not provided', async () => {
    req.body.role = '';
    sinon.stub(User, 'findOne').resolves(null);
    sinon.stub(bcrypt, 'hash').resolves('hashedPassword');
    const saveStub = sinon.stub(User.prototype, 'save').resolves();

    await loginAndRegistrationController.register(req, res, next);

    const savedUser = saveStub.getCall(0).thisValue;
    expect(savedUser.role).to.equal('user');
    expect(saveStub.called).to.be.true;
    expect(res.status.calledWith(201)).to.be.true;
  });


  it('should handle bcrypt hashing errors', async () => {
    sinon.stub(User, 'findOne').resolves(null);
    sinon.stub(bcrypt, 'hash').throws(new Error('Hashing error'));

    await loginAndRegistrationController.register(req, res, next);

    expect(next.calledWith(sinon.match.instanceOf(Error))).to.be.true;
  });
});


describe('Login tests', () => {
  let req, res, next;

  beforeEach(async () => {
    await User.deleteMany({ username: { $in: ['testUser', 'testUser2'] } });

    req = {
      body: {
        identifier: 'testUser', 
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

    await loginAndRegistrationController.login(req, res, next);

    console.log('User not found test:', {
      statusCalledWith: res.status.args,
      jsonCalledWith: res.json.args
    });

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWith({ message: 'Sorry, we have no record of that user.' })).to.be.true;
  });

  it('should return 400 if the password does not match', async () => {
    const user = { username: 'testUser', password: 'hashedPassword' };
    sinon.stub(User, 'findOne').returns({
      select: sinon.stub().resolves(user),
    });
    sinon.stub(bcrypt, 'compare').resolves(false);

    await loginAndRegistrationController.login(req, res, next);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWith({ message: 'Incorrect password.' })).to.be.true;
  });


  it('should generate a JWT token for valid credentials', async () => {
    const user = { _id: '123', username: 'testUser', password: 'hashedPassword', role: 'user' };
    sinon.stub(User, 'findOne').returns({
      select: sinon.stub().resolves(user),
    });
    sinon.stub(bcrypt, 'compare').resolves(true);
    const jwtStub = sinon.stub(jwt, 'sign').returns('jwtToken');

    await loginAndRegistrationController.login(req, res, next);

    expect(jwtStub.calledWith(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )).to.be.true;
    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith(sinon.match.has('token', 'jwtToken'))).to.be.true;
  });


  it('should return 400 if identifier or password is missing', async () => {
    req.body.identifier = '';
    req.body.password = '';

    await loginAndRegistrationController.login(req, res, next);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWith({ message: 'Username or email are required fields.' })).to.be.true;
  });


  it('should pass errors to next when an error occurs', async () => {
    sinon.stub(User, 'findOne').throws(new Error('Database error'));

    await loginAndRegistrationController.login(req, res, next);

    expect(next.calledWith(sinon.match.instanceOf(Error))).to.be.true;
  });


  it('should handle JWT signing errors', async () => {
    const user = { _id: '123', username: 'testUser', password: 'hashedPassword', role: 'user' };
    sinon.stub(User, 'findOne').returns({
      select: sinon.stub().resolves(user),
    });
    sinon.stub(bcrypt, 'compare').resolves(true);
    sinon.stub(jwt, 'sign').throws(new Error('JWT error'));

    await loginAndRegistrationController.login(req, res, next);

    expect(next.calledWith(sinon.match.instanceOf(Error))).to.be.true;
  });


  it('should allow login with either username or email', async () => {
    const testUser = new User({
      username: 'testUser',
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'user'
    });
    await testUser.save();

    const jwtStub = sinon.stub(jwt, 'sign').returns('testToken');
    
    req.body = { identifier: 'testUser', password: 'password123' };
    await loginAndRegistrationController.login(req, res, next);

    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith(sinon.match.has('token', 'testToken'))).to.be.true;
  
    res.status.resetHistory();
    res.json.resetHistory();
  
    req.body = { identifier: 'test@example.com', password: 'password123' };
    await loginAndRegistrationController.login(req, res, next);

    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith(sinon.match.has('token', 'testToken'))).to.be.true;

    jwtStub.restore();
  });
});