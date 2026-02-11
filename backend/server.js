require('dotenv').config({ path: '../.env' });
const express = require('express');
const connectDB = require('./config/db.js');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

// เชื่อมต่อฐานข้อมูล
connectDB();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/categories', require('./routes/category'));
app.use('/api/news', require('./routes/news'));
app.use('/api/comments', require('./routes/comment'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
