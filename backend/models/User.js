const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  // --- เพิ่มฟิลด์รูปภาพตรงนี้ ---
  profileImage: {
    type: String,
    default: 'https://cdn-icons-png.flaticon.com/512/616/616408.png' // รูปเริ่มต้น
  },
  backgroundImage: {
    type: String,
    default: ''
  },
  // -------------------------
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);