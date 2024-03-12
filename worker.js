const imageThumbnail = require('image-thumbnail');
const Queue = require('bull');
const { dbClient } = require('./utils/db');

const fileQueue = new Queue('file processing', 'redis://127.0.0.1:6379');

fileQueue.process(async (job, done) => {
  const { fileId, userId } = job.data;

  if (!fileId) {
    done(new Error('Missing fileId'));
  }

  if (!userId) {
    done(new Error('Missing userId'));
  }

  const file = await dbClient.collection('files').findOne({ _id: fileId, userId });

  if (!file) {
    done(new Error('File not found'));
  }

  const options = { responseType: 'base64' };
  const sizes = [500, 250, 100];

  await Promise.all(sizes.map(async (size) => {
    const thumbnail = await imageThumbnail(file.path, { width: size, ...options });
    await dbClient.storeThumbnail(fileId, thumbnail);
  }));

  done();
});
