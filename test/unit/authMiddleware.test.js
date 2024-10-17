const chai = require('chai');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const { authenticate, roleAuthentication } = require('../../middleware/authMiddleware');
process.env.NODE_ENV = 'test';


const expect = chai.expect;

describe('authMiddleware - authenticate', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      header: sinon.stub().returns('Bearer validToken')
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


  it('should allow access with a valid token', async () => {
    const decodedToken = { userId: '123', role: 'user' };
    sinon.stub(jwt, 'verify').returns(decodedToken);

    await authenticate(req, res, next);

    expect(jwt.verify.calledWith('validToken', process.env.JWT_SECRET)).to.be.true;
    expect(req.user).to.equal(decodedToken);
    expect(next.calledOnce).to.be.true;
  });

  
  it('should return 401 if no token is provided', async () => {
    req.header = sinon.stub().returns(null); // Simulate no token provided
    await authenticate(req, res, next);
  
    expect(res.status.calledWith(401)).to.be.true;
    expect(res.json.calledWith({ message: 'No JWT token was found. Authentication unsuccessful.' })).to.be.true;
    expect(next.called).to.be.false;
  });
  


  it('should return 401 if token is invalid', async () => {
    req.header = sinon.stub().returns('Bearer invalidToken'); // Simulate invalid token
    sinon.stub(jwt, 'verify').throws(new Error('Invalid token')); // Simulate JWT verification failure
  
    await authenticate(req, res, next);
  
    expect(res.status.calledWith(401)).to.be.true;
    expect(res.json.calledWith({ message: 'Invalid token, authorization unsuccessful.' })).to.be.true;
    expect(next.called).to.be.false;
  });  
});

describe('authMiddleware - roleAuthentication', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { role: 'user' }
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    };
    next = sinon.stub();
  });


  it('should allow access if user has the correct role', async () => {
    const roleAuth = roleAuthentication('user');

    await roleAuth(req, res, next);

    expect(next.calledOnce).to.be.true;
  });


  it("should return 403 if user doesn't have the correct role", async () => {
    const roleAuth = roleAuthentication('admin');
    await roleAuth(req, res, next);

    expect(res.status.calledWith(403)).to.be.true;
    expect(res.json.calledWith({ message: "Sorry, you don't have the correct permissions for that." })).to.be.true;
    expect(next.called).to.be.false;
  });
});
