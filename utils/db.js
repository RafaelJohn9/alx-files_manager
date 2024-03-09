const { MongoClient } = require('mongodb');

/**
 * MongoDB utils
 */

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
    this.client = MongoClient(`mongodb://${this._credentials.host}:${this._credentials.port}`, { useUnifiedTopology: true });
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    return (new Promise((reject, resolve) => {
      this.client.connect((err, client) => {
        if (err) {
          reject(err);
        } else {
          resolve(client.db(this._credentials.database).collection('users').countDocuments());
        }
      });
    }))
      .catch((err) => console.error(err));
  }

  async nbFiles() {
    return new Promise((resolve, reject) => {
      this.client.connect((err, client) => {
        if (err) {
          reject(err);
        } else {
          resolve(client.db(this._credentials.database).collection('files').countDocuments());
        }
      });
    })
      .catch((err) => console.error(err));
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
