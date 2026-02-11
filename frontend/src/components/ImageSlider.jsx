import React from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import './ImageSlider.css'
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './ImageSlider.css';
import { getSliderNews } from '../data/newsData';

// ไอคอนลูกศร (ถ้าต้องการใช้แบบ Custom)
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

const ImageSlider = () => {
  const slides = getSliderNews();

  return (
    <div className="slider-container">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000 }}
        loop={true}
        className="mySwiper"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <Link to={`/news/${slide.id}`} className="slide-content">
              <img src={slide.image} alt={slide.title} />
              
              {/* Overlay ข้อความ */}
              <div className="slide-overlay">
                <span className="category-tag">{slide.category}</span>
                <h2 className="slide-title">{slide.title}</h2>
                <div className="slide-meta">
                   <span>📰 ข่าว</span>
                   <span>🕒 {slide.date}</span>
                   <span>👁️ {slide.views} ครั้ง</span>
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