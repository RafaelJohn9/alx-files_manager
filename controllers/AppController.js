/**
 * an object called AppController that is responsible for handling
 * the status and stats endpoints
 */
const redisClient = require('../utils/redis');
const { dbClient } = require('../utils/db');

const AppController = {
  getStatus: (req, res) => {
    console.log('starting status retrieval...');
    const redisStatus = redisClient.isAlive();
    const dbStatus = dbClient.isAlive();

    res.status(200).json({
      redis: redisStatus,
      db: dbStatus,
    });
  },

  getStats: async (req, res) => {
    const userCount = await dbClient.nbUsers();
    const fileCount = await dbClient.nbFiles();

    Promise.all([userCount, fileCount])
      .then((results) => {
        const [users, files] = results;

        res.status(200).json({
          users,
          files,
        });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      });
  },
};

module.exports.AppController = AppController;
