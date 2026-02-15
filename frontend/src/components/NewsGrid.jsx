import React, { useState, useEffect } from 'react'; // 1. เพิ่ม useState และ useEffect
import { Link } from 'react-router-dom';
import './NewsGrid.css';
import { HiOutlineCalendar, HiOutlineEye } from "react-icons/hi";
import { IoArrowForward } from "react-icons/io5";
import axios from 'axios'; // 2. แนะนำให้ใช้ axios (ติดตั้งด้วย npm install axios)

const NewsGrid = () => {
  const [newsItems, setNewsItems] = useState([]); // เก็บรายการข่าว
  const [loading, setLoading] = useState(true);   // สถานะการโหลด
  const [error, setError] = useState(null);      // เก็บข้อผิดพลาด

  useEffect(() => {
    // 3. ฟังก์ชันดึงข้อมูลจาก API
    const fetchNews = async () => {
      try {
        setLoading(true);
        // เปลี่ยน URL เป็น API ของคุณ (เช่น http://localhost:5000/api/news)
        const response = await axios.get('https://your-api-url.com/api/news/grid'); 
        setNewsItems(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching news:", err);
        setError("ไม่สามารถโหลดข้อมูลข่าวได้");
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // 4. แสดงผลระหว่างรอข้อมูล
  if (loading) return <div className="loading-state">กำลังโหลดข่าวล่าสุด...</div>;
  if (error) return <div className="error-state">{error}</div>;

  return (
    <div className="news-section">
      <div className="news-header">
        <h2 className="section-title">ข่าวล่าสุด</h2>
        <Link to="/news" className="view-all">
          ดูทั้งหมด <IoArrowForward />
        </Link>
      </div>

      <div className="news-grid">
        {newsItems.map((item) => (
          // ใช้ item._id หากฐานข้อมูลเป็น MongoDB
          <Link to={`/news/${item._id || item.id}`} key={item._id || item.id} className="news-card">
            <div className="card-image-container">
              <img src={item.image} alt={item.title} className="card-image" />
              <span className="card-category">{item.category}</span>
            </div>
            <div className="card-body">
              <h3 className="card-title">{item.title}</h3>
              <div className="card-footer">
                <span className="footer-item">
                  <HiOutlineCalendar className="icon" /> {item.time || item.date}
                </span>
                <span className="footer-item">
                  <HiOutlineEye className="icon" /> {item.views}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default NewsGrid;