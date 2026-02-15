import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './NewsGrid.css';
import { HiOutlineCalendar, HiOutlineEye } from "react-icons/hi";
import { IoArrowForward } from "react-icons/io5";
import axios from 'axios';

const NewsGrid = () => {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        // 🟢 แก้ไข URL: ใช้พอร์ต 5000 และเส้นทาง /api/news ตาม Backend
        // หาก Deploy แล้ว ให้เปลี่ยน localhost เป็น URL ของ Server จริง
        const response = await axios.get('http://localhost:5000/api/news'); 
        
        // Backend ของคุณส่งข่าวทั้งหมดมา เราจะเลือกโชว์แค่ 4 ข่าวล่าสุดที่หน้าแรก
        setNewsItems(response.data.slice(0, 4));
        setLoading(false);
      } catch (err) {
        console.error("Error fetching news:", err);
        setError("ไม่สามารถดึงข้อมูลข่าวจากฐานข้อมูลได้");
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) return (
    <div className="news-section">
      <div className="loading-state">กำลังโหลดข่าวสาร...</div>
    </div>
  );

  if (error) return (
    <div className="news-section">
      <div className="error-state">{error}</div>
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
            // 🟢 เปลี่ยนจาก item.id เป็น item._id เพราะ MongoDB ใช้ _id
            <Link to={`/news/${item._id}`} key={item._id} className="news-card">
              <div className="card-image-container">
                <img src={item.image} alt={item.title} className="card-image" />
                {/* 🟢 Backend ของคุณ populate category มาเป็น Object */}
                <span className="card-category">
                  {item.category?.name || 'ข่าวทั่วไป'}
                </span>
              </div>
              <div className="card-body">
                <h3 className="card-title">{item.title}</h3>
                <div className="card-footer">
                  <span className="footer-item">
                    <HiOutlineCalendar className="icon" /> 
                    {/* แปลงวันที่จาก MongoDB (createdAt) เป็นวันที่อ่านง่าย */}
                    {new Date(item.createdAt).toLocaleDateString('th-TH')}
                  </span>
                  <span className="footer-item">
                    <HiOutlineEye className="icon" /> {item.views || 0}
                  </span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p className="no-news">ยังไม่มีข้อมูลข่าวในขณะนี้</p>
        )}
      </div>
    </div>
  );
};

export default NewsGrid;