import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { allNews } from '../data/newsData';
import '../css/News.css';

function CategoryNews() {
  const { categoryName } = useParams();
  
  // กรองข่าวตามหมวดหมู่ที่ได้รับจาก URL
  const filteredNews = allNews.filter(news => news.category === categoryName);

  return (
    <div>
      <Navbar />
      
      <div className="news-page-container">
        <div className="category-header" style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <h2 className="news-page-title">หมวดหมู่: {categoryName}</h2>
            <Link to="/news" style={{ color: '#00a859', textDecoration: 'none', fontWeight: '500' }}>
                ← กลับไปหน้าข่าวทั้งหมด
            </Link>
        </div>

        <div className="filtered-news-grid">
          {filteredNews.length > 0 ? (
            filteredNews.map((news) => (
              <Link to={`/news/${news.id}`} key={news.id} className="news-card">
                <div className="news-card-image">
                  <img src={news.image} alt={news.title} />
                  <span className="news-card-category">{news.category}</span>
                </div>
                <div className="news-card-content">
                  <h3 className="news-card-title">{news.title}</h3>
                  <div className="news-card-meta">
                    <span>{news.time}</span>
                    <span>{news.views} ครั้ง</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
                <p className="no-news">ยังไม่มีข่าวในหมวดหมู่ "{categoryName}"</p>
                <Link to="/news" className="back-to-library" style={{ marginTop: '1rem', display: 'inline-block' }}>
                    ดูข่าวสารอื่นๆ
                </Link>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default CategoryNews;
