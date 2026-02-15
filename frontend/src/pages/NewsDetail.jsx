import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api.js'; 
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getNewsById } from '../data/newsData';
import { HiOutlineCalendar, HiOutlineEye } from "react-icons/hi";
import { IoArrowBack } from "react-icons/io5"; // เพิ่มไอคอนปุ่มย้อนกลับ
import '../css/NewsDetail.css';

function NewsDetail() {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
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

  if (loading) return (
    <div className="loading-state">
      <div className="spinner"></div> {/* เพิ่ม Spinner เพื่อความพรีเมียม */}
      <p>กำลังโหลดข่าวสาร...</p>
    </div>
  );

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

  // 🟢 ดึงชื่อหมวดหมู่: รองรับทั้ง Object จาก DB และ String จากไฟล์ Local
  const categoryLabel = news.category?.name || news.category || 'ข่าวสาร';

  return (
    <div className='news-detail-container'>
      <Navbar />
      
      <div className="news-detail-content">
        {/* 🟢 ปุ่มย้อนกลับแบบลอยตัว (Floating Back Button) */}
        <Link to="/news" className="back-btn">
          <IoArrowBack /> ย้อนกลับ
        </Link>

        <div className="news-detail-wrapper">
          <div className="breadcrumb">
            <Link to="/">หน้าแรก</Link> / <Link to="/news">ข่าวสาร</Link> / <span>{categoryLabel}</span>
          </div>

          <h1 className="news-detail-title">{news.title}</h1>

          <div className="news-meta">
            <div className="meta-item">
              <HiOutlineCalendar className="meta-icon" /> 
              {/* ฟอร์แมตวันที่ให้สวยงามแบบไทย */}
              {news.createdAt 
                ? new Date(news.createdAt).toLocaleDateString('th-TH', { 
                    year: 'numeric', month: 'long', day: 'numeric' 
                  }) 
                : (news.date || 'ไม่ระบุวันที่')}
            </div>
            <div className="meta-item">
              <HiOutlineEye className="meta-icon" /> {news.views || 0} วิว
            </div>
          </div>

          {/* 🟢 คอนเทนเนอร์รูปภาพที่ปรับปรุง CSS ให้เห็นเต็มรูปแล้ว */}
          <div className="news-detail-image-container">
            <img 
              src={news.image || news.thumbnail} 
              alt={news.title} 
              className="news-detail-image"
            />
          </div>

          {/* 🟢 เนื้อหาข่าว: รองรับ HTML จาก Database */}
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