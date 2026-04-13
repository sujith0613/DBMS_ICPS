const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

let gfsBucket;
mongoose.connection.once('open', () => {
  gfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'documents'
  });
});

// GET /api/documents/:file_id
router.get('/:file_id', async (req, res) => {
  try {
    if (!gfsBucket) {
      return res.status(500).json({ error: 'GridFS not initialized' });
    }
    const fileId = new mongoose.Types.ObjectId(req.params.file_id);
    const files = await gfsBucket.find({ _id: fileId }).toArray();

    if (!files || files.length === 0) {
      return res.status(404).json({ error: 'No file exists' });
    }

    // Set content-type dynamically (crudely determined by filename extension usually stored in contentType if multer provided it)
    if (files[0].contentType) {
      res.set('Content-Type', files[0].contentType);
    }
    const readStream = gfsBucket.openDownloadStream(fileId);
    readStream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
