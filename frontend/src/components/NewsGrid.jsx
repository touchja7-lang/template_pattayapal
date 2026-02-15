import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './NewsGrid.css';
import { HiOutlineCalendar, HiOutlineEye } from "react-icons/hi";
import { IoArrowForward } from "react-icons/io5";
import { newsAPI } from '../services/api'; // 🟢 เปลี่ยนมาดึงผ่าน newsAPI ที่เราสร้างไว้

const NewsGrid = () => {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        
        // 🟢 เรียกใช้ผ่าน newsAPI.getAll() 
        // ตัวนี้จะวิ่งไปที่ BASE_URL/api/news อัตโนมัติ ตามที่เราตั้งใน api.js
        const response = await newsAPI.getAll(); 
        
        // ตรวจสอบว่าข้อมูลที่ได้มาเป็น Array หรือไม่ (ป้องกันกรณี Backend ส่งรูปแบบอื่นมา)
        const data = Array.isArray(response.data) ? response.data : [];
        
        // เลือกแสดงเฉพาะ 4 ข่าวล่าสุด
        setNewsItems(data.slice(0, 4));
        setLoading(false);
      } catch (err) {
        console.error("Error fetching news:", err);
        // แสดง Error ที่ละเอียดขึ้นใน Console เพื่อการ Debug
        setError("ไม่สามารถดึงข้อมูลข่าวได้ กรุณาตรวจสอบการเชื่อมต่อ Backend");
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // ส่วนการแสดงผล Loading State
  if (loading) return (
    <div className="news-section">
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>กำลังโหลดข่าวสารล่าสุด...</p>
      </div>
    </div>
  );

  // ส่วนการแสดงผล Error State
  if (error) return (
    <div className="news-section">
      <div className="error-box">
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-btn">ลองใหม่อีกครั้ง</button>
      </div>
    </div>
  );

  return (
    <div className="news-section">
      <div className="news-header">
        <h2 className="section-title">ข่าวล่าสุด</h2>
        <Link to="/news" className="view-all">
          ดูทั้งหมด <IoArrowForward />
        </Link>
      </div>

      <div className="news-grid">
        {newsItems.length > 0 ? (
          newsItems.map((item) => (
            <Link to={`/news/${item._id}`} key={item._id} className="news-card">
              <div className="card-image-container">
                {/* 🟢 ใช้ภาพ placeholder หากใน DB ไม่มีรูป */}
                <img 
                  src={item.image || 'https://via.placeholder.com/400x225?text=No+Image'} 
                  alt={item.title} 
                  className="card-image" 
                />
                <span className="card-category">
                  {/* รองรับทั้งกรณี category เป็น String หรือ Object */}
                  {typeof item.category === 'object' ? item.category?.name : (item.category || 'ข่าวทั่วไป')}
                </span>
              </div>
              <div className="card-body">
                <h3 className="card-title">{item.title}</h3>
                <div className="card-footer">
                  <span className="footer-item">
                    <HiOutlineCalendar className="icon" /> 
                    {/* จัดรูปแบบวันที่ให้เป็นระเบียบ */}
                    {item.createdAt 
                      ? new Date(item.createdAt).toLocaleDateString('th-TH', { 
                          day: '2-digit', month: 'short', year: 'numeric' 
                        }) 
                      : 'ไม่ระบุวันที่'}
                  </span>
                  <span className="footer-item">
                    <HiOutlineEye className="icon" /> {item.views || 0}
                  </span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="no-news-container">
            <p className="no-news">ยังไม่มีข้อมูลข่าวในขณะนี้</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsGrid;