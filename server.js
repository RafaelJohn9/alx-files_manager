/**
 * listen for api calls in a given port or default port 5000
 */
const express = require('express');
const router = require('./routes/index');

const app = express();
app.use('/', router);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
