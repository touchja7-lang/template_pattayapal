import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import api from '../services/api.js';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { HiOutlineCalendar, HiOutlineEye } from "react-icons/hi";
import { IoArrowBack, IoChevronForward,
         IoPlayCircle, IoPauseCircle, IoStopCircle,
         IoVolumeHigh } from "react-icons/io5";
import '../css/NewsDetail.css';

/* ── ดึง text ล้วนออกจาก HTML string ── */
const stripHtml = (html) => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

function NewsDetail() {
  const { id } = useParams();
  const [news, setNews]                     = useState(null);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  /* ── TTS state ── */
  const [ttsPlaying, setTtsPlaying]   = useState(false);
  const [ttsPaused, setTtsPaused]     = useState(false);
  const [ttsSupport, setTtsSupport]   = useState(false);
  const [ttsRate, setTtsRate]         = useState(1);
  const uttRef = useRef(null);

  /* ── check browser support ── */
  useEffect(() => {
    setTtsSupport('speechSynthesis' in window);
    return () => window.speechSynthesis.cancel();   // cleanup on unmount
  }, []);

  /* ── fetch news ── */
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
    // stop TTS when navigating to another article
    return () => {
      window.speechSynthesis.cancel();
      setTtsPlaying(false);
      setTtsPaused(false);
    };
  }, [id]);

  /* ── scroll progress ── */
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

  /* ════════════════════════════
     TTS CONTROLS
  ════════════════════════════ */
  const ttsPlay = useCallback(() => {
    if (!news) return;
    window.speechSynthesis.cancel();

    const text = `${news.title}. ${stripHtml(news.content || '')}`;
    const utt  = new SpeechSynthesisUtterance(text);

    // เลือก voice ภาษาไทยถ้ามี
    const voices = window.speechSynthesis.getVoices();
    const thVoice = voices.find(v => v.lang === 'th-TH') ||
                    voices.find(v => v.lang.startsWith('th'));
    if (thVoice) utt.voice = thVoice;

    utt.lang  = 'th-TH';
    utt.rate  = ttsRate;
    utt.pitch = 1;

    utt.onstart  = () => { setTtsPlaying(true);  setTtsPaused(false); };
    utt.onpause  = () => { setTtsPaused(true); };
    utt.onresume = () => { setTtsPaused(false); };
    utt.onend    = () => { setTtsPlaying(false); setTtsPaused(false); };
    utt.onerror  = () => { setTtsPlaying(false); setTtsPaused(false); };

    uttRef.current = utt;
    window.speechSynthesis.speak(utt);
  }, [news, ttsRate]);

  const ttsPause = () => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setTtsPaused(true);
    }
  };

  const ttsResume = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setTtsPaused(false);
    }
  };

  const ttsStop = () => {
    window.speechSynthesis.cancel();
    setTtsPlaying(false);
    setTtsPaused(false);
  };

  const handleRateChange = (newRate) => {
    setTtsRate(newRate);
    if (ttsPlaying) {
      ttsStop();
      setTimeout(() => ttsPlay(), 100);
    }
  };

  /* ════════════════════════════
     RENDER STATES
  ════════════════════════════ */
  if (loading) return (
    <div className="nd-root">
      <Navbar />
      <div className="nd-loading">
        <div className="nd-loading-bars"><span /><span /><span /><span /></div>
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
        <Link to="/news" className="nd-back-home"><IoArrowBack /> กลับหน้าข่าวสาร</Link>
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
      <div className="nd-progress-bar" style={{ width: `${scrollProgress}%` }} />
      <Navbar />

      <main className="nd-main">

        {/* ── HERO ── */}
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
          <Link to="/news" className="nd-hero-back"><IoArrowBack /> ย้อนกลับ</Link>
          <div className="nd-hero-body">
            <span className="nd-cat-pill">{categoryLabel}</span>
            <h1 className="nd-title">{news.title}</h1>
            <div className="nd-meta">
              <span className="nd-meta-item"><HiOutlineCalendar /> {formattedDate}</span>
              <span className="nd-meta-dot" />
              <span className="nd-meta-item"><HiOutlineEye /> {(news.views || 0).toLocaleString()} วิว</span>
            </div>
          </div>
        </div>

        {/* ── ARTICLE CARD ── */}
        <div className="nd-card-wrap">
          <div className="nd-card">

            {/* Breadcrumb */}
            <div className="nd-breadcrumb">
              <Link to="/">หน้าแรก</Link>
              <IoChevronForward className="nd-bc-arrow" />
              <Link to="/news">ข่าวสาร</Link>
              <IoChevronForward className="nd-bc-arrow" />
              <span className="nd-bc-current">{categoryLabel}</span>
            </div>

            <div className="nd-card-divider" />

            {/* ════════════════════════════
                TTS PLAYER BAR
            ════════════════════════════ */}
            {ttsSupport && (
              <div className={`nd-tts-bar ${ttsPlaying ? 'nd-tts-active' : ''}`}>
                <div className="nd-tts-left">
                  <IoVolumeHigh className="nd-tts-icon" />
                  <div>
                    <p className="nd-tts-label">ฟังข่าวนี้</p>
                    <p className="nd-tts-sublabel">
                      {ttsPlaying
                        ? ttsPaused ? 'หยุดชั่วคราว...' : 'กำลังอ่าน...'
                        : 'อ่านออกเสียงโดย AI'}
                    </p>
                  </div>
                </div>

                <div className="nd-tts-center">
                  {/* Play / Pause / Resume */}
                  {!ttsPlaying ? (
                    <button className="nd-tts-btn play" onClick={ttsPlay} title="เล่น">
                      <IoPlayCircle />
                    </button>
                  ) : ttsPaused ? (
                    <button className="nd-tts-btn play" onClick={ttsResume} title="เล่นต่อ">
                      <IoPlayCircle />
                    </button>
                  ) : (
                    <button className="nd-tts-btn pause" onClick={ttsPause} title="หยุดชั่วคราว">
                      <IoPauseCircle />
                    </button>
                  )}
                  {/* Stop */}
                  {ttsPlaying && (
                    <button className="nd-tts-btn stop" onClick={ttsStop} title="หยุด">
                      <IoStopCircle />
                    </button>
                  )}

                  {/* waveform animation while playing */}
                  {ttsPlaying && !ttsPaused && (
                    <div className="nd-tts-wave">
                      <span /><span /><span /><span /><span />
                    </div>
                  )}
                </div>

                {/* Speed selector */}
                <div className="nd-tts-right">
                  <span className="nd-tts-speed-label">ความเร็ว</span>
                  <div className="nd-tts-speeds">
                    {[0.75, 1, 1.25, 1.5].map(r => (
                      <button
                        key={r}
                        className={`nd-tts-speed ${ttsRate === r ? 'active' : ''}`}
                        onClick={() => handleRateChange(r)}
                      >
                        {r}×
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Article body */}
            <article className="nd-body" dangerouslySetInnerHTML={{ __html: safeContent }} />

            {/* Footer nav */}
            <div className="nd-card-footer">
              <Link to="/news" className="nd-footer-btn">
                <IoArrowBack /><span>กลับหน้าข่าวสารทั้งหมด</span>
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