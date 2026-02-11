import React from 'react';
import { Link } from 'react-router-dom';
import './NewsGrid.css';
import { HiOutlineCalendar, HiOutlineEye } from "react-icons/hi";
import { IoArrowForward } from "react-icons/io5";
import { getGridNews } from '../data/newsData';

const NewsGrid = () => {
  const newsItems = getGridNews();

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
          <Link to={`/news/${item.id}`} key={item.id} className="news-card">
            <div className="card-image-container">
              <img src={item.image} alt={item.title} className="card-image" />
              <span className="card-category">{item.category}</span>
            </div>
            <div className="card-body">
              <h3 className="card-title">{item.title}</h3>
              <div className="card-footer">
                <span className="footer-item">
                  <HiOutlineCalendar className="icon" /> {item.time}
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