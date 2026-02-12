import React from 'react';
import './Popularnews.css';
import { HiOutlineClock, HiOutlineEye, HiOutlineChevronRight } from "react-icons/hi";
import { Link } from 'react-router-dom'; // 1. เพิ่มการ Import Link

const PopularNews = () => {
  // ข้อมูลจำลองรายการยอดนิยม (เพิ่ม Link ให้กับหัวข้อข่าวด้วย)
  const popularNews = [
    { id: 1, _id: "67ab...", title: "หนองปรือจัดอบรมพัฒนาศักยภาพสตรี...", category: "การเมือง", date: "14/11/2025 11:49", views: 495 },
    // ... อื่นๆ
  ];

  const categories = [
    { name: "การเมือง", count: 12, color: "#ff4d4d", path: "news/category/politics" }, // คุณสามารถกำหนด path เองได้
    { name: "เศรษฐกิจ", count: 7, color: "#00a859", path: "news/category/economy" },
    { name: "กีฬา", count: 3, color: "#004a7c", path: "news/category/sports" },
    { name: "บันเทิง", count: 4, color: "#a16eff", path: "news/category/entertainment" },
    { name: "เทคโนโลยี", count: 1, color: "#ff8c00", path: "news/category/technology" },
  ];

  return (
    <div className="popular-container">
      {/* ฝั่งซ้าย: ยอดนิยม */}
      <div className="popular-list-section">
        <h2 className="section-title">📊 ยอดนิยม</h2>
        <div className="list-wrapper">
          {popularNews.map((news, index) => (
            // 2. ครอบหัวข้อข่าวด้วย Link เพื่อให้กดไปอ่านรายละเอียดได้
            <Link key={news.id} to={`/news/${news._id || news.id}`} className="popular-item-link">
              <div className="popular-item-card">
                <div className="rank-number">{index + 1}</div>
                <div className="item-content">
                  <h3 className="item-title">{news.title}</h3>
                  <div className="item-meta">
                    <span className="cat">{news.category}</span>
                    <span><HiOutlineClock /> {news.date}</span>
                    <span><HiOutlineEye /> {news.views} ครั้ง</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ฝั่งขวา: หมวดหมู่ */}
      <div className="category-section">
        <h2 className="section-title">หมวดหมู่</h2>
        <div className="category-wrapper">
          {categories.map((cat, index) => (
            // 3. ใช้ Link ครอบการ์ดหมวดหมู่ 
            // โดยส่งชื่อหมวดหมู่ไปทาง URL เช่น /category/การเมือง
            <Link 
              key={index} 
              to={`/news/category/${encodeURIComponent(cat.name)}`} 
              className="category-link-wrapper"
            >
              <div className="category-item-card">
                <div className="cat-indicator" style={{ backgroundColor: cat.color }}></div>
                <div className="cat-info">
                  <span className="cat-name">{cat.name}</span>
                  <span className="cat-count">{cat.count} ข่าว</span>
                </div>
                <HiOutlineChevronRight className="arrow-icon" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PopularNews;