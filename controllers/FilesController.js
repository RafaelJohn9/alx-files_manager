/**
 * @param {Object} req The request object to use.
 * in case of file upload, the request object should contain the file to upload.
 */
const mime = require('mime-types');
const { Queue } = require('bull');
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

    const file = {
      userId,
      name,
      type,
      parentId,
      isPublic,
    };
    // Add a job to the queue when a new image is stored
    if (type === 'image') {
      // Create a Bull queue
      const fileQueue = new Queue('fileQueue');
      fileQueue.add({
        userId,
        fileId: file._id,
      });
    }
    // File object
    if (data) {
      file.data = data;
    }

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
    // creates a fileView object
    const fileView = { ...file, id: file._id.toString() };
    delete fileView._id;
    delete fileView.data;
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
    const file = await dbClient.findFileByKey('_id', id);
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

    // checks if parentId is in the request query
    const parentId = req.query.parentId || 0;

    // fetch files in the parentId
    const files = await dbClient.findMultipleFilesByKey('parentId', parentId);
    return res.status(200).json(files);
  },
  putPublish: async (req, res) => {
    // checks if auth token is in redis db
    const token = req.headers['x-token'];

    // get the userId using the token and validate it
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    // get the id of the file from the request
    const { id } = req.params;

    // get the file from the database and validate it
    const file = await dbClient.findFileByKey('_id', id);
    if (!file || file.userId !== userId) {
      return res.status(404).send({ error: 'Not found' });
    }

    // change the file to public and send it with 200 response
    file.isPublic = true;
    return res.status(200).json(file);
  },

  putUnpublish: async (req, res) => {
    // checks if auth token is in redis db
    const token = req.headers['x-token'];

    // get the userId using the token and validate it
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    // get the id of the file from the request
    const { id } = req.params;

    // get the file from the database and validate it
    const file = await dbClient.findFileByKey('_id', id);
    if (!file || file.userId !== userId) {
      return res.status(404).send({ error: 'Not found' });
    }

    // change the file to private and send it with 200 response
    file.isPublic = false;
    return res.status(200).json(file);
  },

  getFile: async (req, res) => {
    // checks if auth token is in redis db
    const token = req.headers['x-token'];

    // get the userId using the token and validate it
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    // get the id of the file from the request
    const { id } = req.params;

    // get the file from the database and validate it
    const file = await dbClient.findFileByKey('_id', id);
    if (!file || (!file.isPublic && file.userId !== userId) || !file.data) {
      return res.status(404).send({ error: 'Not found' });
    }
    if (file.type === 'folder') {
      return res.status(400).send({ error: 'A folder doesn\'t have content' });
    }

    // check the mimetype of the file and validate it
    const contentType = mime.lookup(file.name);

    if (!contentType) {
      return res.status(400).send({ error: 'Invalid file type' });
    }

    // prepare response headers and data
    res.setHeader('Content-Type', contentType);

    let data;
    if (contentType.startsWith('text/') || contentType === 'application/pdf') {
      data = Buffer.from(file.data, 'base64').toString('utf8');
    } else if (contentType.startsWith('image/') || contentType.startsWith('video/')) {
      data = `data:${contentType};base64,${file.data}`;
    } else {
      data = Buffer.from(file.data, 'base64');
    }

    // send the data with 200 response
    return res.status(200).send(data);
  },
};

module.exports.FileController = FileController;
