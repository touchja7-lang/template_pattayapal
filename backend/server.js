require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db.js');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

// เชื่อมต่อฐานข้อมูล
connectDB();

// ── CORS ──────────────────────────────────────
const allowedOrigins = [
  'https://template-pattayapal-u6n3.vercel.app',
  'https://template-pattayapal.vercel.app',
  // เผื่อ Vercel preview deployments (ทุก subdomain ของ vercel.app)
  /\.vercel\.app$/,
  'http://localhost:3000',
  'http://localhost:5173',
];

app.use(cors({
  origin: function (origin, callback) {
    // อนุญาต Postman / server-to-server (ไม่มี origin)
    if (!origin) return callback(null, true);

    const allowed = allowedOrigins.some(o =>
      typeof o === 'string' ? o === origin : o.test(origin)
    );

    if (allowed) return callback(null, true);

    console.warn(`CORS blocked: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.set('trust proxy', 1);

// ── Body parser (เพิ่ม limit สำหรับ JSON/URL-encoded) ──
// หมายเหตุ: multipart/form-data (วิดีโอ) ไม่ผ่าน express.json()
// multer จัดการเองใน route แล้ว
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ── Routes ────────────────────────────────────
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/categories', require('./routes/category'));
app.use('/api/news',       require('./routes/news'));
app.use('/api/comments',   require('./routes/comment'));
app.use('/api/videos',     require('./routes/videos'));

// ── Health check ──────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date(),
    cloudinary: !!process.env.CLOUDINARY_API_KEY ? 'configured' : 'MISSING',
  });
});

// ── Start ─────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));