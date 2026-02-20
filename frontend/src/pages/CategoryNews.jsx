import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api'; 
import '../css/News.css';

function CategoryNews() {
  const { categoryName } = useParams();
  const [dbNews, setDbNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndFilterNews = async () => {
      try {
        setLoading(true);
        
        const [newsRes, categoriesRes] = await Promise.all([
          api.get('/news'),
          api.get('/categories')
        ]);

        const targetCategory = categoriesRes.data.find(
          cat => cat.name.trim() === categoryName.trim()
        );

        if (newsRes.data && Array.isArray(newsRes.data)) {
          const filtered = newsRes.data.filter(news => {
            const newsCatId = news.category?._id || news.category || news.categories;
            return newsCatId === targetCategory?._id;
          });
          setDbNews(filtered);
        }
      } catch (err) {
        console.error("API Error:", err);
        try {
          const response = await api.get('/news');
          const fallbackFilter = response.data.filter(n => 
            (n.category?.name || n.category) === categoryName
          );
          setDbNews(fallbackFilter);
        } catch (e) {
          console.error("Fallback Error:", e);
          setDbNews([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAndFilterNews();
    window.scrollTo(0, 0);
  }, [categoryName]);

  return (
    <div className="category-news-page">
      <Navbar />
      <div className="news-page-container">
        <div className="category-header" style={{ marginBottom: '2.5rem', textAlign: 'center', marginTop: '2rem' }}>
          <h2 className="news-page-title" style={{ fontSize: '2.2rem', color: '#004a7c', fontWeight: '700' }}>
            หมวดหมู่: {categoryName}
          </h2>
          <Link to="/news" style={{ color: '#666', textDecoration: 'none', fontSize: '0.95rem' }}>
            ← กลับไปหน้าข่าวทั้งหมด
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem' }}>กำลังค้นหาข่าวสาร...</div>
        ) : (
          <div className="news-grid">
            {dbNews.length > 0 ? (
              dbNews.map((news) => (
                <Link to={`/news/${news._id}`} key={news._id} className="news-card">
                  <div className="news-card-image">
                    <img src={news.image || 'https://via.placeholder.com/400x250?text=No+Image'} alt={news.title} />
                    <span className="news-card-category">{categoryName}</span>
                  </div>
                  <div className="news-card-content">
                    <h3 className="news-card-title">{news.title}</h3>
                    <div className="news-card-meta">
                      <span>🕒 {news.createdAt ? new Date(news.createdAt).toLocaleDateString('th-TH') : 'เร็วๆ นี้'}</span>
                      <span>👁️ {news.views || 0} ครั้ง</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem' }}>
                <p>ไม่พบข่าวสารในหมวดหมู่ "{categoryName}"</p>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default CategoryNews;