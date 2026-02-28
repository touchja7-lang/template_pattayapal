import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { IoArrowBack, IoHomeOutline } from 'react-icons/io5';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import '../css/CategoryNews.css';

function CategoryNews() {
  const { categoryName } = useParams();
  const [news, setNews]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const [newsRes, catRes] = await Promise.all([
          api.get('/news'),
          api.get('/categories'),
        ]);

        const target = catRes.data.find(
          c => c.name.trim() === categoryName.trim()
        );

        if (Array.isArray(newsRes.data)) {
          const filtered = target
            ? newsRes.data.filter(n => {
                const cid = n.category?._id || n.category;
                return cid === target._id;
              })
            : newsRes.data.filter(
                n => (n.category?.name || n.category) === categoryName
              );
          setNews(filtered);
        }
      } catch (err) {
        console.error('CategoryNews error:', err);
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    window.scrollTo(0, 0);
  }, [categoryName]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.',
                    'ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
  };

  return (
    <div className="cn-root">
      <Navbar />

      {/* ── PAGE HERO BAR ── */}
      <div className="cn-hero-bar">
        <div className="cn-hero-inner">
          {/* Breadcrumb */}
          <div className="cn-breadcrumb">
            <Link to="/" className="cn-bc-link">
              <IoHomeOutline /> หน้าแรก
            </Link>
            <span className="cn-bc-sep">›</span>
            <Link to="/news" className="cn-bc-link">ข่าวสาร</Link>
            <span className="cn-bc-sep">›</span>
            <span className="cn-bc-current">{categoryName}</span>
          </div>

          {/* Title */}
          <div className="cn-hero-title-row">
            <div>
              <p className="cn-hero-label">หมวดหมู่ข่าว</p>
              <h1 className="cn-hero-title">{categoryName}</h1>
            </div>
          </div>

          {/* Back link */}
          <Link to="/news" className="cn-back-btn">
            <IoArrowBack /> กลับหน้าข่าวทั้งหมด
          </Link>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="cn-container">

        {/* Stats bar */}
        {!loading && (
          <div className="cn-stats-bar">
            <span className="cn-stats-text">
              พบ <strong>{news.length}</strong> ข่าว ในหมวด "{categoryName}"
            </span>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="cn-loading">
            <div className="cn-loading-bars">
              <span /><span /><span /><span />
            </div>
            <p>กำลังโหลดข่าวสาร...</p>
          </div>
        ) : news.length > 0 ? (

          /* News Grid */
          <div className="cn-grid">
            {news.map((item, index) => (
              <Link
                to={`/news/${item._id}`}
                key={item._id}
                className="cn-card"
                style={{ animationDelay: `${(index % 9) * 0.06}s` }}
              >
                <div className="cn-card-img-wrap">
                  <img
                    src={item.image || item.thumbnail}
                    alt={item.title}
                    className="cn-card-img"
                    onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder.png'; }}
                  />
                  <div className="cn-card-overlay">
                    <span className="cn-card-cat">{categoryName}</span>
                  </div>
                </div>
                <div className="cn-card-body">
                  <p className="cn-card-title">{item.title}</p>
                  <div className="cn-card-footer">
                    <span className="cn-card-date">{formatDate(item.createdAt)}</span>
                    <span className="cn-card-views">👁 {item.views || 0}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

        ) : (

          /* Empty state */
          <div className="cn-empty">
            <div className="cn-empty-icon">📭</div>
            <h3>ไม่พบข่าวในหมวด "{categoryName}"</h3>
            <p>ยังไม่มีข่าวสารในหมวดหมู่นี้ในขณะนี้</p>
            <Link to="/news" className="cn-empty-btn">
              <IoArrowBack /> ดูข่าวทั้งหมด
            </Link>
          </div>

        )}
      </div>

      <Footer />
    </div>
  );
}

export default CategoryNews;