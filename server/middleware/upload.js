const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const path = require('path');
require('dotenv').config();

const url = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/icps';

const storage = new GridFsStorage({
  url: url,
  options: { useUnifiedTopology: true },
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      const filename = `${Date.now()}-${file.originalname}`;
      const fileInfo = {
        filename: filename,
        bucketName: 'documents' // Match with documents route
      };
      resolve(fileInfo);
    });
  }
});

const uploadMiddleware = multer({ storage });

module.exports = {
  array: (fieldName, maxCount) => {
    return (req, res, next) => {
      return uploadMiddleware.array(fieldName, maxCount)(req, res, next);
    };
  }
};
