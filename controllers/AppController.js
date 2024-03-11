/**
 * an object called AppController that is responsible for handling
 * the status and stats endpoints
 */
const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

const AppController = {
  getStatus: async (req, res) => {
    const redisStatus = redisClient.isAlive();
    const dbStatus = dbClient.isAlive();
    return (res.status(200).json({ redis: redisStatus, db: dbStatus }));
  },
  getStats: async (req, res) => {
    const users = await dbClient.nbUsers();
    const files = await dbClient.nbFiles();
    return (res.status(200).json({
      users,
      files,
    }));
  },
};
module.exports = AppController;
