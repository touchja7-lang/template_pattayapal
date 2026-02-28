import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import api from '../services/api.js';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { HiOutlineCalendar, HiOutlineEye } from 'react-icons/hi';
import { IoArrowBack, IoChevronForward,
         IoPlayCircle, IoPauseCircle, IoStopCircle,
         IoVolumeHigh, IoWarningOutline } from 'react-icons/io5';
import { elevenLabsSpeak, THAI_VOICE_ID } from '../services/elevenLabsTTS.js';
import '../css/NewsDetail.css';

/* ── strip HTML tags ── */
const stripHtml = (html) => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return (tmp.textContent || tmp.innerText || '').replace(/\s+/g, ' ').trim();
};

/* ── แบ่งข้อความเป็น chunks ~500 chars ตัดที่ประโยค ──
   ElevenLabs รองรับสูงสุด 5000 chars/request
   เราใช้ 500 เพื่อให้ preload chunk ถัดไปได้ทัน ไม่มีช่องว่าง ── */
const splitChunks = (text, maxLen = 500) => {
  const chunks = [];
  // ตัดที่ ., !, ?, ฯ, \n  แล้ว trim
  const sentences = text.match(/[^.!?\nฯ]+[.!?\nฯ]*/g) || [text];
  let buf = '';
  for (const s of sentences) {
    if (buf.length + s.length > maxLen && buf.length > 0) {
      chunks.push(buf.trim());
      buf = s;
    } else {
      buf += s;
    }
  }
  if (buf.trim()) chunks.push(buf.trim());
  return chunks.filter(Boolean);
};

/* ── TTS states ── */
const S = {
  IDLE:    'idle',
  LOADING: 'loading',
  PLAYING: 'playing',
  PAUSED:  'paused',
  ERROR:   'error',
};

function NewsDetail() {
  const { id } = useParams();

  /* ── news ── */
  const [news, setNews]                     = useState(null);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  /* ── TTS ── */
  const [ttsState, setTtsState]             = useState(S.IDLE);
  const [ttsError, setTtsError]             = useState('');
  const [ttsSpeed, setTtsSpeed]             = useState(1.0);
  const [ttsDuration, setTtsDuration]       = useState(0);   // total estimated duration
  const [ttsCurrentTime, setTtsCurrentTime] = useState(0);

  // chunk queue
  const chunksRef     = useRef([]);     // array ของ text chunks
  const chunkIdxRef   = useRef(0);      // chunk ที่กำลังเล่น
  const stoppedRef    = useRef(false);  // flag หยุดจริง
  const pausedRef     = useRef(false);  // flag pause

  // audio
  const audioRef      = useRef(null);   // Audio ที่กำลังเล่น
  const nextAudioRef  = useRef(null);   // Audio ที่ preload ไว้แล้ว
  const blobUrlsRef   = useRef([]);     // เก็บ URLs ทั้งหมดเพื่อ revoke
  const intervalRef   = useRef(null);   // progress tracker

  /* ── fetch news ── */
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(false);
        const res = await api.get(`/news/${id}`);
        if (res.data) setNews(res.data);
        else throw new Error('No data');
      } catch (err) {
        console.error('NewsDetail:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
    window.scrollTo(0, 0);
    return () => stopAudio();
  }, [id]);

  /* ── scroll progress ── */
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const top    = el.scrollTop || document.body.scrollTop;
      const height = el.scrollHeight - el.clientHeight;
      setScrollProgress(height > 0 ? (top / height) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ════════════════════════════════════════════════
     TTS — ElevenLabs chunk queue with preload
     ─────────────────────────────────────────────
     วิธีทำงาน:
       1. แบ่งข้อความเป็น chunks ~500 chars
       2. โหลด chunk[0] จาก ElevenLabs → เล่นทันที
       3. ระหว่างเล่น chunk[i] → preload chunk[i+1] ไว้พร้อม
       4. เมื่อ chunk[i] จบ → สลับไปเล่น chunk[i+1] ทันที (ไม่มี gap)
       5. ทำซ้ำจนหมด
  ════════════════════════════════════════════════ */

  /* revoke blob URLs ทั้งหมดที่สร้างไว้ */
  const revokeAllBlobs = useCallback(() => {
    blobUrlsRef.current.forEach(u => URL.revokeObjectURL(u));
    blobUrlsRef.current = [];
  }, []);

  /* หยุดทั้งหมด + reset state */
  const stopAudio = useCallback(() => {
    stoppedRef.current = true;
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (audioRef.current)    { audioRef.current.onended = null; audioRef.current.onerror = null;
                                audioRef.current.pause(); audioRef.current = null; }
    if (nextAudioRef.current){ nextAudioRef.current.src = ''; nextAudioRef.current = null; }
    revokeAllBlobs();
    chunksRef.current   = [];
    chunkIdxRef.current = 0;
    setTtsState(S.IDLE);
    setTtsCurrentTime(0);
    setTtsDuration(0);
  }, [revokeAllBlobs]);

  /* โหลด chunk index ที่กำหนดจาก ElevenLabs → return Audio object */
  const loadChunk = useCallback(async (idx, speed) => {
    const chunk = chunksRef.current[idx];
    if (!chunk) return null;
    const { audioUrl } = await elevenLabsSpeak({
      text:       chunk,
      voiceId:    THAI_VOICE_ID,
      stability:  0.5,
      similarity: 0.75,
      speed:      1.0,   // speed ควบคุมด้วย playbackRate แทน ให้คุณภาพดีกว่า
    });
    blobUrlsRef.current.push(audioUrl);
    const audio = new Audio(audioUrl);
    audio.playbackRate = speed;
    return audio;
  }, []);

  /* เล่น chunk ที่ idx — เมื่อจบจะเล่น chunk ถัดไปอัตโนมัติ */
  const playChunk = useCallback((audio, idx, speed) => {
    if (!audio || stoppedRef.current) return;
    audioRef.current = audio;

    /* preload chunk ถัดไปทันที (ทำงานในพื้นหลังขณะกำลังเล่น) */
    const nextIdx = idx + 1;
    if (nextIdx < chunksRef.current.length && !nextAudioRef.current) {
      loadChunk(nextIdx, speed).then(nextAudio => {
        if (!stoppedRef.current) nextAudioRef.current = nextAudio;
      }).catch(() => {});
    }

    audio.playbackRate = speed;

    audio.onplay = () => {
      if (idx === 0) {
        /* เริ่มนับ progress tracker ตอน chunk แรกเริ่มเล่น */
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
          setTtsCurrentTime(prev => prev + 0.4);
        }, 400);
        setTtsState(S.PLAYING);
      }
    };

    audio.onended = () => {
      if (stoppedRef.current) return;
      if (pausedRef.current)  return;

      chunkIdxRef.current = nextIdx;

      if (nextIdx >= chunksRef.current.length) {
        /* จบทั้งหมด */
        clearInterval(intervalRef.current);
        revokeAllBlobs();
        setTtsState(S.IDLE);
        setTtsCurrentTime(0);
        return;
      }

      /* ถ้า preload เสร็จแล้ว → เล่นต่อได้เลย ไม่มี gap */
      if (nextAudioRef.current) {
        const next = nextAudioRef.current;
        nextAudioRef.current = null;
        playChunk(next, nextIdx, speed);
      } else {
        /* preload ยังไม่เสร็จ → รอโหลด (ไม่ควรเกิดบ่อย) */
        loadChunk(nextIdx, speed).then(next => {
          if (!stoppedRef.current && next) playChunk(next, nextIdx, speed);
        }).catch(() => { setTtsState(S.ERROR); setTtsError('โหลดเสียงไม่สำเร็จ'); });
      }
    };

    audio.onerror = () => {
      if (stoppedRef.current) return;
      clearInterval(intervalRef.current);
      setTtsState(S.ERROR);
      setTtsError('ไม่สามารถเล่นเสียงได้');
    };

    audio.play().catch(() => {
      if (!stoppedRef.current) { setTtsState(S.ERROR); setTtsError('ไม่สามารถเล่นเสียงได้'); }
    });
  }, [loadChunk, revokeAllBlobs]);

  /* ── เริ่มเล่น ── */
  const handlePlay = useCallback(async () => {
    if (!news) return;
    stopAudio();
    stoppedRef.current  = false;
    pausedRef.current   = false;
    chunkIdxRef.current = 0;
    setTtsError('');
    setTtsState(S.LOADING);

    const fullText = `${news.title}. ${stripHtml(news.content || '')}`;
    chunksRef.current = splitChunks(fullText, 500);

    /* ประมาณ duration รวม (Thai: ~3 chars/วินาที) */
    const estSec = Math.ceil(fullText.length / (3 * (ttsSpeed || 1)));
    setTtsDuration(estSec);

    try {
      const firstAudio = await loadChunk(0, ttsSpeed);
      if (!stoppedRef.current && firstAudio) playChunk(firstAudio, 0, ttsSpeed);
      else if (!stoppedRef.current) { setTtsState(S.ERROR); setTtsError('โหลดเสียงไม่สำเร็จ'); }
    } catch (err) {
      if (!stoppedRef.current) {
        setTtsState(S.ERROR);
        setTtsError(err.message || 'โหลดเสียงไม่สำเร็จ');
      }
    }
  }, [news, ttsSpeed, stopAudio, loadChunk, playChunk]);

  /* ── หยุดชั่วคราว ── */
  const handlePause = useCallback(() => {
    if (audioRef.current) {
      pausedRef.current = true;
      audioRef.current.pause();
      clearInterval(intervalRef.current);
      setTtsState(S.PAUSED);
    }
  }, []);

  /* ── เล่นต่อ ── */
  const handleResume = useCallback(() => {
    if (audioRef.current) {
      pausedRef.current = false;
      audioRef.current.play();
      intervalRef.current = setInterval(() => {
        setTtsCurrentTime(prev => prev + 0.4);
      }, 400);
      setTtsState(S.PLAYING);
    }
  }, []);

  /* ── หยุดเลย ── */
  const handleStop = useCallback(() => stopAudio(), [stopAudio]);

  /* ── เปลี่ยนความเร็ว (ขณะเล่น → ปรับ playbackRate ได้เลย) ── */
  const handleSpeedChange = useCallback((speed) => {
    setTtsSpeed(speed);
    if (audioRef.current)    audioRef.current.playbackRate    = speed;
    if (nextAudioRef.current) nextAudioRef.current.playbackRate = speed;
  }, []);

  /* ── helpers ── */
  const fmtTime = (s) => {
    if (!s || isNaN(s)) return '0:00';
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  };
  const progressPct = ttsDuration > 0 ? (ttsCurrentTime / ttsDuration) * 100 : 0;

  const isLoading = ttsState === S.LOADING;
  const isPlaying = ttsState === S.PLAYING;
  const isPaused  = ttsState === S.PAUSED;
  const isActive  = isPlaying || isPaused;
  const isError   = ttsState === S.ERROR;

  /* ════════════════════════════
     LOADING / ERROR SCREENS
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

        {/* ══ HERO ══ */}
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

        {/* ══ ARTICLE CARD ══ */}
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

            {/* ══════════════════════════════
                TTS PLAYER — ElevenLabs
            ══════════════════════════════ */}
            <div className={`nd-tts-bar
              ${isActive  ? 'nd-tts-active'      : ''}
              ${isLoading ? 'nd-tts-loading-state' : ''}
              ${isError   ? 'nd-tts-error-state'  : ''}
            `}>

              {/* Left */}
              <div className="nd-tts-left">
                <div className={`nd-tts-icon-wrap ${isPlaying ? 'nd-tts-icon-pulse' : ''}`}>
                  <IoVolumeHigh className="nd-tts-icon" />
                </div>
                <div>
                  <p className="nd-tts-label">ฟังข่าวนี้</p>
                  <p className="nd-tts-sublabel">
                    {isLoading ? 'กำลังสังเคราะห์เสียง...'
                      : isPlaying ? 'กำลังอ่าน...'
                      : isPaused  ? 'หยุดชั่วคราว'
                      : isError   ? 'เกิดข้อผิดพลาด'
                      : 'ขับเคลื่อนโดย ElevenLabs AI'}
                  </p>
                </div>
              </div>

              {/* Center */}
              <div className="nd-tts-center">
                <div className="nd-tts-controls">
                  {/* loading spinner */}
                  {isLoading && <div className="nd-tts-spinner" />}

                  {/* play */}
                  {!isLoading && !isActive && (
                    <button className="nd-tts-btn play" onClick={handlePlay} title="เล่น">
                      <IoPlayCircle />
                    </button>
                  )}
                  {/* pause */}
                  {isPlaying && (
                    <button className="nd-tts-btn pause" onClick={handlePause} title="หยุดชั่วคราว">
                      <IoPauseCircle />
                    </button>
                  )}
                  {/* resume */}
                  {isPaused && (
                    <button className="nd-tts-btn play" onClick={handleResume} title="เล่นต่อ">
                      <IoPlayCircle />
                    </button>
                  )}
                  {/* stop */}
                  {isActive && (
                    <button className="nd-tts-btn stop" onClick={handleStop} title="หยุด">
                      <IoStopCircle />
                    </button>
                  )}
                  {/* retry */}
                  {isError && (
                    <button className="nd-tts-btn play" onClick={handlePlay} title="ลองใหม่">
                      <IoPlayCircle />
                    </button>
                  )}
                </div>

                {/* progress bar + time */}
                {isActive && ttsDuration > 0 && (
                  <div className="nd-tts-progress-wrap">
                    <div className="nd-tts-progress-track">
                      <div className="nd-tts-progress-fill" style={{ width: `${progressPct}%` }} />
                    </div>
                    <div className="nd-tts-time">
                      <span>{fmtTime(ttsCurrentTime)}</span>
                      <span>{fmtTime(ttsDuration)}</span>
                    </div>
                  </div>
                )}

                {/* waveform */}
                {isPlaying && (
                  <div className="nd-tts-wave">
                    <span /><span /><span /><span /><span />
                  </div>
                )}
              </div>

              {/* Right: speed */}
              <div className="nd-tts-right">
                <span className="nd-tts-speed-label">ความเร็ว</span>
                <div className="nd-tts-speeds">
                  {[0.75, 1, 1.25, 1.5].map(r => (
                    <button
                      key={r}
                      className={`nd-tts-speed ${ttsSpeed === r ? 'active' : ''}`}
                      onClick={() => handleSpeedChange(r)}
                    >
                      {r}×
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* error message */}
            {isError && ttsError && (
              <div className="nd-tts-error-msg">
                <IoWarningOutline /> {ttsError}
              </div>
            )}

            {/* Article */}
            <article className="nd-body" dangerouslySetInnerHTML={{ __html: safeContent }} />

            {/* Footer */}
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