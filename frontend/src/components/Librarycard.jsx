import React, { useState, useEffect } from 'react';
import './Librarycard.css';
import { IoEyeOutline, IoArrowForward } from "react-icons/io5";
import { Link } from 'react-router-dom';

const LibraryCard = () => {
  // หากในอนาคตต้องการดึงจาก API ให้เปลี่ยนค่าเริ่มต้นจาก array นี้เป็น fetch แทนครับ
  const [libraryData, setLibraryData] = useState([
    { id: 1, title: 'Terminal 21 Pattaya', location: 'พัทยาเหนือ', views: 82, img: 'https://images.unsplash.com/photo-1519046904884-53103b34b206' },
    { id: 2, title: 'Central Festival Pattaya Beach', location: 'พัทยาเหนือ', views: 26, img: 'https://images.unsplash.com/photo-1519046904884-53103b34b206' },
    { id: 5, title: 'Pattaya Beach', location: 'พัทยากลาง', views: 5, img: 'https://images.unsplash.com/photo-1519046904884-53103b34b206' },
    { id: 6, title: 'Royal Garden Plaza', location: 'พัทยากลาง', views: 0, img: 'https://images.unsplash.com/photo-1519046904884-53103b34b206' },
  ]);

  return (
    <section className="library-container">
      <div className="section-header">
        <h2 className="section-title">Pattaya Library</h2>
        <Link to="/library" className="view-all">
          ดูทั้งหมด <IoArrowForward />
        </Link>
      </div>

      <div className="library-grid">
        {libraryData.map((item) => (
          /* ใช้ Link หุ้มด้านใน map เพื่อให้แต่ละการ์ดแยกกันทำงาน */
          <Link to={`/library/${item.id}`} key={item.id} className="lib-link-wrapper">
            <div className="lib-card">
              <div className="lib-image-wrapper">
                <img src={item.img} alt={item.title} />
                <span className="lib-tag">{item.location}</span>
              </div>
              <div className="lib-info">
                <h3 className="lib-name">{item.title}</h3>
                <p className="lib-views">
                  <IoEyeOutline /> {item.views} ครั้ง
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default LibraryCard;