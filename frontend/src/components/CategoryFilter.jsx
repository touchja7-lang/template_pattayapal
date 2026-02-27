import React from 'react';
import './CategoryFilter.css';

function CategoryFilter({ categories, selectedCategory, onSelectCategory, news = [] }) {

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.',
                    'ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')} น.`;
  };

  const getCatName = (cat) =>
    cat && typeof cat === 'object' ? cat.name || '' : cat || '';

  return (
    <div className="cf-root">

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
      {news.length > 0 && (
        <div className="cf-section">
          <div className="cf-header">
            <div className="cf-header-bar" />
            <h2 className="cf-title">
              {selectedCategory ? selectedCategory : 'ข่าวล่าสุด'}
            </h2>
          </div>

          <div className="cf-grid">
            {news.map((item) => (
              <a
                href={`/news/${item._id}`}
                key={item._id}
                className="cf-card"
              >
                <div className="cf-card-img-wrap">
                  <img
                    src={item.image || item.thumbnail}
                    alt={item.title}
                    className="cf-card-img"
                    onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder.png'; }}
                  />
                  {getCatName(item.category) && (
                    <span className="cf-card-cat-badge">
                      {getCatName(item.category)}
                    </span>
                  )}
                </div>
                <div className="cf-card-body">
                  <p className="cf-card-title">{item.title}</p>
                  <span className="cf-card-date">{formatDateTime(item.createdAt)}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

export default CategoryFilter;