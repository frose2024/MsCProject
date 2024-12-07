const chai = require('chai');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const { authenticate, roleAuthentication } = require('../../middleware/authMiddleware');
process.env.NODE_ENV = 'development';

const expect = chai.expect;

describe('authMiddleware - authenticate', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {
        authorization: 'Bearer validToken',
      },
      query: {},
      path: '/',
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
    next = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should allow access with a valid token from query string and Authorization header', async () => {
    req.path = '/api/admin/123/manage-points';
    req.query.token = 'validQueryToken';
    req.headers.authorization = 'Bearer validToken';

    const queryDecodedToken = { userId: '123', role: 'admin' };
    const authDecodedToken = { userId: '123', role: 'user' };

    sinon.stub(jwt, 'verify')
      .onFirstCall().returns(queryDecodedToken)
      .onSecondCall().returns(authDecodedToken);

    await authenticate(req, res, next);

    sinon.assert.calledTwice(jwt.verify);
    sinon.assert.calledWith(jwt.verify, 'validQueryToken', process.env.JWT_SECRET);
    sinon.assert.calledWith(jwt.verify, 'validToken', process.env.JWT_SECRET);

    expect(req.user).to.deep.equal({ id: '123', role: 'user' });
    expect(next.calledOnce).to.be.true;
  });

  it('should return 401 if no token is provided in either Authorization header or query string', async () => {
    req.path = '/api/user/123/generate-qr';
    req.headers.authorization = null;
    req.query.token = null;

    await authenticate(req, res, next);

    expect(res.status.calledWith(401)).to.be.true;
    expect(res.json.calledWith({ message: 'No token provided in Authorization header.' })).to.be.true;
    expect(next.called).to.be.false;
  });

  it('should return 403 if token is invalid', async () => {
    req.path = '/api/user/123/generate-qr';
    req.headers.authorization = 'Bearer invalidToken';

    sinon.stub(jwt, 'verify').throws(new Error('Invalid token'));

    await authenticate(req, res, next);

    expect(res.status.calledWith(403)).to.be.true;
    expect(res.json.calledWith({ message: 'Invalid or expired token.' })).to.be.true;
    expect(next.called).to.be.false;
  });

  it('should handle exceptions and return 403 with an appropriate message', async () => {
    req.path = '/api/user/123/generate-qr';
    req.headers.authorization = 'Bearer validToken';

    sinon.stub(jwt, 'verify').throws(new Error('Some unexpected error'));

    await authenticate(req, res, next);

    expect(res.status.calledWith(403)).to.be.true;
    expect(res.json.calledWith({ message: 'Invalid or expired token.' })).to.be.true;
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