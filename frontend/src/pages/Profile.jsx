import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { HiOutlineCamera, HiArrowLeft } from "react-icons/hi";
import '../css/Profile.css';

function Profile() {
  // ดึงข้อมูล user และฟังก์ชัน login (หรือ updateUser) จาก Context
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const profileInputRef = useRef(null);
  const backgroundInputRef = useRef(null);

  const avatars = [
    { id: 1, url: 'https://cdn-icons-png.flaticon.com/512/616/616408.png' },
    { id: 2, url: 'https://cdn-icons-png.flaticon.com/512/616/616430.png' },
    { id: 3, url: 'https://cdn-icons-png.flaticon.com/512/616/616412.png' },
    { id: 4, url: 'https://cdn-icons-png.flaticon.com/512/616/616428.png' },
    { id: 5, url: 'https://cdn-icons-png.flaticon.com/512/616/616554.png' },
    { id: 6, url: 'https://cdn-icons-png.flaticon.com/512/616/616432.png' },
  ];

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    profileImage: avatars[0].url,
    backgroundImage: null,
    profileFile: null,
    backgroundFile: null
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName || '',
        email: user.email || '',
        profileImage: user.profileImage || avatars[0].url,
        backgroundImage: user.backgroundImage || null
      }));
    }
  }, [user]);

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'profile') {
          setFormData(prev => ({ ...prev, profileImage: reader.result, profileFile: file }));
        } else {
          setFormData(prev => ({ ...prev, backgroundImage: reader.result, backgroundFile: file }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarSelect = (url) => {
    setFormData(prev => ({ ...prev, profileImage: url, profileFile: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const data = new FormData();
      data.append('fullName', formData.fullName);
      data.append('email', formData.email);
      
      // ถ้ามีการอัปโหลดไฟล์ใหม่ ให้ส่งไฟล์ไป
      if (formData.profileFile) {
        data.append('profileImage', formData.profileFile);
      } else {
        // ถ้าใช้รูป Avatar จากลิสต์ ให้ส่ง URL ไปแทน
        data.append('profileImage', formData.profileImage);
      }
      
      if (formData.backgroundFile) {
        data.append('backgroundImage', formData.backgroundFile);
      }

      // เรียก API อัปเดตโปรไฟล์
      const response = await authAPI.updateProfile(data);
      
      // ดึง Token เดิมที่มีอยู่
      const token = localStorage.getItem('token');
      
      // ✅ หัวใจสำคัญ: เรียก login หรือฟังก์ชันอัปเดตเพื่อเปลี่ยน State ใน Context ทันที
      // ข้อมูล user ใหม่จาก Backend จะทำให้ Navbar เปลี่ยนรูปตาม
      if (response.data.user) {
        login(response.data.user, token);
        setMessage({ type: 'success', text: 'บันทึกการเปลี่ยนแปลงสำเร็จ' });
      }
    } catch (err) {
      console.error("Update Profile Error:", err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึก' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="profile-page-bg">
      <Navbar />
      
      <div className="profile-container">
        <div className="profile-header-nav">
          <button onClick={() => window.history.back()} className="back-btn">
            <HiArrowLeft />
          </button>
          <div className="header-text">
            <h1>แก้ไขโปรไฟล์</h1>
            <p>อัปเดตข้อมูลส่วนตัวและรูปภาพของคุณ</p>
          </div>
        </div>

        <div className="profile-main-card">
          <form onSubmit={handleSubmit}>
            <div className="profile-grid">
              
              {/* ฝั่งซ้าย: จัดการรูปโปรไฟล์ */}
              <div className="profile-left-section">
                <label className="section-label">🧠 เลือกรูปโปรไฟล์</label>
                <div className="current-avatar-display">
                  <img src={formData.profileImage} alt="Profile" />
                  <div className="check-badge">✓</div>
                </div>

                <div className="avatar-selection-grid">
                  {avatars.map((av) => (
                    <div 
                      key={av.id} 
                      className={`avatar-item ${formData.profileImage === av.url ? 'active' : ''}`}
                      onClick={() => handleAvatarSelect(av.url)}
                    >
                      <img src={av.url} alt="avatar option" />
                    </div>
                  ))}
                </div>

                <input 
                  type="file" 
                  ref={profileInputRef} 
                  hidden 
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'profile')}
                />
                <div className="upload-box-dashed mt-4" onClick={() => profileInputRef.current.click()}>
                    <div className="upload-content">
                      <HiOutlineCamera className="upload-icon" />
                      <p>หรืออัปโหลดรูปของคุณเอง</p>
                      <span>รองรับ JPG, PNG (สูงสุด 3MB)</span>
                    </div>
                </div>
              </div>

              {/* ฝั่งขวา: พื้นหลังและข้อมูลชื่อ */}
              <div className="profile-right-section">
                <label className="section-label">🖼️ พื้นหลังโปรไฟล์</label>
                <div className="bg-preview-box">
                  {formData.backgroundImage ? (
                    <img src={formData.backgroundImage} alt="Background" className="bg-preview-img" />
                  ) : (
                    <div className="empty-bg">
                      <img src="https://cdn-icons-png.flaticon.com/512/1160/1160358.png" alt="icon" />
                    </div>
                  )}
                </div>

                <input 
                  type="file" 
                  ref={backgroundInputRef} 
                  hidden 
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'background')}
                />
                <div className="upload-box-dashed mt-3" onClick={() => backgroundInputRef.current.click()}>
                    <div className="upload-content">
                      <HiOutlineCamera className="upload-icon" />
                      <p>คลิกเพื่ออัปโหลด <span>หรือลากไฟล์มาวางที่นี่</span></p>
                      <span>รองรับ JPG, PNG, GIF, WEBP (สูงสุด 5MB)</span>
                    </div>
                </div>

                <div className="info-form-section">
                  <label className="section-label mt-4">👤 ข้อมูลส่วนตัว</label>
                  <div className="form-group-custom">
                    <label>📝 ชื่อเต็ม</label>
                    <input 
                      type="text" 
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      required
                    />
                    <span className="input-hint">ชื่อที่จะแสดงในโปรไฟล์ของคุณ</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-footer-actions">
              <div className={`status-msg ${message.type}`}>{message.text}</div>
              <div className="btn-group">
                <button type="button" className="btn-cancel" onClick={() => window.location.reload()}>คืนค่า</button>
                <button type="submit" className="btn-save" disabled={loading}>
                  {loading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Profile;