// backend/controllers/ipfsController.js

require('dotenv').config();  // Load .env lên process.env

const axios    = require('axios');
const FormData = require('form-data');
const fs       = require('fs');
const path     = require('path');
const QRCode   = require('qrcode');

// Lấy JWT từ biến môi trường
const PINATA_JWT = process.env.PINATA_JWT;

exports.uploadToIPFS = async (req, res) => {
  try {
    console.log('>>> req.file =', req.file);
    const file = req.file;
    if (!file) {
      console.error('❌ Không tìm thấy file trong request');
      return res.status(400).json({ error: 'Khong tim thay file' });
    }

    // Build FormData để upload
    const formData = new FormData();
    formData.append('file', fs.createReadStream(file.path));

    // Gọi Pinata API dùng JWT (Bearer)
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        maxBodyLength: Infinity,
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${PINATA_JWT}`,
        },
      }
    );

    // Lấy CID và URL
    const cid     = response.data.IpfsHash;
    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;

    // Tạo thư mục qrcodes nếu chưa có
    const qrFolder = path.join(__dirname, '../qrcodes');
    if (!fs.existsSync(qrFolder)) {
      fs.mkdirSync(qrFolder, { recursive: true });
    }

    // Sinh file QR code
    const qrPath = path.join(qrFolder, `${cid}.png`);
    await QRCode.toFile(qrPath, ipfsUrl);

    // Xóa file tạm uploads để dọn dẹp
    fs.unlink(file.path, err => {
      if (err) console.warn('Xóa file tạm lỗi:', err);
    });

    // Trả kết quả
    return res.json({
      success: true,
      cid,
      ipfsUrl,
      qrImage: `/qrcodes/${cid}.png`,
      message: 'Upload thành công và đã tạo QR',
    });

  } catch (error) {
    console.error('❌ Full error:', error);

    if (error.response) {
      console.error('→ Pinata response error:', {
        status: error.response.status,
        data:   error.response.data
      });
    }

    return res.status(500).json({
      error:  'Lỗi khi upload file lên IPFS',
      detail: error.toString(),
    });
  }
};
