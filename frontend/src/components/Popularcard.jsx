import React from 'react';
import { Link } from 'react-router-dom';
import './Popularcard.css';
import { HiOutlineClock, HiOutlineEye } from "react-icons/hi";
import { getPopularNews } from '../data/newsData';

const PopularSection = () => {
  const popularNews = getPopularNews();

  return (
    <section className="popular-container">
      <div className="section-header">
        <h2 className="section-title">📊 ยอดนิยม</h2>
      </div>

      <div className="popular-list">
        {popularNews.map((item, index) => (
          <Link to={`/news/${item.id}`} key={item.id} className="popular-item">
            <div className="popular-rank">
              {index + 1}
            </div>
            <div className="popular-content">
              <h3 className="popular-title">{item.title}</h3>
              <div className="popular-meta">
                <span className="pop-category">{item.category}</span>
                <span className="pop-info">
                  <HiOutlineClock /> {item.time}
                </span>
                <span className="pop-info">
                  <HiOutlineEye /> {item.views} ครั้ง
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