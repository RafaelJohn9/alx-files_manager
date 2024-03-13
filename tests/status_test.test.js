/* eslint-disable jest/valid-expect */
/* eslint-disable jest/no-truthy-falsy */
/**
 * checks for the response status for the api
 * makes sure the db and redis-client is online
 */

const assert = require('assert');
const request = require('supertest');
const { expect } = require('chai');
const { app } = require('../server');

describe('server Status', () => {
  it('should return status 200 and validate all items in the JSON object', () => new Promise((done) => {
    request(app)
      .get('/status')
      .expect(200)
    // eslint-disable-next-line consistent-return
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.be.an('object');
        // Validate all items in the JSON object
        Object.entries(res.body).forEach(([key, value]) => {
          // eslint-disable-next-line no-unused-expressions
          assert(value, `The key ${key} has a value ${value} that evaluates to false`);
        });
        done();
      });
  }));
});
