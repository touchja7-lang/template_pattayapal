import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api'; 
import { allNews } from '../data/newsData';
import '../css/News.css';

function CategoryNews() {
  const { categoryName } = useParams();
  const [dbNews, setDbNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndFilterNews = async () => {
      try {
        setLoading(true);
        
        // 1. ดึงข้อมูลข่าวและหมวดหมู่ทั้งหมดขนานกัน
        const [newsRes, categoriesRes] = await Promise.all([
          api.get('/news'),
          api.get('/categories') // ตรวจสอบว่า API นี้มีอยู่จริง
        ]);

        console.log("Raw News Data:", newsRes.data);

        // 2. ค้นหา ID ของหมวดหมู่ที่ตรงกับชื่อใน URL
        const targetCategory = categoriesRes.data.find(
          cat => cat.name.trim() === categoryName.trim()
        );

        if (newsRes.data && Array.isArray(newsRes.data)) {
          const filtered = newsRes.data.filter(news => {
            // ดึงค่า ID หมวดหมู่จากข่าว (รองรับทั้ง Object และ String)
            const newsCatId = news.category?._id || news.category || news.categories;
            
            // เปรียบเทียบรหัส ID
            return newsCatId === targetCategory?._id;
          });

          console.log("Filtered DB News:", filtered);
          setDbNews(filtered);
        }
      } catch (err) {
        console.error("API Error:", err);
        // Fallback: หากดึงหมวดหมู่ไม่ได้ ให้ลองกรองด้วยชื่อตรงๆ เผื่อกรณี Populate แล้ว
        const response = await api.get('/news');
        const fallbackFilter = response.data.filter(n => 
          (n.category?.name || n.category) === categoryName
        );
        setDbNews(fallbackFilter);
      } finally {
        setLoading(false);
      }
    };

    fetchAndFilterNews();
    window.scrollTo(0, 0);
  }, [categoryName]);

  const localFiltered = allNews.filter(news => news.category === categoryName);
  const combinedNews = [...dbNews, ...localFiltered];

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
            {combinedNews.length > 0 ? (
              combinedNews.map((news) => (
                <Link to={`/news/${news._id || news.id}`} key={news._id || news.id} className="news-card">
                  <div className="news-card-image">
                    <img src={news.image || 'https://via.placeholder.com/400x250?text=No+Image'} alt={news.title} />
                    <span className="news-card-category">{categoryName}</span>
                  </div>
                  <div className="news-card-content">
                    <h3 className="news-card-title">{news.title}</h3>
                    <div className="news-card-meta">
                      <span>🕒 {news.createdAt ? new Date(news.createdAt).toLocaleDateString('th-TH') : (news.time || 'เร็วๆ นี้')}</span>
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