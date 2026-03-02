const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // ── รับ token ได้ทั้งจาก Authorization header และ httpOnly cookie ──
    let token = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ message: 'ไม่พบ Token กรุณาเข้าสู่ระบบ' });
    }

    // ── ตรวจสอบว่า JWT_SECRET ถูกตั้งค่าจริงๆ ──
    if (!process.env.JWT_SECRET) {
      console.error('[SECURITY] JWT_SECRET is not set!');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ── ตรวจ field ที่จำเป็นใน payload ──
    if (!decoded.userId) {
      return res.status(401).json({ message: 'Token ไม่ถูกต้อง' });
    }

    req.userId = decoded.userId;
    next();

  } catch (error) {
    // แยก error type เพื่อ message ที่ถูกต้อง
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token หมดอายุ กรุณาเข้าสู่ระบบใหม่' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token ไม่ถูกต้อง' });
    }
    // ไม่ log error detail ใน production
    if (process.env.NODE_ENV !== 'production') {
      console.error('Auth middleware error:', error);
    }
    return res.status(401).json({ message: 'ไม่สามารถยืนยันตัวตนได้' });
  }
};