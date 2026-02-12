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
    const fetchCategoryNews = async () => {
      try {
        setLoading(true);
        // ดึงข่าวทั้งหมดจาก DB
        const response = await api.get('/news');
        
        if (response.data && Array.isArray(response.data)) {
          const filtered = response.data.filter(news => {
            // ดึงค่าหมวดหมู่มาเช็ค (รองรับทั้งชื่อ field 'category' และ 'categories')
            const categoryData = news.category || news.categories;
            
            let dbCatName = "";
            
            if (typeof categoryData === 'object' && categoryData !== null) {
              // กรณี DB เป็น Object (มีการ Populate มาจาก Backend)
              dbCatName = categoryData.name || categoryData.title || "";
            } else {
              // กรณี DB เป็น String (ชื่อหมวดหมู่โดยตรง)
              dbCatName = String(categoryData);
            }

            // ทำความสะอาดข้อความเพื่อเปรียบเทียบ (ลบช่องว่าง/ตัวเล็กตัวใหญ่)
            const cleanDbCat = dbCatName.trim().toLowerCase();
            const cleanUrlCat = String(categoryName).trim().toLowerCase();

            return cleanDbCat === cleanUrlCat;
          });
          
          setDbNews(filtered);
        }
      } catch (err) {
        console.error("API Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryNews();
    window.scrollTo(0, 0);
  }, [categoryName]);

  // กรองข่าวจากไฟล์ Local (allNews)
  const localFiltered = allNews.filter(news => 
    String(news.category).trim().toLowerCase() === String(categoryName).trim().toLowerCase()
  );

  // รวมข่าว: ข่าวจาก Database ที่ลงเองจะอยู่ด้านบน
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
          <div className="news-grid">
            {combinedNews.length > 0 ? (
              combinedNews.map((news) => (
                <Link to={`/news/${news._id || news.id}`} key={news._id || news.id} className="news-card">
                  <div className="news-card-image">
                    <img src={news.image || news.img || 'https://via.placeholder.com/400x250?text=No+Image'} alt={news.title} />
                    {/* ✅ แก้ไขการแสดงผลชื่อหมวดหมู่ให้รองรับ Object */}
                    <span className="news-card-category">
                      {typeof (news.category || news.categories) === 'object' 
                        ? (news.category?.name || news.categories?.name || categoryName) 
                        : (news.category || news.categories)}
                    </span>
                  </div>
                  <div className="news-card-content">
                    <h3 className="news-card-title">{news.title}</h3>
                    <div className="news-card-meta">
                      <span>🕒 {news.createdAt ? new Date(news.createdAt).toLocaleDateString('th-TH') : (news.time || 'เมื่อเร็วๆ นี้')}</span>
                      <span>👁️ {news.views || 0} ครั้ง</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem' }}>
                <p style={{ fontSize: '1.2rem', color: '#999' }}>ยังไม่มีข่าวในหมวดหมู่ "{categoryName}"</p>
                <Link to="/news" className="back-link" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
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