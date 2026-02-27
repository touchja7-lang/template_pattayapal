import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { IoChevronBack, IoChevronForward, IoHomeOutline } from 'react-icons/io5';
import { newsAPI, categoryAPI } from '../services/api';
import './NewsHero.css';

const NewsHero = ({ currentCategory = '' }) => {
  const [slides, setSlides]         = useState([]);
  const [sideNews, setSideNews]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [current, setCurrent]       = useState(0);
  const [loading, setLoading]       = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [newsRes, catRes] = await Promise.all([
          newsAPI.getAll({ params: { sort: '-createdAt', limit: 15 } }),
          categoryAPI.getAll(),
        ]);
        const all = Array.isArray(newsRes.data) ? newsRes.data : [];
        setSlides(all.slice(0, 5));
        setSideNews(all.slice(5, 11)); // ดึง 6 รายการ
        setCategories(catRes.data || []);
      } catch (err) {
        console.error('NewsHero fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, [slides]);

  const goTo = (idx) => {
    clearInterval(timerRef.current);
    setCurrent((idx + slides.length) % slides.length);
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.',
                    'ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')} น.`;
  };

  const getCatName = (cat) =>
    cat && typeof cat === 'object' ? cat.name || 'ทั่วไป' : cat || 'ทั่วไป';

  if (loading) return (
    <div className="nh-root">
      <div className="nh-skeleton-title" />
      <div className="nh-skeleton-cats" />
      <div className="nh-body">
        <div className="nh-skeleton-slider" />
        <div className="nh-skeleton-side">
          {[...Array(6)].map((_, i) => <div key={i} className="nh-skeleton-side-item" />)}
        </div>
      </div>
    </div>
  );

  const slide = slides[current];

  return (
    <div className="nh-root">

      {/* PAGE TITLE */}
      <div className="nh-title-wrap">
        <div className="nh-title-line" />
        <h1 className="nh-title">ข่าว</h1>
        <div className="nh-title-line" />
      </div>

      {/* BREADCRUMB */}
      <div className="nh-breadcrumb">
        <Link to="/" className="nh-bc-home"><IoHomeOutline /> หน้าแรก</Link>
        <span className="nh-bc-sep">›</span>
        <span className="nh-bc-current">ข่าว</span>
      </div>

      {/* CATEGORY PILLS */}
      <div className="nh-cats">
        <Link to="/news" className={`nh-cat-pill ${!currentCategory ? 'active' : ''}`}>
          ทั้งหมด
        </Link>
        {categories.map(cat => (
          <Link
            key={cat._id}
            to={`/news/category/${encodeURIComponent(cat.name)}`}
            className={`nh-cat-pill ${currentCategory === cat.name ? 'active' : ''}`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* BODY */}
      {slides.length > 0 && (
        <div className="nh-body">

          {/* SLIDER */}
          <div className="nh-slider">
            <Link to={`/news/${slide._id}`} className="nh-slide">
              <div className="nh-slide-img-wrap">
                <img
                  src={slide.image || slide.thumbnail}
                  alt={slide.title}
                  className="nh-slide-img"
                  onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder.png'; }}
                />
                <div className="nh-slide-overlay" />
              </div>
              <div className="nh-slide-body">
                <span className="nh-slide-cat">{getCatName(slide.category)}</span>
                <h2 className="nh-slide-title">{slide.title}</h2>
                <span className="nh-slide-date">{formatDateTime(slide.createdAt)}</span>
              </div>
            </Link>

            <button className="nh-arrow left"  onClick={() => goTo(current - 1)} aria-label="prev"><IoChevronBack /></button>
            <button className="nh-arrow right" onClick={() => goTo(current + 1)} aria-label="next"><IoChevronForward /></button>

            <div className="nh-dots">
              {slides.map((_, i) => (
                <button key={i} className={`nh-dot ${i === current ? 'active' : ''}`} onClick={() => goTo(i)} />
              ))}
            </div>
          </div>

          {/* SIDE NEWS — 6 items, scroll เต็มความสูง slider */}
          <div className="nh-side">
            {sideNews.map(item => (
              <Link to={`/news/${item._id}`} key={item._id} className="nh-side-item">
                <div className="nh-side-img-wrap">
                  <img
                    src={item.image || item.thumbnail}
                    alt={item.title}
                    className="nh-side-img"
                    onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder.png'; }}
                  />
                </div>
                <div className="nh-side-content">
                  <p className="nh-side-title">{item.title}</p>
                  <div className="nh-side-meta">
                    <span className="nh-side-cat">{getCatName(item.category)}</span>
                    <span className="nh-side-date">{formatDateTime(item.createdAt)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

        </div>
      )}
    </div>
  );
};

export default NewsHero;