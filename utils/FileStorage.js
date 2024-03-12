const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * contains a class that deals with fileStorage in FOLDER_PATH else /tmp/files_manager
 * contains attribute folder path that gives where the files are stored
 * contains method upload that uploads files that have been passed in as objects
 */

class FileStorage {
  constructor(folderPath = '/tmp/files_manager') {
    this.folderPath = folderPath;
  }

  upload(file) {
    return new Promise((resolve, reject) => {
      const fileName = uuidv4();
      const filePath = path.join(this.folderPath, fileName);
      const fileStream = fs.createWriteStream(filePath);

      fileStream.on('error', (err) => {
        reject(err);
      });

      fileStream.on('finish', () => {
        resolve(this.folderPath);
      });

      const buffer = Buffer.from(file.data, 'base64');
      fileStream.write(buffer);
      fileStream.end();
    });
  }
}

module.exports.FileStorage = FileStorage;
