const express = require('express');
const multer = require('multer');
const path = require('path');
const { uploadToIPFS } = require('../controllers/ipfsController');

const router = express.Router();
const upload = multer({ dest: path.join(__dirname, '../uploads') });

router.post('/upload', upload.single('file'), uploadToIPFS);

module.exports = router;