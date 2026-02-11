import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { newsAPI, categoryAPI } from '../services/api';
import Navbar from '../components/Navbar';
// นำ Footer import ออกถ้าไม่ได้ใช้ในจุดอื่น
import { HiOutlinePencil, HiOutlineTrash, HiOutlinePlus } from "react-icons/hi";
import '../css/Admin.css';

function AdminDashboard() {
  const { user } = useAuth();
  const [news, setNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    image: '',
    excerpt: '',
    content: '',
    author: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [newsRes, catRes] = await Promise.all([
        newsAPI.getAll(),
        categoryAPI.getAll()
      ]);
      setNews(newsRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (item) => {
    setEditingNews(item);
    setFormData({
      title: item.title,
      category: item.category?._id || item.category,
      image: item.image,
      excerpt: item.excerpt || '',
      content: item.content,
      author: item.author || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข่าวนี้?')) {
      try {
        await newsAPI.delete(id);
        setNews(news.filter(item => item._id !== id));
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการลบข่าว');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingNews) {
        await newsAPI.update(editingNews._id, formData);
        alert('อัปเดตข่าวสำเร็จ');
      } else {
        await newsAPI.create(formData);
        alert('สร้างข่าวสำเร็จ');
      }
      setShowModal(false);
      setEditingNews(null);
      setFormData({ title: '', category: '', image: '', excerpt: '', content: '', author: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    }
  };

  // กรณีไม่มีสิทธิ์เข้าถึง (เอา Footer ออกแล้ว)
  if (!user || user.role !== 'admin') {
    return (
      <div className="admin-page">
        <Navbar />
        <div className="admin-container">
          <div className="admin-error">
            <h2>คุณไม่มีสิทธิ์เข้าถึงหน้านี้</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <Navbar />
      <div className="admin-container">
        <div className="admin-header">
          <h1>จัดการข่าวสาร</h1>
          <button className="add-news-btn" onClick={() => {
            setEditingNews(null);
            setFormData({ title: '', category: '', image: '', excerpt: '', content: '', author: '' });
            setShowModal(true);
          }}>
            <HiOutlinePlus /> เพิ่มข่าวใหม่
          </button>
        </div>

        {loading ? (
          <div className="admin-loading">กำลังโหลดข้อมูล...</div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>รูปภาพ</th>
                  <th>หัวข้อข่าว</th>
                  <th>หมวดหมู่</th>
                  <th>วันที่</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {news.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <img src={item.image} alt={item.title} className="admin-news-thumb" />
                    </td>
                    <td className="admin-news-title">{item.title}</td>
                    <td>{item.category?.name || 'ไม่มีหมวดหมู่'}</td>
                    <td>{new Date(item.createdAt).toLocaleDateString('th-TH')}</td>
                    <td className="admin-actions">
                      <button className="edit-btn" onClick={() => handleEdit(item)}>
                        <HiOutlinePencil />
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(item._id)}>
                        <HiOutlineTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingNews ? 'แก้ไขข่าว' : 'เพิ่มข่าวใหม่'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>หัวข้อข่าว</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>หมวดหมู่</label>
                <select name="category" value={formData.category} onChange={handleInputChange} required>
                  <option value="">เลือกหมวดหมู่</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>URL รูปภาพ</label>
                <input type="text" name="image" value={formData.image} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>คำโปรย (Excerpt)</label>
                <textarea name="excerpt" value={formData.excerpt} onChange={handleInputChange} rows="2"></textarea>
              </div>
              <div className="form-group">
                <label>เนื้อหาข่าว (HTML)</label>
                <textarea name="content" value={formData.content} onChange={handleInputChange} rows="6" required></textarea>
              </div>
              <div className="form-group">
                <label>ผู้เขียน</label>
                <input type="text" name="author" value={formData.author} onChange={handleInputChange} />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>ยกเลิก</button>
                <button type="submit" className="save-btn">บันทึก</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Footer ถูกลบออกจากตำแหน่งนี้แล้ว */}
    </div>
  );
}

export default AdminDashboard;