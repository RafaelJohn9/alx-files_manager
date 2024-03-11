/**
 * @api {post} /users Create a new user
 */
const dbClient = require('../utils/db');

const UserController = {
  postNew: async (req, res) => {
    // Get the email and password from the request body
    const { email, password } = req.body ? req.body : [undefined, undefined];

    // If the email or password are missing, return a 400 status code
    if (!email || !password) {
      const missingElement = !email ? 'email' : 'password';
      res.status(400).json({ error: `Missing ${missingElement}` });
      return;
    }

    // Create a new user in the database
    const newUser = await dbClient.createUser(email, password);

    // If the user was created successfully, return a 201 status code
    if (newUser) {
      res.status(201).json({
        id: newUser._id,
        email: newUser.email,
      });
    } else {
      res.status(400).json({ error: 'Already exists' });
    }
  },
};
module.exports = UserController;
