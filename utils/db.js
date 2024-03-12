/* eslint-disable no-param-reassign */
const { MongoClient } = require('mongodb');
const crypto = require('crypto');
const { ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

function hashPassword(password) {
  const sha1 = crypto.createHash('sha1');
  sha1.update(password);
  return sha1.digest('hex');
}

class DBClient {
  constructor() {
    this._credentials = {
      host: 'localhost',
      port: '27017',
      database: 'files_manager',
    };
    if (process.env.DB_DATABSE) {
      this._credentials.database = process.env.DB_DATABASE;
    }
    this.client = new MongoClient(`mongodb://${this._credentials.host}:${this._credentials.port}`, { useNewUrlParser: true, useUnifiedTopology: true });
    this.client.connect();
  }

  isAlive() {
    return (this.client.isConnected());
  }

  async nbUsers() {
    return this.client.db(this._credentials.database).collection('users').countDocuments();
  }

  async nbFiles() {
    return this.client.db(this._credentials.database).collection('files').countDocuments();
  }

  async createUser(email, password) {
    const usersCollection = this.client.db(this._credentials.database).collection('users');
    const userExists = await usersCollection.findOne({ email });

    if (userExists) {
      return null;
    }

    const hashedPassword = hashPassword(password);
    const result = await usersCollection.insertOne({ email, password: hashedPassword });

    return result.ops[0];
  }

  async findUserByEmail(email) {
    const usersCollection = this.client.db(this._credentials.database).collection('users');
    const user = await usersCollection.findOne({ email });
    return user;
  }

  async findUserByKey(key, value) {
    if (key === '_id') {
      value = new ObjectId(value);
    }
    const usersCollection = this.client.db(this._credentials.database).collection('users');
    const user = await usersCollection.findOne({ [key]: value });
    return user || null;
  }

  // Uploads a file in the db
  async uploadFile(file, parentFolder = null) {
    // Create a new file in the database
    const filesCollection = this.client.db(this._credentials.database).collection('files');

    // Create a new file in the database
    const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';

    // Create a new folder /tmp/files_manager if it does not exist
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // check if the parent folder exists
    if (parentFolder) {
      file.parentFolder = parentFolder;
    }

    // create a new file in the FOLDER_PATH  if not a  folder
    if (file.type !== 'folder') {
      const filePath = path.join(folderPath, uuidv4());
      fs.writeFileSync(filePath, Buffer.from(file.data, 'base64'));
      file.localPath = filePath;
    }
    const result = await filesCollection.insertOne(file);
    return result.ops[0];
  }

  // returns a file object or null
  async findFileByKey(key, value) {
    if (key === '_id') {
      value = new ObjectId(value);
    }
    const filesCollection = this.client.db(this._credentials.database).collection('files');
    const file = await filesCollection.findOne({ [key]: value });
    return file || null;
  }

  async findMultipleFilesByKey(key, value, page = 1) {
    if (key === '_id') {
      value = new ObjectId(value);
    }
    const filesCollection = this.client.db(this._credentials.database).collection('files');
    // eslint-disable-next-line max-len
    const files = await filesCollection.find({ [key]: value }).skip((page - 1) * 20).limit(20).toArray();
    return files;
  }
}

const dbClient = new DBClient();
module.exports.dbClient = dbClient;
module.exports.hashPassword = hashPassword;
