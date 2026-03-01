import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import { useLanguage } from '../context/Languagecontext';
import { useTranslatedNews } from '../hooks/useTranslatedNews';
import './ImageSlider.css';

const ImageSlider = () => {
  const [rawNews, setRawNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t, lang }           = useLanguage();

  const { data: news } = useTranslatedNews(rawNews);

  useEffect(() => {
    const fetchLatestNews = async () => {
      try {
        const response = await api.get('/news', {
          params: { sort: '-createdAt', limit: 6 }
        });
        if (response.data && response.data.length > 0) {
          setRawNews(response.data);
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
        <span>{t('nd_loading')}</span>
      </div>
    );
  }

  if (news.length === 0) return null;

  const featured = news[0];
  const sideNews  = news.slice(1, 5);

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (lang === 'en') {
      return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    }
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m} น.`;
  };

  const getCategoryName = (cat) =>
    cat && typeof cat === 'object'
      ? cat.name || t('nd_news')
      : cat || t('nd_news');

  return (
    <section className="isl-section">
      <div className="isl-header">
        <div className="isl-header-icon" />
        <h2 className="isl-header-title">{t('hero_latest')}</h2>
      </div>

      <div className="isl-grid">

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
            <h3 className="isl-featured-title">{featured.title}</h3>
            <div className="isl-meta">
              <span>👁 {featured.views || 0} {t('views')}</span>
            </div>
          </div>
        </Link>

        <div className="isl-side">
          <div className="isl-side-header">
            <h3 className="isl-side-title">
              {lang === 'en' ? 'Latest Updates' : 'รายงานความคืบหน้า'}
            </h3>
            <Link to="/news" className="isl-side-more">
              {lang === 'en' ? 'View More →' : 'ดูเพิ่มเติม →'}
            </Link>
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
                  <span className="isl-side-views">👁 {item.views || 0} {t('views')}</span>
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