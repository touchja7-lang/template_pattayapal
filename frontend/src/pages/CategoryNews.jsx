import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api'; // ✅ เรียกใช้ api เพื่อคุยกับ MongoDB
import { allNews } from '../data/newsData'; 
import '../css/News.css';

function CategoryNews() {
  const { categoryName } = useParams();
  const [dbNews, setDbNews] = useState([]); // เก็บข่าวที่ลงเองจาก DB
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryNews = async () => {
      try {
        setLoading(true);
        // ✅ ดึงข่าวจาก Database โดยกรองตามหมวดหมู่ที่ได้รับจาก URL
        const response = await api.get('/news', { 
          params: { category: categoryName } 
        });
        setDbNews(response.data);
      } catch (err) {
        console.error("Error fetching category news:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryNews();
    window.scrollTo(0, 0); // เลื่อนหน้าจอขึ้นไปบนสุดเวลาเปลี่ยนหมวดหมู่
  }, [categoryName]);

  // กรองข่าวจากไฟล์ Local (allNews) เผื่อไว้กรณีไม่มีใน DB
  const localFiltered = allNews.filter(news => news.category === categoryName);

  // รวมข่าวจากทั้ง 2 แหล่งเข้าด้วยกัน
  const combinedNews = [...dbNews, ...localFiltered];

  return (
    <div className="category-news-page">
      <Navbar />
      
      <div className="news-page-container">
        <div className="category-header" style={{ marginBottom: '2.5rem', textAlign: 'center', marginTop: '2rem' }}>
            <h2 className="news-page-title" style={{ fontSize: '2.2rem', color: '#004a7c', fontWeight: '700' }}>
                หมวดหมู่: {categoryName}
            </h2>
            <div style={{ marginTop: '10px' }}>
                <Link to="/news" style={{ color: '#666', textDecoration: 'none', fontSize: '0.95rem' }}>
                    ← กลับไปหน้าข่าวทั้งหมด
                </Link>
            </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem', fontSize: '1.2rem', color: '#888' }}>
              กำลังรวบรวมข่าวสารในหมวดหมู่ {categoryName}...
          </div>
        ) : (
          <div className="news-grid"> {/* ✅ ใช้ Grid เพื่อจัดให้ข่าวอยู่ด้วยกันอย่างเป็นระเบียบ */}
            {combinedNews.length > 0 ? (
              combinedNews.map((news) => (
                <Link to={`/news/${news._id || news.id}`} key={news._id || news.id} className="news-card">
                  <div className="news-card-image">
                    <img src={news.image} alt={news.title} />
                    <span className="news-card-category">{news.category}</span>
                  </div>
                  <div className="news-card-content">
                    <h3 className="news-card-title">{news.title}</h3>
                    <div className="news-card-meta">
                      <span>🕒 {news.time || new Date(news.createdAt).toLocaleDateString('th-TH')}</span>
                      <span>👁️ {news.views || 0} ครั้ง</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem' }}>
                  <p style={{ fontSize: '1.2rem', color: '#999' }}>ยังไม่มีข่าวในหมวดหมู่ "{categoryName}"</p>
                  <Link to="/news" className="back-to-library" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
                      ดูข่าวสารอื่นๆ ทั้งหมด
                  </Link>
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