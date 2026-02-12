const jwt = require('jsonwebtoken');
const User = require('../models/User'); // นำเข้า Model User ของคุณ

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies?.token;
    
    if (!token) {
      return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบ' });
    }

    // 1. ตรวจสอบ Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this');
    
    // 2. ค้นหา User จริงใน Database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'ไม่พบผู้ใช้งานในระบบ' });
    }

    // 3. ฝากข้อมูลไว้ใน Request เพื่อให้ Controller อื่นๆ ใช้งานต่อได้
    req.user = user; 
    req.userId = user._id; // เก็บไว้ทั้งสองแบบเพื่อความชัวร์
    
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    res.status(401).json({ message: 'Token ไม่ถูกต้อง หรือหมดอายุ' });
  }
};

module.exports = auth;