const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    // req.userId ต้องผ่าน auth middleware มาก่อนเสมอ
    if (!req.userId) {
      return res.status(401).json({ message: 'ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบ' });
    }

    const user = await User.findById(req.userId).select('role isActive');

    // ตรวจทั้ง user มีอยู่จริง + role + account ไม่ถูก disable
    if (!user) {
      return res.status(401).json({ message: 'ไม่พบบัญชีผู้ใช้' });
    }

    if (user.isActive === false) {
      return res.status(403).json({ message: 'บัญชีนี้ถูกระงับการใช้งาน' });
    }

    if (user.role !== 'admin') {
      // log การพยายาม access admin โดยไม่มีสิทธิ์
      console.warn(`[SECURITY] Unauthorized admin access attempt - userId: ${req.userId} - ${new Date().toISOString()}`);
      return res.status(403).json({ message: 'ไม่มีสิทธิ์เข้าถึง' });
    }

    // แนบ user ไว้ใน req เพื่อใช้ใน route ถัดไปได้เลย
    req.user = user;
    next();

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Admin middleware error:', error);
    }
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์' });
  }
};