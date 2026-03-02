import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/Languagecontext';
import './CategoryFilter.css';

function CategoryFilter({ categories, selectedCategory, onSelectCategory, news = [] }) {
  const { t, lang } = useLanguage();

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (lang === 'en') {
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear() + 543}`;
  };

  // ดึงชื่อหมวดหมู่และส่งเข้าฟังก์ชัน t() เพื่อแปลภาษา
  const getCatName = (cat) => {
    const name = cat && typeof cat === 'object' ? cat.name || '' : cat || '';
    return t(name); // แปลภาษา Real-time จาก Key ที่ได้จาก DB
  };

  return (
    <div className="cf-root">
      <div className="cf-page-title">
        <h1 className="cf-page-title-text">{t('cf_title')}</h1>
        <div className="cf-page-title-line" />
      </div>

      <div className="cf-pills">
        <button
          className={`cf-pill ${selectedCategory === '' ? 'active' : ''}`}
          onClick={() => onSelectCategory('')}
        >
          {t('cf_all')}
        </button>
        {categories.map((category) => (
          <button
            key={category}
            className={`cf-pill ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => onSelectCategory(category)}
          >
            {/* แปลชื่อหมวดหมู่บนปุ่ม Filter */}
            {t(category)}
          </button>
        ))}
      </div>

      {news.length > 0 ? (
        <div className="cf-grid">
          {news.map((item, index) => (
            <Link
              to={`/news/${item._id}`}
              key={item._id}
              className="cf-card"
              style={{ animationDelay: `${(index % 6) * 0.06}s` }}
            >
              <div className="cf-card-img-wrap">
                <img
                  src={item.image || item.thumbnail}
                  alt={item.title}
                  className="cf-card-img"
                  onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder.png'; }}
                />
                <div className="cf-card-img-overlay">
                  {item.category && (
                    <span className="cf-card-cat">
                      {/* แปลชื่อหมวดหมู่บน Tag บนรูปภาพ */}
                      {getCatName(item.category)}
                    </span>
                  )}
                </div>
              </div>
              <div className="cf-card-body">
                <p className="cf-card-title">{item.title}</p>
                <div className="cf-card-footer">
                  <span className="cf-card-date">{formatDate(item.createdAt)}</span>
                  <span className="cf-card-views">
                    👁 {item.views || 0} {t('popular_views')}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="cf-empty">{t('cf_noNews')}</div>
      )}
    </div>
  );
}

export default CategoryFilter;