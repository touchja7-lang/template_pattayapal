import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './NewsGrid.css';
import { HiOutlineCalendar, HiOutlineEye } from "react-icons/hi";
import { IoArrowForward } from "react-icons/io5";
import { newsAPI } from '../services/api';

const NewsGrid = () => {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await newsAPI.getAll();
      const data = Array.isArray(response.data) ? response.data : [];
      setNewsItems(data.slice(0, 4));
    } catch (err) {
      console.error("Error fetching news:", err);
      setError("ไม่สามารถดึงข้อมูลข่าวได้ กรุณาตรวจสอบการเชื่อมต่อ Backend");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  if (loading) return (
    <div className="news-section">
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>กำลังโหลดข่าวสารล่าสุด...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="news-section">
      <div className="error-box">
        <p>{error}</p>
        <button onClick={fetchNews} className="retry-btn">ลองใหม่อีกครั้ง</button>
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
                <img
                  src={item.image}
                  alt={item.title}
                  className="card-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/placeholder.png';
                  }}
                />
                <span className="card-category">
                  {typeof item.category === 'object'
                    ? item.category?.name
                    : (item.category || 'ข่าวทั่วไป')}
                </span>
              </div>
              <div className="card-body">
                <h3 className="card-title">{item.title}</h3>
                <div className="card-footer">
                  <span className="footer-item">
                    <HiOutlineCalendar className="icon" />
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