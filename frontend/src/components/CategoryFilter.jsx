import React from 'react';
import { Link } from 'react-router-dom';
import './CategoryFilter.css';

function CategoryFilter({ categories, selectedCategory, onSelectCategory, news = [] }) {

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear() + 543}`;
  };

  const getCatName = (cat) =>
    cat && typeof cat === 'object' ? cat.name || '' : cat || '';

  return (
    <div className="cf-root">

      {/* ── PAGE TITLE ── */}
      <div className="cf-page-title">
        <h1 className="cf-page-title-text">ข่าวสารทั้งหมด</h1>
        <div className="cf-page-title-line" />
      </div>

      {/* ── FILTER PILLS ── */}
      <div className="cf-pills">
        <button
          className={`cf-pill ${selectedCategory === '' ? 'active' : ''}`}
          onClick={() => onSelectCategory('')}
        >
          ทั้งหมด
        </button>
        {categories.map((category) => (
          <button
            key={category}
            className={`cf-pill ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => onSelectCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* ── NEWS GRID ── */}
      {news.length > 0 ? (
        <div className="cf-grid">
          {news.map((item, index) => (
            <Link
              to={`/news/${item._id}`}
              key={item._id}
              className="cf-card"
              style={{ animationDelay: `${(index % 6) * 0.06}s` }}
            >
              {/* Image */}
              <div className="cf-card-img-wrap">
                <img
                  src={item.image || item.thumbnail}
                  alt={item.title}
                  className="cf-card-img"
                  onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder.png'; }}
                />
                {/* overlay ด้านล่างรูป */}
                <div className="cf-card-img-overlay">
                  {getCatName(item.category) && (
                    <span className="cf-card-cat">{getCatName(item.category)}</span>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="cf-card-body">
                <p className="cf-card-title">{item.title}</p>
                <div className="cf-card-footer">
                  <span className="cf-card-date">{formatDate(item.createdAt)}</span>
                  <span className="cf-card-views">👁 {item.views || 0} ครั้ง</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="cf-empty">ไม่พบข่าวในหมวดหมู่นี้</div>
      )}

    </div>
  );
}

export default CategoryFilter;