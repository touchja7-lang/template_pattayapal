import React, { useState, useEffect, useCallback, useRef } from 'react';
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

// ---- Helper: แปลง error จาก axios/fetch เป็นข้อความ ----
function parseError(err) {
  if (!err) return 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
  if (err.response) {
    const status = err.response.status;
    const msg = err.response.data?.message || err.response.data?.error;
    if (status === 400) return `ข้อมูลไม่ถูกต้อง: ${msg || 'กรุณาตรวจสอบฟอร์ม'}`;
    if (status === 401) return 'Session หมดอายุ กรุณา Login ใหม่';
    if (status === 403) return 'คุณไม่มีสิทธิ์ดำเนินการนี้';
    if (status === 404) return 'ไม่พบข้อมูลที่ต้องการแก้ไข';
    if (status >= 500) return `เซิร์ฟเวอร์มีปัญหา (${status}) กรุณาลองใหม่ภายหลัง`;
    return msg || `เกิดข้อผิดพลาด (${status})`;
  }
  if (err.request) return 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบอินเทอร์เน็ต';
  return err.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
}

// ---- Validation ----
function validateForm(formData) {
  const errors = {};
  if (!formData.title.trim()) errors.title = 'กรุณากรอกหัวข้อข่าว';
  if (!formData.category) errors.category = 'กรุณาเลือกหมวดหมู่';
  if (!formData.image.trim()) errors.image = 'กรุณากรอก URL รูปภาพ';
  else {
    try { new URL(formData.image); }
    catch { errors.image = 'URL รูปภาพไม่ถูกต้อง'; }
  }
  if (!formData.content.trim()) errors.content = 'กรุณากรอกเนื้อหาข่าว';
  return errors;
}

function AdminDashboard() {
  const { user } = useAuth();
  const [news, setNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message }
  const [confirmDelete, setConfirmDelete] = useState(null); // id ที่กำลังจะลบ
  const [isDeleting, setIsDeleting] = useState(false);
  const notifyTimer = useRef(null);

  // ---- Notification (ใช้ ref เก็บ timer ป้องกัน memory leak) ----
  const showNotification = useCallback((type, message) => {
    if (notifyTimer.current) clearTimeout(notifyTimer.current);
    setNotification({ type, message });
    notifyTimer.current = setTimeout(() => setNotification(null), 4000);
  }, []);

  useEffect(() => {
    return () => { if (notifyTimer.current) clearTimeout(notifyTimer.current); };
  }, []);

  // ---- Fetch Data ----
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
      showNotification('error', parseError(err));
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ---- Form Handlers ----
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // ล้าง error ของ field นั้นทันทีที่ user เริ่มพิมพ์
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleEdit = (item) => {
    setEditingNews(item);
    setFormData({
      title: item.title || '',
      category: item.category?._id || item.category || '',
      image: item.image || '',
      excerpt: item.excerpt || '',
      content: item.content || '',
      author: item.author || ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleOpenAdd = () => {
    setEditingNews(null);
    setFormData(INITIAL_FORM);
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (isSubmitting) return; // ป้องกันปิด modal ขณะกำลัง submit
    setShowModal(false);
    setEditingNews(null);
    setFormData(INITIAL_FORM);
    setFormErrors({});
  };

  // ---- Submit (Create / Update) ----
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate ก่อน
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingNews) {
        await newsAPI.update(editingNews._id, formData);
        showNotification('success', 'อัปเดตข่าวสำเร็จ ✓');
      } else {
        await newsAPI.create(formData);
        showNotification('success', 'สร้างข่าวสำเร็จ ✓');
      }
      handleCloseModal();
      await fetchData(); // รอ fetch ใหม่ก่อนค่อยซ่อน loading
    } catch (err) {
      console.error('Submit error:', err);
      showNotification('error', parseError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---- Delete ----
  const handleDeleteRequest = (id) => {
    setConfirmDelete(id);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await newsAPI.delete(confirmDelete);
      setNews(prev => prev.filter(item => item._id !== confirmDelete));
      showNotification('success', 'ลบข่าวสำเร็จ ✓');
    } catch (err) {
      console.error('Delete error:', err);
      showNotification('error', parseError(err));
    } finally {
      setIsDeleting(false);
      setConfirmDelete(null);
    }
  };

  // ---- Guard: ไม่ใช่ admin ----
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
                        <button
                          className="edit-btn"
                          onClick={() => handleEdit(item)}
                          title="แก้ไข"
                        >
                          <HiOutlinePencil />
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteRequest(item._id)}
                          title="ลบ"
                        >
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

      {/* ==================== Form Modal ==================== */}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={handleCloseModal}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingNews ? 'แก้ไขข่าว' : 'เพิ่มข่าวใหม่'}</h2>

            <form onSubmit={handleSubmit} noValidate>

              {/* หัวข้อข่าว */}
              <div className={`form-group${formErrors.title ? ' form-group--error' : ''}`}>
                <label>หัวข้อข่าว <span className="required">*</span></label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  placeholder="กรอกหัวข้อข่าว"
                />
                {formErrors.title && <span className="form-error-msg">{formErrors.title}</span>}
              </div>

              {/* หมวดหมู่ */}
              <div className={`form-group${formErrors.category ? ' form-group--error' : ''}`}>
                <label>หมวดหมู่ <span className="required">*</span></label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                >
                  <option value="">เลือกหมวดหมู่</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
                {formErrors.category && <span className="form-error-msg">{formErrors.category}</span>}
              </div>

              {/* URL รูปภาพ */}
              <div className={`form-group${formErrors.image ? ' form-group--error' : ''}`}>
                <label>URL รูปภาพ <span className="required">*</span></label>
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  placeholder="https://example.com/image.jpg"
                />
                {formErrors.image && <span className="form-error-msg">{formErrors.image}</span>}
                {/* Preview รูปภาพ */}
                {formData.image && !formErrors.image && (
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="admin-img-preview"
                    onError={(e) => { e.target.style.display = 'none'; }}
                    onLoad={(e) => { e.target.style.display = 'block'; }}
                  />
                )}
              </div>

              {/* คำโปรย */}
              <div className="form-group">
                <label>คำโปรย (Excerpt)</label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  rows="2"
                  disabled={isSubmitting}
                  placeholder="สรุปข่าวสั้นๆ (ไม่บังคับ)"
                />
              </div>

              {/* เนื้อหาข่าว */}
              <div className={`form-group${formErrors.content ? ' form-group--error' : ''}`}>
                <label>เนื้อหาข่าว (HTML) <span className="required">*</span></label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows="6"
                  disabled={isSubmitting}
                  placeholder="<p>เนื้อหาข่าว...</p>"
                />
                {formErrors.content && <span className="form-error-msg">{formErrors.content}</span>}
              </div>

              {/* ผู้เขียน */}
              <div className="form-group">
                <label>ผู้เขียน</label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  placeholder="ชื่อผู้เขียน (ไม่บังคับ)"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="save-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ==================== Confirm Delete Modal ==================== */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => !isDeleting && setConfirmDelete(null)}>
          <div className="modal-content modal-confirm" onClick={(e) => e.stopPropagation()}>
            <h2>ยืนยันการลบ</h2>
            <p>คุณแน่ใจหรือไม่ว่าต้องการลบข่าวนี้?<br />การกระทำนี้ไม่สามารถย้อนกลับได้</p>
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setConfirmDelete(null)}
                disabled={isDeleting}
              >
                ยกเลิก
              </button>
              <button
                className="delete-btn"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? 'กำลังลบ...' : 'ลบ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;