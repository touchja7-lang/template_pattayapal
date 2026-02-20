import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Popularcard.css';
import { HiOutlineClock, HiOutlineEye } from "react-icons/hi";
import { newsAPI } from '../services/api';

const PopularSection = () => {
  const [popularNews, setPopularNews] = useState([]);

  useEffect(() => {
    newsAPI.getAll()
      .then(res => setPopularNews(res.data.slice(0, 5)))
      .catch(err => console.error(err));
  }, []);

  return (
    <section className="popular-container">
      <div className="section-header">
        <h2 className="section-title">📊 ยอดนิยม</h2>
      </div>

      <div className="popular-list">
        {popularNews.map((item, index) => (
          <Link to={`/news/${item._id}`} key={item._id} className="popular-item">
            <div className="popular-rank">
              {index + 1}
            </div>
            <div className="popular-content">
              <h3 className="popular-title">{item.title}</h3>
              <div className="popular-meta">
                <span className="pop-category">{item.category?.name || 'ทั่วไป'}</span>
                <span className="pop-info">
                  <HiOutlineClock /> {new Date(item.createdAt).toLocaleDateString('th-TH')}
                </span>
                <span className="pop-info">
                  <HiOutlineEye /> {item.views || 0} ครั้ง
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default PopularSection;