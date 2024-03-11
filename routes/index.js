/* eslint-disable no-unused-vars */
/**
 * contains all endpoints of the API
 */
const express = require('express');
const AppController = require('../controllers/AppController');

const router = express.Router();

router.get('/status', (req, res) => (AppController.getStatus));

router.get('/stats', (req, res) => (AppController.getStats));

module.exports = router;
