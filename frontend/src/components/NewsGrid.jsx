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
      setNewsItems(data.slice(0, 3));
    } catch (err) {
      console.error("Error fetching news:", err);
      setError("ไม่สามารถดึงข้อมูลข่าวได้");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNews(); }, [fetchNews]);

  if (loading) return (
    <div className="ng-section">
      <div className="ng-loading">กำลังโหลดข่าวสารล่าสุด...</div>
    </div>
  );

  if (error) return (
    <div className="ng-section">
      <div className="ng-error">
        <p>{error}</p>
        <button onClick={fetchNews} className="ng-retry-btn">ลองใหม่อีกครั้ง</button>
      </div>
    </div>
  );

  return (
    <div className="ng-section">
      <div className="ng-header">
        <div className="ng-header-left">
          <span className="ng-label">ล่าสุด</span>
          <h2 className="ng-title">ข่าวล่าสุด</h2>
        </div>
        <Link to="/news" className="ng-view-all">
          ดูทั้งหมด <IoArrowForward />
        </Link>
      </div>

      <div className="ng-grid">
        {newsItems.length > 0 ? newsItems.map((item, index) => (
          <Link to={`/news/${item._id}`} key={item._id} className="ng-card" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="ng-card-image">
              <img
                src={item.image}
                alt={item.title}
                onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder.png'; }}
              />
              <span className="ng-card-category">
                {typeof item.category === 'object' ? item.category?.name : (item.category || 'ข่าวทั่วไป')}
              </span>
            </div>
            <div className="ng-card-body">
              <h3 className="ng-card-title">{item.title}</h3>
              <div className="ng-card-footer">
                <span className="ng-footer-item">
                  <HiOutlineCalendar />
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })
                    : 'ไม่ระบุวันที่'}
                </span>
                <span className="ng-footer-item">
                  <HiOutlineEye /> {item.views || 0}
                </span>
              </div>
            </div>
          </Link>
        )) : (
          <div className="ng-empty">ยังไม่มีข้อมูลข่าวในขณะนี้</div>
        )}
      </div>
    </div>
  );
};

export default NewsGrid;