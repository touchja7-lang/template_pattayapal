import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IoArrowForward } from "react-icons/io5";
import { newsAPI } from '../services/api';
import './Popularcard.css';

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

  const getCategoryName = (cat) =>
    cat && typeof cat === 'object' ? cat.name || 'ทั่วไป' : cat || 'ทั่วไป';

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
  };

  if (loading) return (
    <section className="ps-section">
      <div className="ps-skeleton-header" />
      <div className="ps-layout">
        <div className="ps-skeleton-featured" />
        <div className="ps-list">
          {[...Array(4)].map((_, i) => <div key={i} className="ps-skeleton-item" />)}
        </div>
      </div>
    </section>
  );

  if (popularNews.length === 0) return null;

  const featured  = popularNews[0];
  const sideItems = popularNews.slice(1);

  return (
    <section className="ps-section">
      {/* Header */}
      <div className="ps-header">
        <div className="ps-header-left">
          <div className="ps-header-bar" />
          <h2 className="ps-title">ข่าวยอดนิยม</h2>
        </div>
        <Link to="/news" className="ps-view-all">
          ดูทั้งหมด <IoArrowForward />
        </Link>
      </div>

      {/* Layout: featured left + list right */}
      <div className="ps-layout">

        {/* Featured card */}
        <Link to={`/news/${featured._id}`} className="ps-featured">
          <div className="ps-featured-img-wrap">
            <img
              src={featured.image || featured.thumbnail}
              alt={featured.title}
              className="ps-featured-img"
              onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder.png'; }}
            />
            <div className="ps-featured-overlay" />
          </div>
          <div className="ps-featured-body">
            <h3 className="ps-featured-title">{featured.title}</h3>
            <span className="ps-cat">{getCategoryName(featured.category)}</span>
          </div>
        </Link>

        {/* Side list */}
        <div className="ps-list">
          {sideItems.map((item) => (
            <Link to={`/news/${item._id}`} key={item._id} className="ps-item">
              <div className="ps-item-img-wrap">
                <img
                  src={item.image || item.thumbnail}
                  alt={item.title}
                  className="ps-item-img"
                  onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder.png'; }}
                />
              </div>
              <div className="ps-item-content">
                <p className="ps-item-title">{item.title}</p>
                <span className="ps-cat">{getCategoryName(item.category)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularSection;