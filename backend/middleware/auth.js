const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const storage = multer.memoryStorage(); // ใช้ memoryStorage เพื่อความง่าย (ส่งเป็น base64 หรือเก็บชั่วคราว)
const upload = multer({ storage });

// ตรวจสอบว่า URL นี้ตรงกับที่ Frontend เรียก (เช่น /update-profile)
router.put('/update-profile', auth, upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'backgroundImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const user = await User.findById(req.userId); // ใช้ req.userId จาก Middleware
    if (!user) return res.status(404).json({ message: 'ไม่พบผู้ใช้' });

    // 1. อัปเดตชื่อ
    if (req.body.fullName) user.fullName = req.body.fullName;

    // 2. จัดการรูปโปรไฟล์
    if (req.files && req.files.profileImage) {
      // ถ้าเป็นไฟล์ ให้แปลงเป็น base64 (กรณีไม่มี Cloudinary/Folder จัดเก็บ)
      const file = req.files.profileImage[0];
      const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      user.profileImage = base64Image;
    } else if (req.body.profileImage) {
      // ถ้าเลือกจาก Avatar (ส่งมาเป็น String URL)
      user.profileImage = req.body.profileImage;
    }

    // 3. จัดการรูปพื้นหลัง
    if (req.files && req.files.backgroundImage) {
      const file = req.files.backgroundImage[0];
      const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      user.backgroundImage = base64Image;
    }

    await user.save();

    res.json({
      success: true,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profileImage: user.profileImage,
        backgroundImage: user.backgroundImage,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({ message: 'Backend Error: ' + error.message });
  }
});

module.exports = router;