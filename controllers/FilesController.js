/**
 * @param {Object} req The request object to use.
 * in case of file upload, the request object should contain the file to upload.
 */
const { dbClient } = require('../utils/db');
const redisClient = require('../utils/redis');

const FileController = {
  postUpload: async (req, res) => {
    // checks if auth token is in redis db
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    // Verify file data
    const {
      name, type, parentId = 0, isPublic = false, data,
    } = req.body;

    if (!name) {
      return res.status(400).send({ error: 'Missing name' });
    }

    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).send({ error: 'Missing type' });
    }

    if (type !== 'folder' && !data) {
      return res.status(400).send({ error: 'Missing data' });
    }

    // File object
    const file = {
      userId,
      name,
      type,
      parentId,
      isPublic,
      ...(data && { data }),
    };

    // Check file ParentId if it exists and if its a folder and upload in it
    if (parentId !== 0) {
      const parentFolder = dbClient.findFileByKey('_id', parentId);
      if (!parentFolder) {
        return res.status(400).send({ error: 'Parent not found' });
      }
      if (parentFolder.type !== 'folder') {
        return res.status(400).send({ error: 'Parent is not a folder' });
      }
      await dbClient.uploadFile(file, parentFolder);
    } else {
      await dbClient.uploadFile(file);
    }
    const fileView = { ...file, id: file._id.toString() };
    delete fileView._id;
    return res.status(201).json(fileView);
  },
  getShow: async (req, res) => {
    // checks if auth token is in redis db
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const file = dbClient.findFileByKey('_id', id);
    if (!file || file.userId !== userId) {
      return res.status(404).send({ error: 'Not found' });
    }
    return res.status(200).json(file);
  },

  getIndex: async (req, res) => {
    // checks if auth token is in redis db
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    const parentId = req.query.parentId || 0;
    const files = await dbClient.findMultipleFilesByKey('parentId', parentId);
    return res.status(200).json(files);
  },
  putPublish: async (req, res) => {
    // checks if auth token is in redis db
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).send({ error: 'Unauthorized' });
    }
    const { id } = req.body;
    const file = dbClient.findFileByKey('_id', id);
    if (!file || file.userId !== userId) {
      return res.status(404).send({ error: 'Not found' });
    }
    file.isPublic = true;
    return res.status(200).json(file);
  },

  putUnpublish: async (req, res) => {
    // checks if auth token is in redis db
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).send({ error: 'Unauthorized' });
    }
    const { id } = req.body;
    const file = dbClient.findFileByKey('_id', id);
    if (!file || file.userId !== userId) {
      return res.status(404).send({ error: 'Not found' });
    }
    file.isPublic = false;
    return res.status(200).json(file);
  },
};

module.exports.FileController = FileController;
