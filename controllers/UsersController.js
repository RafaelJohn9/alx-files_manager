/**
 * @api {post} /users Create a new user
 */
const redisClient = require('../utils/redis');

const UserController = {
  postNew: (req, res) => {
    const { email, password } = req.body? req.body: [undefined, undefined];
    if (!email || !password) {
      const missingElement = !email ? 'email' : 'password';
      res.status(400).send(`Missing ${missingElement}`);
    } else if (!redisClient.get('password') || !redisClient.get('email')) {
      redisClient.set('email', email, 3600);
      redisClient.set('password', password, 3600);
      res.status(201).send('User created');
    } else {
      res.status(400).send('User already exists');
    }
  },
};
module.exports = UserController;
