require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db.js');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

// เชื่อมต่อฐานข้อมูล
connectDB();

// Middleware
app.use(cors({
  origin: 'https://template-pattayapal-u6n3.vercel.app', // URL หน้าเว็บ Vercel ของคุณ
  credentials: true, // ต้องเป็น true เหมือนกับหน้าบ้าน
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// เพิ่ม Trust Proxy เพื่อให้การส่ง Cookie ข้ามโดเมนทำงานได้ถูกต้องบน Render/Vercel
app.set('trust proxy', 1);

app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/categories', require('./routes/category'));
app.use('/api/news', require('./routes/news'));
app.use('/api/comments', require('./routes/comment'));


// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running', timestamp: new Date() });
});

// กำหนดพอร์ตให้รองรับ Environment Variable ของ Hosting
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));