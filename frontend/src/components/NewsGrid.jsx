import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { IoArrowForward } from "react-icons/io5";
import { newsAPI } from '../services/api';
import { useLanguage } from '../context/Languagecontext';
import { useTranslatedNews } from '../hooks/useTranslatedNews';
import './NewsGrid.css';

const NewsGrid = () => {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const { t, lang }               = useLanguage();

  /* แปล news array อัตโนมัติเมื่อ lang เปลี่ยน */
  const { data: displayNews, translating } = useTranslatedNews(newsItems);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await newsAPI.getAll({ params: { sort: '-createdAt', limit: 6 } });
      const data = Array.isArray(response.data) ? response.data : [];
      setNewsItems(data.slice(0, 6));
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('ไม่สามารถดึงข้อมูลข่าวได้');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNews(); }, [fetchNews]);

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (lang === 'en') {
      return d.toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    }
    const day      = String(d.getDate()).padStart(2, '0');
    const monthsTH = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
    const month    = monthsTH[d.getMonth()];
    const year     = d.getFullYear() + 543;
    const h        = String(d.getHours()).padStart(2, '0');
    const m        = String(d.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year} ${h}:${m} น.`;
  };

  if (loading) return (
    <div className="ng-section">
      <div className="ng-skeleton-header" />
      <div className="ng-grid">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="ng-skeleton-card">
            <div className="ng-skeleton-img" />
            <div className="ng-skeleton-line" />
            <div className="ng-skeleton-line short" />
            <div className="ng-skeleton-date" />
          </div>
        ))}
      </div>
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
      {/* Header */}
      <div className="ng-header">
        <div className="ng-header-left">
          <div className="ng-header-bar" />
          <h2 className="ng-title">{t('hero_latest')}</h2>
        </div>
        <Link to="/news" className="ng-view-all">
          {lang === 'en' ? 'View All' : 'ดูทั้งหมด'} <IoArrowForward />
        </Link>
      </div>

      {/* Translating indicator */}
      {translating && (
        <div className="ng-translating">
          <span className="ng-translating-spinner" /> Translating...
        </div>
      )}

      {displayNews.length > 0 ? (
        <div className={`ng-grid ${translating ? 'ng-fading' : ''}`}>
          {displayNews.map((item, index) => (
            <Link
              to={`/news/${item._id}`}
              key={item._id}
              className="ng-card"
              style={{ animationDelay: `${index * 0.07}s` }}
            >
              <div className="ng-card-img-wrap">
                <img
                  src={item.image || item.thumbnail}
                  alt={item.title}
                  className="ng-card-img"
                  onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder.png'; }}
                />
              </div>
              <div className="ng-card-body">
                <p className="ng-card-title">{item.title}</p>
                <span className="ng-card-date">{formatDateTime(item.createdAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="ng-empty">
          {lang === 'en' ? 'No news available at the moment.' : 'ยังไม่มีข้อมูลข่าวในขณะนี้'}
        </div>
      )}
    </div>
  );
};

export default NewsGrid;