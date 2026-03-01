import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IoArrowForward } from 'react-icons/io5';
import { newsAPI } from '../services/api';
import { useLanguage } from '../context/Languagecontext';
import { useTranslatedNews } from '../hooks/useTranslatedNews';
import './Popularcard.css';

// รับ news prop จากข้างนอกได้ (News.jsx ส่งมา)
// ถ้าไม่มี prop จะดึงข้อมูลเองเหมือนเดิม (ใช้ใน Home.jsx)
const PopularSection = ({ news: newsProp }) => {
  const { t, lang }           = useLanguage();
  const [rawNews, setRawNews] = useState([]);
  const [loading, setLoading] = useState(!newsProp);

  // ดึงข้อมูลเองเฉพาะตอนไม่มี prop (Home.jsx)
  useEffect(() => {
    if (newsProp) return;
    newsAPI.getAll()
      .then(res => {
        const sorted = [...res.data]
          .sort((a, b) => (b.views || 0) - (a.views || 0))
          .slice(0, 5);
        setRawNews(sorted);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [newsProp]);

  // ถ้ามี prop ให้เอา 5 อันดับแรกตาม views
  const sourceNews = newsProp
    ? [...newsProp].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5)
    : rawNews;

  // แปลภาษา
  const { data: popularNews, translating } = useTranslatedNews(sourceNews);

  const getCategoryName = (cat) =>
    cat && typeof cat === 'object' ? cat.name || (lang === 'en' ? 'General' : 'ทั่วไป') : cat || (lang === 'en' ? 'General' : 'ทั่วไป');

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (lang === 'en') {
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }
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
      <div className="ps-header">
        <div className="ps-header-left">
          <div className="ps-header-bar" />
          <h2 className="ps-title">{t('popular_title')}</h2>
        </div>
        <Link to="/news" className="ps-view-all">
          {lang === 'en' ? 'View All' : 'ดูทั้งหมด'} <IoArrowForward />
        </Link>
      </div>

      {translating && (
        <div className="ps-translating">
          <span className="ps-translating-spinner" /> {t('translating')}
        </div>
      )}

      <div className={`ps-layout ${translating ? 'ps-fading' : ''}`}>

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
                <span className="ps-item-date">{formatDate(item.createdAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularSection;