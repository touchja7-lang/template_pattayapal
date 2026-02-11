const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'เข้าถึงไม่ได้: คุณไม่มีสิทธิ์ Admin' });
    }
    
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์' });
  }
};
