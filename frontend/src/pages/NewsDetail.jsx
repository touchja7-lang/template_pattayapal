import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import api from '../services/api.js';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { HiOutlineCalendar, HiOutlineEye } from "react-icons/hi";
import { IoArrowBack } from "react-icons/io5";
import '../css/NewsDetail.css';

function NewsDetail() {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

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
        console.error("ไม่พบข่าวใน DB:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      const el = document.documentElement;
      const scrollTop = el.scrollTop || document.body.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) return (
    <div className="nd-root">
      <Navbar />
      <div className="nd-loading">
        <div className="nd-loading-bars">
          <span /><span /><span /><span />
        </div>
        <p>กำลังโหลดข่าวสาร...</p>
      </div>
      <Footer />
    </div>
  );

  if (error || !news) return (
    <div className="nd-root">
      <Navbar />
      <div className="nd-notfound">
        <div className="nd-notfound-code">404</div>
        <h2>ไม่พบข่าวที่คุณต้องการ</h2>
        <Link to="/news" className="nd-back-home">กลับหน้าข่าวสาร</Link>
      </div>
      <Footer />
    </div>
  );

  const categoryLabel = news.category?.name || news.category || 'ข่าวสาร';
  const safeContent = DOMPurify.sanitize(news.content || '');
  const formattedDate = news.createdAt
    ? new Date(news.createdAt).toLocaleDateString('th-TH', {
        year: 'numeric', month: 'long', day: 'numeric'
      })
    : (news.date || 'ไม่ระบุวันที่');

  return (
    <div className="nd-root">
      {/* Reading progress bar */}
      <div className="nd-progress-bar" style={{ width: `${scrollProgress}%` }} />

      <Navbar />

      <main className="nd-main">

        {/* Hero Section */}
        <div className="nd-hero">
          <div className="nd-hero-image-wrap">
            <img
              src={news.image || news.thumbnail}
              alt={news.title}
              className="nd-hero-image"
              onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder.png'; }}
            />
            <div className="nd-hero-overlay" />
          </div>

          <div className="nd-hero-content">
            <Link to="/news" className="nd-back-btn">
              <IoArrowBack /> ย้อนกลับ
            </Link>

            <div className="nd-category-badge">{categoryLabel}</div>
            <h1 className="nd-title">{news.title}</h1>

            <div className="nd-meta">
              <span className="nd-meta-item">
                <HiOutlineCalendar /> {formattedDate}
              </span>
              <span className="nd-meta-divider">·</span>
              <span className="nd-meta-item">
                <HiOutlineEye /> {(news.views || 0).toLocaleString()} วิว
              </span>
            </div>
          </div>
        </div>

        {/* Article Body */}
        <div className="nd-article-wrap">
          <div className="nd-breadcrumb">
            <Link to="/">หน้าแรก</Link>
            <span>/</span>
            <Link to="/news">ข่าวสาร</Link>
            <span>/</span>
            <span className="nd-breadcrumb-current">{categoryLabel}</span>
          </div>

          <article
            className="nd-body"
            dangerouslySetInnerHTML={{ __html: safeContent }}
          />

          <div className="nd-footer-nav">
            <Link to="/news" className="nd-back-btn-bottom">
              <IoArrowBack /> กลับหน้าข่าวสารทั้งหมด
            </Link>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}

export default NewsDetail;