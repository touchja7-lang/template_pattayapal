import React, { useState, useEffect, useCallback, useRef } from 'react';
import { IoClose, IoChevronBack, IoChevronForward, IoExpand, IoImagesOutline } from 'react-icons/io5';
import '../css/PhotoAlbum.css';

/**
 * PhotoAlbum — drop-in component for NewsDetail
 *
 * Props:
 *   images  : string[]   — array of image URLs
 *   title   : string     — article title (used as alt text base)
 */
function PhotoAlbum({ images = [], title = '' }) {
  const [lightboxOpen, setLightboxOpen]   = useState(false);
  const [activeIndex, setActiveIndex]     = useState(0);
  const [imgLoaded, setImgLoaded]         = useState({});
  const [zoomed, setZoomed]               = useState(false);
  const touchStartX                       = useRef(null);

  /* ── guard ── */
  if (!images || images.length === 0) return null;

  /* ── keyboard nav ── */
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'Escape')     close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen, activeIndex]);

  /* ── lock body scroll when lightbox open ── */
  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [lightboxOpen]);

  const open  = (i) => { setActiveIndex(i); setLightboxOpen(true); setZoomed(false); };
  const close = ()  => { setLightboxOpen(false); setZoomed(false); };
  const next  = useCallback(() => setActiveIndex(i => (i + 1) % images.length), [images.length]);
  const prev  = useCallback(() => setActiveIndex(i => (i - 1 + images.length) % images.length), [images.length]);

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    touchStartX.current = null;
  };

  const handleImgLoad = (i) => setImgLoaded(p => ({ ...p, [i]: true }));

  /* ── grid layout: vary span by position ── */
  const getSpan = (i, total) => {
    if (total === 1) return 'pa-span-full';
    if (total === 2) return 'pa-span-half';
    if (total === 3) return i === 0 ? 'pa-span-two' : 'pa-span-one';
    if (total === 4) return 'pa-span-half';
    /* 5+ : first big, rest normal */
    if (i === 0) return 'pa-span-two';
    return 'pa-span-one';
  };

  const visible   = images.slice(0, 5);
  const extraCount = images.length > 5 ? images.length - 5 : 0;

  return (
    <div className="pa-root">
      {/* ── header ── */}
      <div className="pa-header">
        <IoImagesOutline className="pa-header-icon" />
        <span>อัลบั้มภาพ</span>
        <span className="pa-count-badge">{images.length} ภาพ</span>
      </div>

      {/* ── grid ── */}
      <div className={`pa-grid pa-grid-${Math.min(images.length, 5)}`}>
        {visible.map((src, i) => (
          <div
            key={i}
            className={`pa-cell ${getSpan(i, images.length)}`}
            onClick={() => open(i)}
          >
            {/* skeleton */}
            {!imgLoaded[i] && <div className="pa-skeleton" />}

            <img
              src={src}
              alt={`${title} — ภาพที่ ${i + 1}`}
              className={`pa-img ${imgLoaded[i] ? 'pa-img-loaded' : ''}`}
              onLoad={() => handleImgLoad(i)}
              onError={(e) => { e.target.src = '/images/placeholder.png'; handleImgLoad(i); }}
            />

            <div className="pa-cell-hover">
              <IoExpand className="pa-expand-icon" />
            </div>

            {/* "+N more" overlay on last visible cell */}
            {extraCount > 0 && i === 4 && (
              <div className="pa-more-overlay">
                <span>+{extraCount}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Lightbox ── */}
      {lightboxOpen && (
        <div
          className="pa-lb-backdrop"
          onClick={close}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="pa-lb-inner" onClick={(e) => e.stopPropagation()}>

            {/* close */}
            <button className="pa-lb-close" onClick={close}><IoClose /></button>

            {/* counter */}
            <div className="pa-lb-counter">
              {activeIndex + 1} / {images.length}
            </div>

            {/* main image */}
            <div
              className={`pa-lb-img-wrap ${zoomed ? 'pa-lb-zoomed' : ''}`}
              onClick={() => setZoomed(z => !z)}
            >
              <img
                key={activeIndex}
                src={images[activeIndex]}
                alt={`${title} — ภาพที่ ${activeIndex + 1}`}
                className="pa-lb-img"
                onError={(e) => { e.target.src = '/images/placeholder.png'; }}
              />
            </div>

            {/* nav arrows */}
            {images.length > 1 && (
              <>
                <button className="pa-lb-nav pa-lb-prev" onClick={prev}><IoChevronBack /></button>
                <button className="pa-lb-nav pa-lb-next" onClick={next}><IoChevronForward /></button>
              </>
            )}

            {/* filmstrip thumbnails */}
            {images.length > 1 && (
              <div className="pa-lb-strip">
                {images.map((src, i) => (
                  <button
                    key={i}
                    className={`pa-lb-thumb ${i === activeIndex ? 'pa-lb-thumb-active' : ''}`}
                    onClick={() => { setActiveIndex(i); setZoomed(false); }}
                  >
                    <img
                      src={src}
                      alt={`thumb-${i}`}
                      onError={(e) => { e.target.src = '/images/placeholder.png'; }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PhotoAlbum;