import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import './ImageSlider.css';

const ImageSlider = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestNews = async () => {
      try {
        const response = await api.get('/news', {
          params: { sort: '-createdAt', limit: 6 }
        });
        if (response.data && response.data.length > 0) {
          setNews(response.data);
        }
      } catch (err) {
        console.error('Error fetching slider news:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLatestNews();
  }, []);

  if (loading) {
    return (
      <div className="isl-loading">
        <div className="isl-loading-spinner" />
        <span>กำลังโหลดข่าว...</span>
      </div>
    );
  }

  if (news.length === 0) return null;

  const featured = news[0];
  const sideNews  = news.slice(1, 5);

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m} น.`;
  };

  const getCategoryName = (cat) =>
    cat && typeof cat === 'object' ? cat.name || 'ข่าวสาร' : cat || 'ข่าวสาร';

  return (
    <section className="isl-section">
      {/* ── HEADER ── */}
      <div className="isl-header">
        <div className="isl-header-icon">✦</div>
        <h2 className="isl-header-title">ข่าวเด่นวันนี้</h2>
      </div>

      {/* ── CONTENT GRID ── */}
      <div className="isl-grid">

        {/* LEFT: Featured */}
        <Link to={`/news/${featured._id}`} className="isl-featured">
          <div className="isl-featured-img-wrap">
            <img
              src={featured.image || featured.thumbnail}
              alt={featured.title}
              className="isl-featured-img"
            />
            <div className="isl-featured-overlay" />
          </div>
          <div className="isl-featured-body">
            <span className="isl-time">{formatTime(featured.createdAt)}</span>
            <span className="isl-cat-tag">{getCategoryName(featured.category)}</span>
            <h3 className="isl-featured-title">{featured.title}</h3>
            <div className="isl-meta">
              <span>👁 {featured.views || 0} ครั้ง</span>
            </div>
          </div>
        </Link>

        {/* RIGHT: Side list */}
        <div className="isl-side">
          <div className="isl-side-header">
            <h3 className="isl-side-title">รายงานความคืบหน้า</h3>
            <Link to="/news" className="isl-side-more">ดูเพิ่มเติม →</Link>
          </div>

          <div className="isl-side-list">
            {sideNews.map((item) => (
              <Link to={`/news/${item._id}`} key={item._id} className="isl-side-item">
                <div className="isl-side-img-wrap">
                  <img
                    src={item.image || item.thumbnail}
                    alt={item.title}
                    className="isl-side-img"
                  />
                  <span className="isl-side-time">{formatTime(item.createdAt)}</span>
                </div>
                <div className="isl-side-content">
                  <p className="isl-side-item-title">{item.title}</p>
                  <span className="isl-side-views">👁 {item.views || 0} ครั้ง</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImageSlider;