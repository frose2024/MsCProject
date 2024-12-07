const chai = require('chai');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const { expect } = chai;

const User = require('../../models/userModel');
const pointManagementController = require('../../controllers/pointManagementController');
const userController = require('../../controllers/userController')

process.env.NODE_ENV = 'development';

describe('userController - getUserPoints', () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: { userId: '123' }, query: { token: 'valid-token' } };
    res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    next = sinon.stub();
    sinon.stub(jwt, 'verify').returns({ userId: '123', access: 'points' });
  });

  afterEach(() => {
    sinon.restore();
  });


  it('should return points for an existing user', async () => {
    sinon.stub(User, 'findById').resolves({ points: 50 });

    await pointManagementController.getUserPoints(req, res, next);

    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith({ points: 50 })).to.be.true;
  });


  it('should return 404 if the user is not found', async () => {
    sinon.stub(User, 'findById').resolves(null);

    await pointManagementController.getUserPoints(req, res, next);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'User not found' })).to.be.true;
  });


  it('should return 401 if the token is invalid', async () => {
    jwt.verify.restore();
    sinon.stub(jwt, 'verify').throws(new jwt.JsonWebTokenError('Invalid token'));

    await pointManagementController.getUserPoints(req, res, next);

    expect(res.status.calledWith(401)).to.be.true;
    expect(res.json.calledWith({ message: 'Invalid token' })).to.be.true;
  });

  
  it('should pass errors to next if errors occur', async () => {
    sinon.stub(User, 'findById').throws(new Error('Database error'));

    await pointManagementController.getUserPoints(req, res, next);

    expect(next.calledWith(sinon.match.instanceOf(Error))).to.be.true;
  });
});


describe('userController - updateUserPoints', () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: { userId: '123' }, body: { points: 10 } };
    res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    next = sinon.stub();

    sinon.stub(jwt, 'verify').returns({ userId: '123', role: 'admin' });
    req.headers = { authorization: 'Bearer valid-token' };
  });

  afterEach(() => {
    sinon.restore();
  });


  it('should update user points for an existing user', async () => {
    const user = { points: 50, save: sinon.stub().resolves() };
    sinon.stub(User, 'findById').resolves(user);

    await pointManagementController.updateUserPoints(req, res, next);

    expect(user.points).to.equal(60); // 50 + 10
    expect(user.save.calledOnce).to.be.true;
    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith({ message: 'Points updated successfully.', newPoints: 60 })).to.be.true;
  });


  it('should return 404 if the user is not found', async () => {
    sinon.stub(User, 'findById').resolves(null);

    await pointManagementController.updateUserPoints(req, res, next);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'User not found' })).to.be.true;
  });


  it('should return 401 if the token is invalid', async () => {
    jwt.verify.restore();
    sinon.stub(jwt, 'verify').throws(new jwt.JsonWebTokenError('Invalid token'));

    req.headers = { authorization: 'Bearer invalid-token' };

    await pointManagementController.updateUserPoints(req, res, next);

    expect(res.status.calledWith(401)).to.be.true;
    expect(res.json.calledWith({ message: 'Invalid token' })).to.be.true;
  });


  it('should not allow points to be reduced below zero', async () => {
    const user = { points: 5, save: sinon.stub().resolves() };
    sinon.stub(User, 'findById').resolves(user);

    req.body.points = -10;

    await pointManagementController.updateUserPoints(req, res, next);

    expect(user.points).to.equal(5);
    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWith({ message: 'Points cannot be negative.' })).to.be.true;
  });


  it('should allow subtracting points without going below zero', async () => {
    const user = { points: 20, save: sinon.stub().resolves() };
    sinon.stub(User, 'findById').resolves(user);

    req.body.points = -10;

    await pointManagementController.updateUserPoints(req, res, next);

    expect(user.points).to.equal(10);
    expect(user.save.calledOnce).to.be.true;
    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith({ message: 'Points updated successfully.', newPoints: 10 })).to.be.true;
  });  
});


describe('pointManagementController - updateBirthday', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: { birthday: '2000-09-17' },
      user: { userId: '123' }
    };
    res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    next = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should update birthday and award points if today is the user\'s birthday and points have not been awarded in the last 365 days', async () => {
    const user = {
      birthday: new Date('2000-09-17'),
      points: 50,
      lastBirthdayAward: new Date('2022-09-17'), 
      save: sinon.stub().resolves()
    };
  
    sinon.useFakeTimers(new Date('2023-09-17').getTime()); 
    sinon.stub(User, 'findById').resolves(user);
  
    await userController.updateBirthday(req, res, next);
  
    // Debug: console.log("User points after update:", user.points); 
    // Debug: console.log("Last birthday award date:", user.lastBirthdayAward); 
  
    expect(user.points).to.equal(150);
    expect(user.lastBirthdayAward.toDateString()).to.equal(new Date().toDateString()); 
    expect(user.save.calledOnce).to.be.true;
    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith({ message: 'Birthday updated successfully.' })).to.be.true;
  });
  

  it('should not award points if birthday points were awarded within the last 365 days', async () => {
    const user = {
      birthday: new Date('2000-09-17'),
      points: 50,
      lastBirthdayAward: new Date('2023-06-01'),
      save: sinon.stub().resolves()
    };

    sinon.useFakeTimers(new Date('2023-09-17').getTime());
    sinon.stub(User, 'findById').resolves(user);

    await userController.updateBirthday(req, res, next);

    expect(user.points).to.equal(50);
    expect(user.save.calledOnce).to.be.true;
    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith({ message: 'Birthday updated successfully.' })).to.be.true;
  });

  it('should not award points if today is not the user\'s birthday', async () => {
    const user = {
      birthday: new Date('2000-09-17'),
      points: 50,
      lastBirthdayAward: new Date('2022-09-17'),
      save: sinon.stub().resolves()
    };

    sinon.useFakeTimers(new Date('2023-09-18').getTime());
    sinon.stub(User, 'findById').resolves(user);

    await userController.updateBirthday(req, res, next);

    expect(user.points).to.equal(50);
    expect(user.save.calledOnce).to.be.true;
    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith({ message: 'Birthday updated successfully.' })).to.be.true;
  });

  it('should return 404 if the user is not found', async () => {
    sinon.stub(User, 'findById').resolves(null);

    await userController.updateBirthday(req, res, next);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'User not found.' })).to.be.true;
  });
});