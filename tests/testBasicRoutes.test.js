/* eslint-disable jest/prefer-expect-assertions */
/* eslint-disable jest/valid-expect */
import * as chai from 'chai';

const sinon = require('sinon');
const chaiHttp = require('chai-http');
const { app } = require('../server');
// Assuming this is the file where your routes are defined
chai.use(chaiHttp);
const { expect } = chai;

describe('basic Routes', () => {
  describe('gET /status', () => {
    it('should return status 200', async () => {
      expect.hasAssertions();
      const response = await chai.request(app).get('/status');
      expect(response.status).toBe(200);
    });
  });

  describe('gET /stats', () => {
    it('should return status 200', async () => {
      expect.hasAssertions();
      const response = await chai.request(app).get('/stats');
      expect(response.status).toBe(200);
    });
  });

  describe('pOST /users', () => {
    it('should create a new user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: 'password123',
      };

      const response = await chai.request(app).post('/users').send(userData);
      expect(response).to.have.status(200);
      expect(response.body).to.have.property('message').equal('User created successfully');
      expect(response.body).to.have.property('user');
    });
  });

  describe('gET /connect', () => {
    it('should connect to the server', async () => {
      const response = await chai.request(app).get('/connect');
      expect(response).to.have.status(200);
      expect(response.body).to.have.property('message').equal('Connected to the server');
    });
  });

  describe('gET /disconnect', () => {
    it('should disconnect from the server', async () => {
      const response = await chai.request(app).get('/disconnect');
      expect(response).to.have.status(200);
      expect(response.body).to.have.property('message').equal('Disconnected from the server');
    });
  });

  describe('gET /users/me', () => {
    it('should get the current user', async () => {
      const user = {
        id: '123',
        name: 'John Doe',
        email: 'johndoe@example.com',
      };

      // Stub the authentication middleware to return the user
      sinon.stub(app, 'authenticate').callsFake((req, res, next) => {
        req.user = user;
        next();
      });

      const response = await chai.request(app).get('/users/me');
      expect(response).to.have.status(200);
      expect(response.body).to.have.property('user').deep.equal(user);

      // Restore the original authentication middleware
      app.authenticate.restore();
    });
  });
});
