import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import api from '../services/api.js';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { HiOutlineCalendar, HiOutlineEye } from "react-icons/hi";
import { IoArrowBack, IoChevronForward } from "react-icons/io5";
import '../css/NewsDetail.css';

function NewsDetail() {
  const { id } = useParams();
  const [news, setNews]                     = useState(null);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(false);
        const response = await api.get(`/news/${id}`);
        if (response.data) setNews(response.data);
        else throw new Error('No data returned');
      } catch (err) {
        console.error('ไม่พบข่าวใน DB:', err);
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
      const scrollTop    = el.scrollTop || document.body.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      setScrollProgress(scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* ── Loading ── */
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

  /* ── Error / Not found ── */
  if (error || !news) return (
    <div className="nd-root">
      <Navbar />
      <div className="nd-notfound">
        <div className="nd-notfound-code">404</div>
        <h2>ไม่พบข่าวที่คุณต้องการ</h2>
        <Link to="/news" className="nd-back-home">
          <IoArrowBack /> กลับหน้าข่าวสาร
        </Link>
      </div>
      <Footer />
    </div>
  );

  const categoryLabel = news.category?.name || news.category || 'ข่าวสาร';
  const safeContent   = DOMPurify.sanitize(news.content || '');
  const formattedDate = news.createdAt
    ? new Date(news.createdAt).toLocaleDateString('th-TH', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : (news.date || 'ไม่ระบุวันที่');

  return (
    <div className="nd-root">

      {/* ── Reading Progress ── */}
      <div className="nd-progress-bar" style={{ width: `${scrollProgress}%` }} />

      <Navbar />

      <main className="nd-main">

        {/* ════════════════════════════════
            HERO — full-width cinematic image
        ════════════════════════════════ */}
        <div className="nd-hero">
          <div className="nd-hero-img-wrap">
            <img
              src={news.image || news.thumbnail}
              alt={news.title}
              className="nd-hero-img"
              onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder.png'; }}
            />
            <div className="nd-hero-vignette" />
          </div>

          {/* Floating back pill on top-left */}
          <Link to="/news" className="nd-hero-back">
            <IoArrowBack /> ย้อนกลับ
          </Link>

          {/* Title block at the bottom of hero */}
          <div className="nd-hero-body">
            <span className="nd-cat-pill">{categoryLabel}</span>
            <h1 className="nd-title">{news.title}</h1>
            <div className="nd-meta">
              <span className="nd-meta-item">
                <HiOutlineCalendar /> {formattedDate}
              </span>
              <span className="nd-meta-dot" />
              <span className="nd-meta-item">
                <HiOutlineEye /> {(news.views || 0).toLocaleString()} วิว
              </span>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════
            ARTICLE CARD
        ════════════════════════════════ */}
        <div className="nd-card-wrap">
          <div className="nd-card">

            {/* Breadcrumb inside card */}
            <div className="nd-breadcrumb">
              <Link to="/">หน้าแรก</Link>
              <IoChevronForward className="nd-bc-arrow" />
              <Link to="/news">ข่าวสาร</Link>
              <IoChevronForward className="nd-bc-arrow" />
              <span className="nd-bc-current">{categoryLabel}</span>
            </div>

            {/* Divider */}
            <div className="nd-card-divider" />

            {/* Article body */}
            <article
              className="nd-body"
              dangerouslySetInnerHTML={{ __html: safeContent }}
            />

            {/* Footer nav */}
            <div className="nd-card-footer">
              <Link to="/news" className="nd-footer-btn">
                <IoArrowBack />
                <span>กลับหน้าข่าวสารทั้งหมด</span>
              </Link>
              <div className="nd-footer-views">
                <HiOutlineEye />
                <span>{(news.views || 0).toLocaleString()} การเข้าชม</span>
              </div>
            </div>

          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}

export default NewsDetail;