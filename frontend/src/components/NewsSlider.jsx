import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import './ImageSlider.css'
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './ImageSlider.css';

// ไอคอนลูกศร (ถ้าต้องการใช้แบบ Custom)
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

const ImageSlider = () => {
  const slides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206', // เปลี่ยนเป็น URL รูปของคุณ
      category: 'อาชญากรรม',
      title: 'ไซยาไนด์: 10 ข้อควรรู้ พิษร้ายออกฤทธิ์เร็วถึงชีวิต อันตรายที่ต้องระวัง',
      date: '08/12/2025 18:17',
      views: 49
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206', // เปลี่ยนเป็น URL รูปของคุณ
      category: 'อาชญากรรม',
      title: 'mtg]: 10 ข้อควรรู้ พิษร้ายออกฤทธิ์เร็วถึงชีวิต อันตรายที่ต้องระวัง',
      date: '08/12/2025 18:17',
      views: 49

    }
        
  ];

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
            <div className="slide-content">
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
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ImageSlider;