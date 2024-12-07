const chai = require('chai');
const sinon = require('sinon');
const supertest = require('supertest');
const fs = require('fs');
const path = require('path');
const { expect } = chai;

const app = require('../../server');
const { closeDB } = require('../../config/db');

process.env.NODE_ENV = 'development';

let server;

describe('Server Tests', () => {

  before((done) => {
    server = app.listen(4000, () => {
      console.log('Test server started on port 4000');
      done();
    });
  });

  afterEach(() => {
    sinon.restore();
  });


  it('should connect to the database and start the server', (done) => {
    supertest(server)
      .get('/api/auth/register')
      .expect(404, done);
  });


  it('should return 400 when registering without required fields', (done) => {
    supertest(server)
      .post('/api/auth/register')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.have.property('message');
        done();
      });
  });


  it('should return 400 when logging in without credentials', (done) => {
    supertest(server)
      .post('/api/auth/login') 
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.have.property('message');
        done();
      });
  });


  it('should return 404 for undefined routes', (done) => {
    supertest(server)
      .get('/undefined-route')
      .expect(404)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.have.property('message', 'Route not found');
        done();
      });
  });


  it('should log error details to error.log and return 500 for unhandled errors', (done) => {
    const errorLogPath = path.join(__dirname, '../../error.log');

    const fsStub = sinon.stub(fs, 'appendFile').yields(null);

    const consoleErrorStub = sinon.stub(console, 'error');

    supertest(server)
      .get('/api/trigger-error')
      .expect(500)
      .end((err, res) => {
        if (err) return done(err);

        expect(fsStub.called).to.be.true;
        expect(consoleErrorStub.called).to.be.true;
        expect(res.text).to.equal('Something has gone awry.');
        consoleErrorStub.restore();
        done();
      });
  });

  after((done) => {
    if (server) {
      console.log('Shutting down the test server...');
      server.close(() => {
        console.log('Test server shut down');
        closeDB().then(() => {
          console.log('MongoDB connection closed');
          done();
        }).catch((err) => {
          console.error('Error closing MongoDB connection:', err);
          done(err);
        });
      });
    } else {
      done();
    }
  });

});