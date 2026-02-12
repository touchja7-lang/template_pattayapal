import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api'; // ✅ เปลี่ยนมาใช้ไฟล์ api กลาง
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
        // ✅ เรียกผ่าน api instance (จะไป Render อัตโนมัติเมื่ออยู่บน Vercel)
        const response = await api.get(`/news/${id}`);
        
        if (response.data) {
          setNews(response.data);
          setIsFromDB(true);
        }
      } catch (err) {
        console.warn("API Error: Falling back to local data...");
        const localNews = getNewsById(id);
        setNews(localNews);
        setIsFromDB(false);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    window.scrollTo(0, 0);
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

  // รองรับ category ทั้งแบบ String และ Object
  const categoryName = typeof news.category === 'object' ? 'ข่าวทั่วไป' : news.category;

  return (
    <div className='news-detail-container'>
      <Navbar />
      <div className="news-detail-content">
        <div className="news-detail-wrapper">
          <div className="breadcrumb">
            <Link to="/">หน้าแรก</Link>
            <span> / </span>
            <span>{categoryName}</span>
          </div>

          <div className="news-category-badge">{categoryName}</div>
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

          <div className="comment-divider">
             <hr />
             {/* ใช้ news._id จาก DB ถ้าไม่มีให้ใช้ id จาก params */}
             <CommentSection newsId={news._id || id} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default NewsDetail;