const chai = require('chai');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const { expect } = chai;

const User = require('../../models/userModel');
const qrController = require('../../controllers/qrController');

describe('QR Code Generation and Retrieval Tests', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { userId: 'testUserId' },
      user: { userId: 'testUserId', role: 'user' },
      query: {}
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    };
    sinon.restore();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should generate a QR code for a user with embedded points and generation count', async () => {
    const user = {
      _id: 'testUserId',
      role: 'user',
      points: 50,
      qrCodeGenerationCount: 1,
      qrCode: null,
      save: sinon.stub().resolves()
    };

    sinon.stub(User, 'findById').resolves(user);
    sinon.stub(jwt, 'sign').returns('testManagePointsToken');
    sinon.stub(QRCode, 'toDataURL').resolves('data:image/png;base64,testQRCodeData');

    await qrController.generateUserQRCode(req, res);

    expect(jwt.sign.calledOnce).to.be.true;
    expect(jwt.sign.calledWithExactly({
      userId: 'testUserId',
      points: 50,
      generationCount: 1,
      access: 'manage-points'
    }, process.env.JWT_SECRET, { expiresIn: '15m' })).to.be.true;

    expect(QRCode.toDataURL.calledOnce).to.be.true;
    expect(QRCode.toDataURL.calledWithExactly(
      'http://192.168.1.106:3000/api/admin/testUserId/manage-points?token=testManagePointsToken'
    )).to.be.true;    

    expect(user.qrCode).to.equal('data:image/png;base64,testQRCodeData');
    expect(res.json.calledOnce).to.be.true;
    expect(res.json.calledWithExactly({ qrCode: 'data:image/png;base64,testQRCodeData' })).to.be.true;
  });


  it('should allow admin to access point management with manage_points access', async () => {
    req.user.role = 'admin';
    req.query.token = 'testManagePointsToken';

    sinon.stub(jwt, 'verify').returns({
      userId: 'testUserId',
      points: 50,
      generationCount: 1,
      access: 'manage-points'
    });

    const user = { _id: 'testUserId', points: 50, qrCodeGenerationCount: 1 };
    sinon.stub(User, 'findById').resolves(user);

    await qrController.processQRCode(req, res);

    expect(jwt.verify.calledOnce).to.be.true;
    expect(jwt.verify.calledWithExactly('testManagePointsToken', process.env.JWT_SECRET)).to.be.true;

    expect(res.json.calledOnce).to.be.true;
    expect(res.json.calledWithExactly({
      message: 'Admin access granted. You can manage points.',
      userId: 'testUserId',
      points: 50,
      generationCount: 1
    })).to.be.true;
  });

  
  it('should forbid users from accessing point management', async () => {
    req.query.token = 'testManagePointsToken';
    req.user.role = 'user';

    sinon.stub(jwt, 'verify').returns({
      userId: 'testUserId',
      access: 'manage-points'
    });

    await qrController.processQRCode(req, res);

    expect(jwt.verify.calledOnce).to.be.true;
    expect(jwt.verify.calledWithExactly('testManagePointsToken', process.env.JWT_SECRET)).to.be.true;

    expect(res.status.calledOnce).to.be.true;
    expect(res.status.calledWithExactly(403)).to.be.true;
    expect(res.json.calledOnce).to.be.true;
    expect(res.json.calledWithExactly({ message: 'Access forbidden.' })).to.be.true;
  });


  it('should return an error for an invalid or expired token', async () => {
    req.query.token = 'invalidToken';

    sinon.stub(jwt, 'verify').throws(new Error('Invalid token'));

    await qrController.processQRCode(req, res);

    expect(jwt.verify.calledOnce).to.be.true;
    expect(jwt.verify.calledWithExactly('invalidToken', process.env.JWT_SECRET)).to.be.true;

    expect(res.status.calledOnce).to.be.true;
    expect(res.status.calledWithExactly(500)).to.be.true;
    expect(res.json.calledOnce).to.be.true;
    expect(res.json.calledWithExactly({ message: 'Invalid or expired token.' })).to.be.true;
  });
});
