/**
 * controls authorization of users
 */
const uuid = require('uuid');
const { dbClient, hashPassword } = require('../utils/db');
const redisClient = require('../utils/redis');

const AuthController = {
  getConnect: async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    // Get the email and password from the Authorization header
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [email, password] = credentials.split(':');

    // If the email or password are missing, return a 401 status code
    if (!email || !password) {
      return res.status(401).send('No credentials provided');
    }

    // Find the user in the database
    const user = await dbClient.findUserByEmail(email);

    if (user) {
      // Compare the password with the hashed password
      const hashedPassword = hashPassword(password);

      if (user.password === hashedPassword) {
        const token = uuid.v4();

        // Store the token in Redis with an expiration of 24 hours
        redisClient.set(`auth_${token}`, user._id.toString(), 86400);

        // Return the token in the response
        res.setHeader('X-Token', token);

        // Return a 200 status code
        return res.status(200).json({ token });
      }
    } else {
      console.log('error in password verification');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Add a return statement here
    return res.status(401).json({ error: 'Unauthorized' });
  },

  getDisconnect: async (req, res) => {
    const token = req.headers['X-Token'];
    if (await !redisClient.get(`auth_${token}`)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    await redisClient.del(`auth_${token}`);
    return res.status(204).send();
  },
};

module.exports = AuthController;
