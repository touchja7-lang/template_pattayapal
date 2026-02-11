const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่' });
  }
});

// Get single category
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'ไม่พบหมวดหมู่' });
    }
    res.json(category);
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

// Create category
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // สร้าง slug จากชื่อหมวดหมู่
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    
    const category = new Category({
      name,
      slug,
      description
    });
    
    await category.save();
    res.status(201).json({ message: 'สร้างหมวดหมู่สำเร็จ', category });
  } catch (error) {
    console.error('Create category error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'หมวดหมู่นี้มีอยู่แล้ว' });
    }
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสร้างหมวดหมู่' });
  }
});

module.exports = router;
