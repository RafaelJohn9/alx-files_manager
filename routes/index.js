/* eslint-disable no-unused-vars */
/**
 * contains all endpoints of the API
 */
const express = require('express');
const { AppController } = require('../controllers/AppController');
const { UserController } = require('../controllers/UsersController');
const { AuthController } = require('../controllers/AuthController');
const { FileController } = require('../controllers/FilesController');

const router = express.Router();

router.get('/status', AppController.getStatus);

router.get('/stats', AppController.getStats);

router.post('/users', UserController.postNew);

router.get('/connect', AuthController.getConnect);

router.get('/disconnect', AuthController.getDisconnect);

router.get('/users/me', UserController.getMe);

router.post('/files', FileController.postUpload);

router.get('/files/:id', FileController.getShow);

router.get('/files', FileController.getIndex);

router.put('/files/:id/publish', FileController.putPublish);

router.put('/files/:id/unpublish', FileController.putUnpublish);

router.get('/files/:id/data', FileController.getFile);

module.exports = router;
