/**
 * redis module
 */
import * as redis from 'redis';

class RedisClient {
  constructor() {
    this.client = redis.createClient();
    this.client.on('error', (error) => {
      console.error(error);
    });
  }

  isAlive() {
    return this.client.connected;
  }

  async get(key) {
    if (typeof (key) !== 'string') {
      return;
    }
    // eslint-disable-next-line consistent-return
    return (
      new Promise((resolve, reject) => {
        this.client.get(key, (err, reply) => {
          if (err) {
            reject(null);
          } else {
            resolve(reply);
          }
        });
      }));
  }

  async set(key, value, duration) {
    if (typeof (key) !== 'string') {
      return;
    }
    // eslint-disable-next-line consistent-return
    return new Promise((resolve, reject) => {
      this.client.setex(key, duration, value, (err, reply) => {
        if (err) {
          reject(null);
        } else {
          resolve(reply);
        }
      });
    });
  }

  async del(key) {
    if (typeof (key) !== 'string') {
      return;
    }
    // eslint-disable-next-line consistent-return
    return (new Promise((resolve, reject) => {
      this.client.del(key, (err, reply) => {
        if (err) {
          reject(null);
        } else {
          resolve(reply);
        }
      });
    }));
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;
