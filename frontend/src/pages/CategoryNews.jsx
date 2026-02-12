import React, { useState, useEffect } from 'react'; // เพิ่ม useState, useEffect
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api'; // เพิ่มการเรียกใช้ API
import { allNews } from '../data/newsData'; 
import '../css/News.css';

function CategoryNews() {
  const { categoryName } = useParams();
  const [newsFromDB, setNewsFromDB] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        // ดึงข่าวจาก API โดยระบุหมวดหมู่
        const response = await api.get('/news', { params: { category: categoryName } });
        setNewsFromDB(response.data);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [categoryName]);

  // รวมข่าวจาก Database และข่าวจำลอง (ถ้ามี)
  const localFiltered = allNews.filter(news => news.category === categoryName);
  const combinedNews = [...newsFromDB, ...localFiltered];

  return (
    <div>
      <Navbar />
      <div className="news-page-container">
        <div className="category-header" style={{ marginBottom: '2rem', textAlign: 'center', marginTop: '2rem' }}>
            <h2 className="news-page-title" style={{ fontSize: '2rem', color: '#004a7c' }}>
              หมวดหมู่: {categoryName}
            </h2>
            <Link to="/news" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem' }}>
                ← กลับไปหน้าข่าวทั้งหมด
            </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>กำลังโหลดข่าว...</div>
        ) : (
          <div className="news-grid"> {/* ใช้ class news-grid เพื่อความเป็นระเบียบ */}
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
                      <span>{news.time || news.createdAt?.substring(0,10)}</span>
                      <span>{news.views} ครั้ง</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem' }}>
                  <p className="no-news">ยังไม่มีข่าวในหมวดหมู่ "{categoryName}"</p>
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