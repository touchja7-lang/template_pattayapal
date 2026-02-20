import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Popularcard.css';
import { HiOutlineClock, HiOutlineEye } from "react-icons/hi";
import { newsAPI } from '../services/api';

const PopularSection = () => {
  const [popularNews, setPopularNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    newsAPI.getAll()
      .then(res => {
        const sorted = [...res.data]
          .sort((a, b) => (b.views || 0) - (a.views || 0))
          .slice(0, 5);
        setPopularNews(sorted);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="popularcard-loading">กำลังโหลด...</div>;

  return (
    <section className="popularcard-container">
      <h2 className="popularcard-title">📊 ยอดนิยม</h2>

      <div className="popularcard-list">
        {popularNews.map((item, index) => (
          <Link to={`/news/${item._id}`} key={item._id} className="popularcard-item-link">
            <div className="popularcard-item">
              <div className={`popularcard-rank rank-${index + 1}`}>
                {index + 1}
              </div>
              <div className="popularcard-content">
                <h3 className="popularcard-item-title">{item.title}</h3>
                <div className="popularcard-meta">
                  <span className="popularcard-cat">{item.category?.name || 'ทั่วไป'}</span>
                  <span className="popularcard-info"><HiOutlineClock /> {new Date(item.createdAt).toLocaleDateString('th-TH')}</span>
                  <span className="popularcard-info"><HiOutlineEye /> {item.views || 0} ครั้ง</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default PopularSection;