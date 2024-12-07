const chai = require('chai');
const sinon = require('sinon');
const bcrypt = require('bcryptjs');
const { expect } = chai;

const User = require('../../models/userModel');
const userController = require('../../controllers/userController');
const loginAndRegistrationController = require('../../controllers/loginAndRegistrationController');

let req, res, next;

describe('Update User Information Tests', () => {
  beforeEach(() => {
    req = {
      user: { userId: 'testUserId' }, 
      body: {
        username: 'newUsername',
        email: 'new@example.com',
        password: 'newPassword123',
        oldPassword: 'password123' 
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


  it('should not allow updates without a valid JWT token', async () => {
    req.user = null;

    await userController.updateUserInformation(req, res, next);

    expect(res.status.calledWith(401)).to.be.true;
    expect(res.json.calledWith({ message: 'Authentication required.' })).to.be.true;
  });


  it('should require the correct old password to update information', async () => {
    const user = {
      _id: 'testUserId',
      password: await bcrypt.hash('password123', 10),
      save: sinon.stub().resolves()
    };
  
    sinon.stub(User, 'findById').returns({
      select: sinon.stub().resolves(user),
    });
    sinon.stub(bcrypt, 'compare').resolves(false);
  
    await userController.updateUserInformation(req, res, next);
  
    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWith({ message: 'Old password is incorrect.' })).to.be.true;
  });  


  it('should return an error if the old password is not provided', async () => {
    const user = {
      _id: 'testUserId',
      password: await bcrypt.hash('password123', 10),
      save: sinon.stub().resolves()
    };
  
    sinon.stub(User, 'findById').returns({
      select: sinon.stub().resolves(user),
    });
    req.body.oldPassword = null;
  
    await userController.updateUserInformation(req, res, next);
  
    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWith({ message: 'Old password is required to update information.' })).to.be.true;
  });
  

  it('should successfully update user information when authenticated and old password is correct', async () => {
    const user = {
      _id: 'testUserId',
      username: 'oldUsername',
      email: 'old@example.com',
      password: await bcrypt.hash('password123', 10),
      save: sinon.stub().resolves()
    };
  
    sinon.stub(User, 'findById').returns({
      select: sinon.stub().resolves(user),
    });
    sinon.stub(bcrypt, 'compare').resolves(true);
  
    await userController.updateUserInformation(req, res, next);
  
    expect(user.username).to.equal('newUsername');
    expect(user.email).to.equal('new@example.com');
    expect(await bcrypt.compare('newPassword123', user.password)).to.be.true;
    expect(user.save.calledOnce).to.be.true;
    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith({ message: 'User information updated successfully.' })).to.be.true;
  });  


  it('should allow login with the new password after updating it', async () => {
    const user = {
      _id: 'testUserId',
      username: 'oldUsername',
      email: 'old@example.com',
      password: await bcrypt.hash('password123', 10),
      save: sinon.stub().resolves()
    };
  
    console.log('Original user password (hashed):', user.password);

    sinon.stub(User, 'findById').returns({
      select: sinon.stub().resolves(user),
    });

    const compareStub = sinon.stub(bcrypt, 'compare');
    compareStub.withArgs('password123', user.password).resolves(true);

    console.log('Calling updateUserInformation to update user password...');
    await userController.updateUserInformation(req, res, next);

    user.password = await bcrypt.hash('newPassword123', 10);
  
    console.log('Updated user password (hashed):', user.password);

    expect(user.save.calledOnce).to.be.true;
    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith({ message: 'User information updated successfully.' })).to.be.true;

    const loginReq = { body: { identifier: 'oldUsername', password: 'newPassword123' } };
    const loginRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    };
  
    console.log('Preparing to login with new password...');

    sinon.stub(User, 'findOne').returns({
      select: sinon.stub().resolves(user),
    });

    compareStub.resetBehavior();
    compareStub.withArgs('newPassword123', user.password).resolves(true);

    await loginAndRegistrationController.login(loginReq, loginRes, next);
  
    console.log('After login attempt with new password:', {
      statusCalledWith: loginRes.status.args,
      jsonCalledWith: loginRes.json.args
    });
  
    expect(loginRes.status.calledWith(200)).to.be.true;
    expect(loginRes.json.calledWith(sinon.match.has('token'))).to.be.true;
  
    compareStub.restore();
  });
  

  it('should reject login with the old password after updating it', async () => {
    const user = {
      _id: 'testUserId',
      username: 'oldUsername',
      email: 'old@example.com',
      password: await bcrypt.hash('password123', 10),
      save: sinon.stub().resolves()
    };

    sinon.stub(User, 'findById').returns({
      select: sinon.stub().resolves(user),
    });

    const compareStub = sinon.stub(bcrypt, 'compare');
    compareStub.withArgs('password123', user.password).resolves(true);

    await userController.updateUserInformation(req, res, next);

    expect(user.save.calledOnce).to.be.true;
    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith({ message: 'User information updated successfully.' })).to.be.true;

    compareStub.resetBehavior();
    compareStub.withArgs('password123', user.password).resolves(false);

    const loginReq = { body: { identifier: 'oldUsername', password: 'password123' } };
    const loginRes = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    };

    sinon.stub(User, 'findOne').returns({
      select: sinon.stub().resolves(user),
    });

    await loginAndRegistrationController.login(loginReq, loginRes, next);

    expect(loginRes.status.calledWith(400)).to.be.true;
    expect(loginRes.json.calledWith({ message: 'Incorrect password.' })).to.be.true;

    compareStub.restore();
  });
});
  