const { MongoClient } = require('mongodb');
const crypto = require('crypto');

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
}

const dbClient = new DBClient();
module.exports = dbClient;
