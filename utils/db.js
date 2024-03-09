const { MongoClient } = require('mongodb');

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
}

const dbClient = new DBClient();
module.exports = dbClient;
