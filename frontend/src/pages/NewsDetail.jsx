import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios'; // ✅ ต้องติดตั้ง npm install axios
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CommentSection from '../components/CommentSection';
import { getNewsById, allNews } from '../data/newsData';
import { HiOutlineCalendar, HiOutlineEye } from "react-icons/hi";
import '../css/NewsDetail.css';

function NewsDetail() {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFromDB, setIsFromDB] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        // 1. พยายามดึงข้อมูลจาก Backend API ก่อน (เพื่อให้ได้ _id ของ MongoDB)
        // แก้ URL ให้ตรงกับ port ของ backend คุณ (ปกติคือ 5000)
        const response = await axios.get(`http://localhost:5000/api/news/${id}`);
        
        if (response.data) {
          setNews(response.data);
          setIsFromDB(true);
        }
      } catch (err) {
        console.warn("ไม่สามารถดึงข้อมูลจาก API ได้ กำลังใช้ข้อมูลจากไฟล์ Local...");
        
        // 2. ถ้า API พัง/หาไม่เจอ ให้ดึงจากไฟล์ newsData.js แทน (แบบเดิมที่คุณใช้)
        const localNews = getNewsById(id);
        setNews(localNews);
        setIsFromDB(false);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    window.scrollTo(0, 0); // เลื่อนขึ้นบนสุดเมื่อเปลี่ยนหน้า
  }, [id]);

  if (loading) return <div className="loading-state">กำลังโหลดเนื้อหา...</div>;

  if (!news) {
    return (
      <div className='news-detail-container'>
        <Navbar />
        <div className="news-not-found">
          <h2>ไม่พบข่าวที่คุณต้องการ</h2>
          <Link to="/" className="back-home-btn">กลับหน้าแรก</Link>
        </div>
        <Footer />
      </div>
    );
  }

  // ข่าวที่เกี่ยวข้อง (กรองจากไฟล์ local)
  const relatedNews = allNews
    .filter(item => item.category === news.category && (item._id !== news._id && item.id !== news.id))
    .slice(0, 3);

  return (
    <div className='news-detail-container'>
      <Navbar />
      
      <div className="news-detail-content">
        <div className="news-detail-wrapper">
          {/* Breadcrumb */}
          <div className="breadcrumb">
            <Link to="/">หน้าแรก</Link>
            <span> / </span>
            <span>{news.category}</span>
            <span> / </span>
            <span>{isFromDB ? 'Database' : 'Local File'}</span>
          </div>

          <div className="news-category-badge">{news.category}</div>
          <h1 className="news-detail-title">{news.title}</h1>

          <div className="news-meta">
            <span className="meta-item">
              <HiOutlineCalendar className="meta-icon" /> {news.date || news.createdAt?.substring(0,10)}
            </span>
            <span className="meta-item">
              <HiOutlineEye className="meta-icon" /> {news.views || 0} ครั้ง
            </span>
          </div>

          <div className="news-detail-image-container">
            <img src={news.image || news.thumbnail} alt={news.title} className="news-detail-image" />
          </div>

          <div 
            className="news-detail-body"
            dangerouslySetInnerHTML={{ __html: news.content }}
          />

          <div className="news-tags">
            <span className="tag">#{news.category}</span>
          </div>

          {/* 🚩 จุดสำคัญที่สุด: ส่วนคอมเมนต์ */}
          {/* หากข้อมูลมาจาก DB จะส่ง news._id ไป แต่ถ้ามาจากไฟล์ local จะส่ง id ไป */}
          <div className="comment-divider">
             <hr />
             <CommentSection newsId={news._id || id} />
          </div>

          {/* ข่าวที่เกี่ยวข้อง */}
          {relatedNews.length > 0 && (
            <div className="related-news-section">
              <h3 className="related-news-title">ข่าวที่เกี่ยวข้อง</h3>
              <div className="related-news-grid">
                {relatedNews.map((item) => (
                  <Link 
                    to={`/news/${item._id || item.id}`} 
                    key={item._id || item.id} 
                    className="related-news-card"
                  >
                    <img src={item.image || item.thumbnail} alt={item.title} />
                    <div className="related-news-info">
                      <span className="related-category">{item.category}</span>
                      <h4>{item.title}</h4>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default NewsDetail;