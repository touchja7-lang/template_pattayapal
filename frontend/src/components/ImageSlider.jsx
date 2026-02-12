import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import api from '../services/api.js'; // ✅ Import api เพื่อดึงข้อมูลจาก DB

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './ImageSlider.css';

const ImageSlider = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestNews = async () => {
      try {
        // ✅ ดึงข่าวทั้งหมด โดยเรียงจากใหม่ไปเก่า (limit 5 เพื่อไม่ให้ slider เยอะเกินไป)
        const response = await api.get('/news', {
          params: { sort: '-createdAt', limit: 5 }
        });
        
        if (response.data && response.data.length > 0) {
          setSlides(response.data);
        }
      } catch (err) {
        console.error("Error fetching slider news:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestNews();
  }, []);

  if (loading) return <div className="slider-loading">กำลังโหลดไฮไลท์...</div>;
  if (slides.length === 0) return null; // ไม่แสดง slider ถ้าไม่มีข่าว

  return (
    <div className="slider-container">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000 }}
        loop={slides.length > 1} // loop เฉพาะเมื่อมีมากกว่า 1 รูป
        className="mySwiper"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide._id || slide.id}>
            {/* ✅ ใช้ _id สำหรับข่าวจาก DB */}
            <Link to={`/news/${slide._id || slide.id}`} className="slide-content">
              <img src={slide.image || slide.thumbnail} alt={slide.title} />
              
              <div className="slide-overlay">
                {/* รองรับ category ทั้งแบบ String และ Object */}
                <span className="category-tag">
                   {typeof slide.category === 'object' ? 'ข่าวสาร' : slide.category}
                </span>
                <h2 className="slide-title">{slide.title}</h2>
                <div className="slide-meta">
                    <span>📰 ข่าว</span>
                    <span>🕒 {slide.createdAt?.substring(0, 10) || slide.date}</span>
                    <span>👁️ {slide.views || 0} ครั้ง</span>
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ImageSlider;