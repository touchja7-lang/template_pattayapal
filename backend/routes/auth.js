const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    // ตรวจสอบว่ามี user อยู่แล้วหรือไม่
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email ? 'อีเมลนี้ถูกใช้งานแล้ว' : 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // สร้าง user ใหม่
    const user = new User({
      username,
      email,
      password: hashedPassword,
      fullName
    });

    await user.save();

    // สร้าง token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key-change-this',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'สมัครสมาชิกสำเร็จ',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // ค้นหา user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    // ตรวจสอบ password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    // สร้าง token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key-change-this',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลผู้ใช้' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

// Update Profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลผู้ใช้' });
    }

    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    res.json({
      message: 'อัปเดตโปรไฟล์สำเร็จ',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.json({ message: 'ออกจากระบบสำเร็จ' });
});

module.exports = router;
