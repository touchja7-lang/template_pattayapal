import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { newsAPI, categoryAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { HiOutlinePencil, HiOutlineTrash, HiOutlinePlus } from "react-icons/hi";
import '../css/Admin.css';

const INITIAL_FORM = {
  title: '',
  category: '',
  image: '',
  excerpt: '',
  content: '',
  author: ''
};

function AdminDashboard() {
  const { user } = useAuth();
  const [news, setNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message }
  const [confirmDelete, setConfirmDelete] = useState(null); // id ที่กำลังจะลบ

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchData = useCallback(async () => {
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
      showNotification('error', 'ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
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

  const handleOpenAdd = () => {
    setEditingNews(null);
    setFormData(INITIAL_FORM);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingNews(null);
    setFormData(INITIAL_FORM);
  };

  // แทน window.confirm ด้วย state-based confirm modal
  const handleDeleteRequest = (id) => {
    setConfirmDelete(id);
  };

  const handleDeleteConfirm = async () => {
    try {
      await newsAPI.delete(confirmDelete);
      setNews(prev => prev.filter(item => item._id !== confirmDelete));
      showNotification('success', 'ลบข่าวสำเร็จ');
    } catch (err) {
      showNotification('error', 'เกิดข้อผิดพลาดในการลบข่าว');
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingNews) {
        await newsAPI.update(editingNews._id, formData);
        showNotification('success', 'อัปเดตข่าวสำเร็จ');
      } else {
        await newsAPI.create(formData);
        showNotification('success', 'สร้างข่าวสำเร็จ');
      }
      handleCloseModal();
      fetchData();
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'เกิดข้อผิดพลาด');
    }
  };

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

      {/* Notification Toast */}
      {notification && (
        <div className={`admin-notification admin-notification--${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="admin-container">
        <div className="admin-header">
          <h1>จัดการข่าวสาร</h1>
          <button className="add-news-btn" onClick={handleOpenAdd}>
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
                {news.length > 0 ? (
                  news.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <img
                          src={item.image}
                          alt={item.title}
                          className="admin-news-thumb"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/placeholder.png';
                          }}
                        />
                      </td>
                      <td className="admin-news-title">{item.title}</td>
                      <td>{item.category?.name || 'ไม่มีหมวดหมู่'}</td>
                      <td>{new Date(item.createdAt).toLocaleDateString('th-TH')}</td>
                      <td className="admin-actions">
                        <button className="edit-btn" onClick={() => handleEdit(item)} title="แก้ไข">
                          <HiOutlinePencil />
                        </button>
                        <button className="delete-btn" onClick={() => handleDeleteRequest(item._id)} title="ลบ">
                          <HiOutlineTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="admin-empty">ยังไม่มีข่าวสาร</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
                <button type="button" className="cancel-btn" onClick={handleCloseModal}>ยกเลิก</button>
                <button type="submit" className="save-btn">บันทึก</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-content modal-confirm" onClick={(e) => e.stopPropagation()}>
            <h2>ยืนยันการลบ</h2>
            <p>คุณแน่ใจหรือไม่ว่าต้องการลบข่าวนี้? การกระทำนี้ไม่สามารถย้อนกลับได้</p>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setConfirmDelete(null)}>ยกเลิก</button>
              <button className="delete-btn" onClick={handleDeleteConfirm}>ลบ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;