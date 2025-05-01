const express = require('express');
const multer = require('multer');
const { uploadBuffer } = require('../services/blobStorage');

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.post(
  '/',
  upload.single('file'),
  async (req, res) => {
    try {
      const { fileType, userId } = req.body;
      const file = req.file;
      if (!file) return res.status(400).json({ message: 'No file.' });

      const blobPath = `${userId}/${fileType}/${file.originalname}`;
      const url = await uploadBuffer(
        file.buffer,
        blobPath,
        file.mimetype
      );

      res.json({ url });
    } catch (err) {
      console.error('Upload error:', err);
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;