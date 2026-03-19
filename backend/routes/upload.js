const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Storage รูปหลัก (1 รูป) ──
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'news-images',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  },
});

// ── Storage รูปอัลบั้ม (หลายรูป) ──
const albumStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'news-albums',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  },
});

const uploadSingle = multer({ storage: imageStorage, limits: { fileSize: 10 * 1024 * 1024 } });
const uploadAlbum  = multer({ storage: albumStorage,  limits: { fileSize: 10 * 1024 * 1024 } });

// ─────────────────────────────────────────────
// POST /api/upload/image  — อัพโหลดรูปหลัก 1 รูป
// ─────────────────────────────────────────────
router.post('/image', auth, admin, uploadSingle.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'กรุณาเลือกไฟล์รูปภาพ' });
    res.json({
      url:       req.file.path,
      publicId:  req.file.filename,
      message:   'อัพโหลดรูปสำเร็จ',
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ message: 'อัพโหลดรูปไม่สำเร็จ', error: error.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/upload/album  — อัพโหลดรูปอัลบั้มหลายรูป (สูงสุด 20)
// ─────────────────────────────────────────────
router.post('/album', auth, admin, uploadAlbum.array('images', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'กรุณาเลือกไฟล์รูปภาพ' });
    }
    const urls = req.files.map(f => f.path);
    res.json({ urls, message: `อัพโหลด ${urls.length} รูปสำเร็จ` });
  } catch (error) {
    console.error('Upload album error:', error);
    res.status(500).json({ message: 'อัพโหลดรูปอัลบั้มไม่สำเร็จ', error: error.message });
  }
});

module.exports = router;