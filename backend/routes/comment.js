const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); // ✅ เพิ่ม mongoose เข้ามาเพื่อใช้เช็ก ID
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');

// Get comments for a news article
router.get('/news/:newsId', async (req, res) => {
  try {
    // 🔍 เช็กก่อนว่า newsId ที่ส่งมาใน URL เป็นรูปแบบ MongoDB หรือเปล่า
    if (!mongoose.Types.ObjectId.isValid(req.params.newsId)) {
      return res.status(400).json({ message: 'รูปแบบ ID ข่าวไม่ถูกต้อง' });
    }

    const comments = await Comment.find({ newsId: req.params.newsId })
      .populate('userId', 'username fullName')
      .sort({ createdAt: -1 });
    
    res.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลคอมเมนต์' });
  }
});

// Create comment (requires authentication)
router.post('/', auth, async (req, res) => {
  try {
    const { newsId, content } = req.body;
    
    // 🔍 1. เช็กความว่างเปล่า
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'กรุณาใส่ข้อความคอมเมนต์' });
    }

    // 🔍 2. สำคัญมาก! เช็กว่า newsId เป็น ObjectId หรือเปล่า
    // ถ้า React ส่ง "1" หรือ "8" มา มันจะติดที่บรรทัดนี้ และไม่ระเบิดเป็น Error 500
    if (!mongoose.Types.ObjectId.isValid(newsId)) {
      return res.status(400).json({ 
        message: 'คุณส่ง ID ข่าวผิดรูปแบบ (ต้องเป็นรหัส MongoDB 24 หลัก)',
        debug_value: newsId 
      });
    }

    // 🔍 3. เช็กว่า middleware auth ส่ง req.userId มาจริงไหม
    if (!req.userId) {
      return res.status(401).json({ message: 'ไม่พบข้อมูลผู้ใช้ (Token อาจผิดพลาด)' });
    }
    
    const comment = new Comment({
      newsId,
      userId: req.userId,
      content: content.trim()
    });
    
    await comment.save();
    
    const populatedComment = await Comment.findById(comment._id)
      .populate('userId', 'username fullName');
    
    res.status(201).json({ 
      message: 'เพิ่มคอมเมนต์สำเร็จ', 
      comment: populatedComment 
    });
  } catch (error) {
    console.error('Create comment error:', error);
    // ส่งรายละเอียด error กลับไปให้หน้าบ้านเห็นชัดๆ
    res.status(500).json({ 
      message: 'เกิดข้อผิดพลาดในระบบ', 
      error: error.message 
    });
  }
});

// Delete comment (รวบรัดการเช็ก)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'รูปแบบ ID คอมเมนต์ไม่ถูกต้อง' });
    }

    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'ไม่พบคอมเมนต์' });
    
    if (comment.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'คุณไม่มีสิทธิ์ลบคอมเมนต์นี้' });
    }
    
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: 'ลบคอมเมนต์สำเร็จ' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบคอมเมนต์' });
  }
});

module.exports = router;