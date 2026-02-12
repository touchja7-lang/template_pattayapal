import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api.js'; // ✅ แก้ไข Path ให้ตรงกับที่เก็บไฟล์ api.js ของคุณ
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getNewsById } from '../data/newsData';
import { HiOutlineCalendar, HiOutlineEye } from "react-icons/hi";
import '../css/NewsDetail.css';

function NewsDetail() {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        // ✅ ใช้ api.get แทนการพิมพ์ URL localhost ตรงๆ
        const response = await api.get(`/news/${id}`);
        
        if (response.data) {
          setNews(response.data);
        }
      } catch (err) {
        console.warn("ไม่พบใน DB กำลังดึงจากไฟล์ Local...");
        const localNews = getNewsById(id);
        setNews(localNews);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return <div className="loading-state">กำลังโหลด...</div>;

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

  // ป้องกันการ Error กรณี category เป็น Object (จาก MongoDB)
  const categoryLabel = typeof news.category === 'object' ? 'ข่าวสาร' : news.category;

  return (
    <div className='news-detail-container'>
      <Navbar />
      <div className="news-detail-content">
        <div className="news-detail-wrapper">
          <div className="breadcrumb">
            <Link to="/">หน้าแรก</Link> / <span>{categoryLabel}</span>
          </div>
          <h1 className="news-detail-title">{news.title}</h1>
          <div className="news-meta">
            <span><HiOutlineCalendar /> {news.date || news.createdAt?.substring(0,10)}</span>
            <span><HiOutlineEye /> {news.views || 0} วิว</span>
          </div>
          <div className="news-detail-image-container">
            <img src={news.image || news.thumbnail} alt={news.title} />
          </div>
          <div 
            className="news-detail-body"
            dangerouslySetInnerHTML={{ __html: news.content }}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default NewsDetail;