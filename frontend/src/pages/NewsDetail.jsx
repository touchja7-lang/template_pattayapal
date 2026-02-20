import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import api from '../services/api.js';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getNewsById } from '../data/newsData';
import { HiOutlineCalendar, HiOutlineEye } from "react-icons/hi";
import { IoArrowBack } from "react-icons/io5";
import '../css/NewsDetail.css';

function NewsDetail() {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(false);

        const response = await api.get(`/news/${id}`);
        if (response.data) {
          setNews(response.data);
        } else {
          throw new Error('No data returned');
        }
      } catch (err) {
        console.warn("ไม่พบใน DB กำลังดึงจากไฟล์ Local...", err);
        const localNews = getNewsById(id);
        if (localNews) {
          setNews(localNews);
        } else {
          setError(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    window.scrollTo(0, 0);
  }, [id]);

  // Loading — คง Navbar/Footer ไว้เพื่อไม่ให้หน้ากระตุก
  if (loading) return (
    <div className="news-detail-container">
      <Navbar />
      <div className="loading-state">
        <div className="spinner"></div>
        <p>กำลังโหลดข่าวสาร...</p>
      </div>
      <Footer />
    </div>
  );

  // Error / ไม่พบข่าว
  if (error || !news) return (
    <div className="news-detail-container">
      <Navbar />
      <div className="news-not-found">
        <h2>ไม่พบข่าวที่คุณต้องการ</h2>
        <Link to="/news" className="back-home-btn">กลับหน้าข่าวสาร</Link>
      </div>
      <Footer />
    </div>
  );

  const categoryLabel = news.category?.name || news.category || 'ข่าวสาร';

  // Sanitize HTML content เพื่อป้องกัน XSS
  const safeContent = DOMPurify.sanitize(news.content || '');

  return (
    <div className="news-detail-container">
      <Navbar />

      <div className="news-detail-content">
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

          <div className="news-detail-image-container">
            <img
              src={news.image || news.thumbnail}
              alt={news.title}
              className="news-detail-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/placeholder.png';
              }}
            />
          </div>

          <div
            className="news-detail-body"
            dangerouslySetInnerHTML={{ __html: safeContent }}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default NewsDetail;