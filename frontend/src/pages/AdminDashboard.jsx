import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { newsAPI, categoryAPI } from '../services/api';
import api from '../services/api';
import Navbar from '../components/Navbar';
import {
  HiOutlinePencil, HiOutlineTrash, HiOutlinePlus,
  HiOutlinePhotograph, HiOutlineX
} from 'react-icons/hi';
import { IoCloudUploadOutline, IoCheckmarkCircle } from 'react-icons/io5';
import '../css/Admin.css';

const INITIAL_FORM = {
  title:       '',
  category:    '',
  image:       '',
  excerpt:     '',
  content:     '',
  author:      '',
  albumImages: [],
};

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
  if (err.request) return 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้';
  return err.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
}

function validateForm(formData) {
  const errors = {};
  if (!formData.title.trim())   errors.title    = 'กรุณากรอกหัวข้อข่าว';
  if (!formData.category)       errors.category = 'กรุณาเลือกหมวดหมู่';
  if (!formData.image)          errors.image    = 'กรุณาอัพโหลดรูปภาพหลัก';
  if (!formData.content.trim()) errors.content  = 'กรุณากรอกเนื้อหาข่าว';
  return errors;
}

/* ══════════════════════════════════════
   ImageUploader — อัพโหลดรูปหลัก 1 รูป
   ══════════════════════════════════════ */
function ImageUploader({ value, onChange, disabled }) {
  const inputRef  = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver]   = useState(false);

  const upload = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await api.post('/upload/image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(res.data.url);
    } catch (err) {
      alert('อัพโหลดรูปไม่สำเร็จ: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleFile = (e) => upload(e.target.files[0]);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    upload(e.dataTransfer.files[0]);
  };

  return (
    <div
      className={`img-uploader ${dragOver ? 'dragover' : ''} ${disabled ? 'disabled' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        disabled={disabled || uploading}
        style={{ display: 'none' }}
      />

      {value ? (
        /* มีรูปแล้ว — แสดง preview */
        <div className="img-uploader-preview">
          <img src={value} alt="Preview" className="img-uploader-img" />
          <div className="img-uploader-actions">
            <button
              type="button"
              className="img-uploader-change"
              onClick={() => inputRef.current?.click()}
              disabled={disabled || uploading}
            >
              {uploading ? 'กำลังอัพโหลด...' : 'เปลี่ยนรูป'}
            </button>
            <button
              type="button"
              className="img-uploader-remove"
              onClick={() => onChange('')}
              disabled={disabled || uploading}
            >
              <HiOutlineX />
            </button>
          </div>
        </div>
      ) : (
        /* ยังไม่มีรูป — แสดง drop zone */
        <div
          className="img-uploader-idle"
          onClick={() => !disabled && !uploading && inputRef.current?.click()}
        >
          {uploading ? (
            <div className="img-uploader-uploading">
              <div className="img-upload-spinner" />
              <p>กำลังอัพโหลด...</p>
            </div>
          ) : (
            <>
              <IoCloudUploadOutline className="img-uploader-icon" />
              <p className="img-uploader-label">
                ลากรูปมาวาง หรือ <span>คลิกเพื่อเลือกไฟล์</span>
              </p>
              <p className="img-uploader-hint">JPG, PNG, WebP — สูงสุด 10MB</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════
   AlbumUploader — อัพโหลดรูปอัลบั้มหลายรูป
   ══════════════════════════════════════ */
function AlbumUploader({ urls, onChange, disabled }) {
  const inputRef    = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver]   = useState(false);

  const uploadFiles = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach(f => fd.append('images', f));
      const res = await api.post('/upload/album', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange([...urls, ...res.data.urls]);
    } catch (err) {
      alert('อัพโหลดรูปอัลบั้มไม่สำเร็จ: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleFile = (e) => uploadFiles(e.target.files);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    uploadFiles(e.dataTransfer.files);
  };

  const remove  = (i) => onChange(urls.filter((_, idx) => idx !== i));
  const moveUp  = (i) => { const a = [...urls]; [a[i-1], a[i]] = [a[i], a[i-1]]; onChange(a); };
  const moveDown= (i) => { const a = [...urls]; [a[i], a[i+1]] = [a[i+1], a[i]]; onChange(a); };

  return (
    <div className="album-editor">
      {/* Drop Zone */}
      <div
        className={`album-dropzone ${dragOver ? 'dragover' : ''} ${disabled ? 'disabled' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && !uploading && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFile}
          disabled={disabled || uploading}
          style={{ display: 'none' }}
        />
        {uploading ? (
          <div className="img-uploader-uploading">
            <div className="img-upload-spinner" />
            <p>กำลังอัพโหลด...</p>
          </div>
        ) : (
          <>
            <IoCloudUploadOutline className="album-dropzone-icon" />
            <p className="album-dropzone-label">
              ลากรูปมาวาง หรือ <span>คลิกเพื่อเลือกหลายรูป</span>
            </p>
            <p className="img-uploader-hint">รองรับหลายไฟล์พร้อมกัน — JPG, PNG, WebP</p>
          </>
        )}
      </div>

      {/* Preview List */}
      {urls.length > 0 && (
        <div className="album-preview-list">
          {urls.map((url, i) => (
            <div key={i} className="album-preview-item">
              <div className="album-order-btns">
                <button type="button" disabled={disabled || i === 0} onClick={() => moveUp(i)} title="ขึ้น">▲</button>
                <button type="button" disabled={disabled || i === urls.length - 1} onClick={() => moveDown(i)} title="ลง">▼</button>
              </div>
              <img
                src={url} alt={`album-${i}`} className="album-thumb"
                onError={(e) => { e.target.src = '/images/placeholder.png'; }}
              />
              <span className="album-url-label" title={url}>{url}</span>
              <button type="button" className="album-remove-btn" onClick={() => remove(i)} disabled={disabled}>
                <HiOutlineX />
              </button>
            </div>
          ))}
        </div>
      )}

      {urls.length === 0 && !uploading && (
        <p className="album-empty-hint">
          <HiOutlinePhotograph /> ยังไม่มีรูปในอัลบั้ม
        </p>
      )}
    </div>
  );
}

/* ══════════════════════════════════════
   Main AdminDashboard
   ══════════════════════════════════════ */
function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();

  const [news, setNews]               = useState([]);
  const [categories, setCategories]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showModal, setShowModal]     = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [formData, setFormData]       = useState(INITIAL_FORM);
  const [formErrors, setFormErrors]   = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [isDeleting, setIsDeleting]   = useState(false);
  const notifyTimer = useRef(null);

  const showNotification = useCallback((type, message) => {
    if (notifyTimer.current) clearTimeout(notifyTimer.current);
    setNotification({ type, message });
    notifyTimer.current = setTimeout(() => setNotification(null), 4000);
  }, []);

  useEffect(() => () => { if (notifyTimer.current) clearTimeout(notifyTimer.current); }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [newsRes, catRes] = await Promise.all([newsAPI.getAll(), categoryAPI.getAll()]);
      setNews(newsRes.data);
      setCategories(catRes.data);
    } catch (err) {
      showNotification('error', parseError(err));
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    if (!authLoading && user?.role === 'admin') fetchData();
  }, [authLoading, user, fetchData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleImageChange = (url) => {
    setFormData(prev => ({ ...prev, image: url }));
    if (formErrors.image) setFormErrors(prev => ({ ...prev, image: undefined }));
  };

  const handleAlbumChange = (newUrls) => {
    setFormData(prev => ({ ...prev, albumImages: newUrls }));
  };

  const handleEdit = (item) => {
    setEditingNews(item);
    setFormData({
      title:       item.title || '',
      category:    item.category?._id || item.category || '',
      image:       item.image || '',
      excerpt:     item.excerpt || '',
      content:     item.content || '',
      author:      item.author || '',
      albumImages: Array.isArray(item.albumImages) ? item.albumImages : [],
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
    if (isSubmitting) return;
    setShowModal(false);
    setEditingNews(null);
    setFormData(INITIAL_FORM);
    setFormErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
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
      await fetchData();
    } catch (err) {
      showNotification('error', parseError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await newsAPI.delete(confirmDelete);
      setNews(prev => prev.filter(item => item._id !== confirmDelete));
      showNotification('success', 'ลบข่าวสำเร็จ ✓');
    } catch (err) {
      showNotification('error', parseError(err));
    } finally {
      setIsDeleting(false);
      setConfirmDelete(null);
    }
  };

  if (authLoading) return (
    <div className="admin-page"><Navbar />
      <div className="admin-container"><div className="admin-loading">กำลังตรวจสอบสิทธิ์...</div></div>
    </div>
  );

  if (!user || user.role !== 'admin') return (
    <div className="admin-page"><Navbar />
      <div className="admin-container"><div className="admin-error"><h2>คุณไม่มีสิทธิ์เข้าถึงหน้านี้</h2></div></div>
    </div>
  );

  return (
    <div className="admin-page">
      <Navbar />

      {notification && (
        <div className={`admin-notification admin-notification--${notification.type}`}>
          {notification.type === 'success' ? <IoCheckmarkCircle /> : null}
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
                  <th>อัลบั้ม</th>
                  <th>วันที่</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {news.length > 0 ? news.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <img src={item.image} alt={item.title} className="admin-news-thumb"
                        onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder.png'; }} />
                    </td>
                    <td className="admin-news-title">{item.title}</td>
                    <td>{item.category?.name || 'ไม่มีหมวดหมู่'}</td>
                    <td className="admin-album-count">
                      {Array.isArray(item.albumImages) && item.albumImages.length > 0
                        ? <span className="album-badge"><HiOutlinePhotograph /> {item.albumImages.length} ภาพ</span>
                        : <span className="album-badge-none">—</span>}
                    </td>
                    <td>{new Date(item.createdAt).toLocaleDateString('th-TH')}</td>
                    <td className="admin-actions">
                      <button className="edit-btn" onClick={() => handleEdit(item)} title="แก้ไข"><HiOutlinePencil /></button>
                      <button className="delete-btn" onClick={() => setConfirmDelete(item._id)} title="ลบ"><HiOutlineTrash /></button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="6" className="admin-empty">ยังไม่มีข่าวสาร</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Form Modal ── */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingNews ? 'แก้ไขข่าว' : 'เพิ่มข่าวใหม่'}</h2>
            <form onSubmit={handleSubmit} noValidate>

              <div className={`form-group${formErrors.title ? ' form-group--error' : ''}`}>
                <label>หัวข้อข่าว <span className="required">*</span></label>
                <input type="text" name="title" value={formData.title}
                  onChange={handleInputChange} disabled={isSubmitting} placeholder="กรอกหัวข้อข่าว" />
                {formErrors.title && <span className="form-error-msg">{formErrors.title}</span>}
              </div>

              <div className={`form-group${formErrors.category ? ' form-group--error' : ''}`}>
                <label>หมวดหมู่ <span className="required">*</span></label>
                <select name="category" value={formData.category}
                  onChange={handleInputChange} disabled={isSubmitting}>
                  <option value="">เลือกหมวดหมู่</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
                {formErrors.category && <span className="form-error-msg">{formErrors.category}</span>}
              </div>

              {/* ── รูปหลัก: อัพโหลดไฟล์ ── */}
              <div className={`form-group${formErrors.image ? ' form-group--error' : ''}`}>
                <label>
                  รูปภาพหลัก <span className="required">*</span>
                </label>
                <ImageUploader
                  value={formData.image}
                  onChange={handleImageChange}
                  disabled={isSubmitting}
                />
                {formErrors.image && <span className="form-error-msg">{formErrors.image}</span>}
              </div>

              <div className="form-group">
                <label>คำโปรย (Excerpt)</label>
                <textarea name="excerpt" value={formData.excerpt}
                  onChange={handleInputChange} rows="2" disabled={isSubmitting}
                  placeholder="สรุปข่าวสั้นๆ (ไม่บังคับ)" />
              </div>

              <div className={`form-group${formErrors.content ? ' form-group--error' : ''}`}>
                <label>เนื้อหาข่าว (HTML) <span className="required">*</span></label>
                <textarea name="content" value={formData.content}
                  onChange={handleInputChange} rows="6" disabled={isSubmitting}
                  placeholder="<p>เนื้อหาข่าว...</p>" />
                {formErrors.content && <span className="form-error-msg">{formErrors.content}</span>}
              </div>

              <div className="form-group">
                <label>ผู้เขียน</label>
                <input type="text" name="author" value={formData.author}
                  onChange={handleInputChange} disabled={isSubmitting}
                  placeholder="ชื่อผู้เขียน (ไม่บังคับ)" />
              </div>

              {/* ── อัลบั้มภาพ: อัพโหลดไฟล์ ── */}
              <div className="form-group form-group-album">
                <label>
                  <HiOutlinePhotograph style={{ marginRight: '0.3em', verticalAlign: 'middle' }} />
                  อัลบั้มภาพ <span className="form-optional">(ไม่บังคับ)</span>
                </label>
                <AlbumUploader
                  urls={formData.albumImages}
                  onChange={handleAlbumChange}
                  disabled={isSubmitting}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn"
                  onClick={handleCloseModal} disabled={isSubmitting}>ยกเลิก</button>
                <button type="submit" className="save-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Confirm Delete ── */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => !isDeleting && setConfirmDelete(null)}>
          <div className="modal-content modal-confirm" onClick={(e) => e.stopPropagation()}>
            <h2>ยืนยันการลบ</h2>
            <p>คุณแน่ใจหรือไม่ว่าต้องการลบข่าวนี้?<br />การกระทำนี้ไม่สามารถย้อนกลับได้</p>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setConfirmDelete(null)} disabled={isDeleting}>ยกเลิก</button>
              <button className="delete-btn" onClick={handleDeleteConfirm} disabled={isDeleting}>
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