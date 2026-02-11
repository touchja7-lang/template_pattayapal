import React from 'react';
import './Popularnews.css';
import { HiOutlineClock, HiOutlineEye, HiOutlineChevronRight } from "react-icons/hi";

const PopularNews = () => {
  // ข้อมูลจำลองรายการยอดนิยม
  const popularNews = [
    { id: 1, title: "หนองปรือจัดอบรมพัฒนาศักยภาพสตรี เสริมบทบาทผู้นำชุมชน พร้อมสอนทำโบว์ไว้อาลัย", category: "การเมือง", date: "14/11/2025 11:49", views: 495 },
    { id: 2, title: "สกสว. จัด Thailand Talent Summit 2025 รวมนักวิจัยกว่า 2,100 คน ขับเคลื่อนไทยด้วยนวัตกรรม", category: "เทคโนโลยี", date: "11/12/2025 21:25", views: 59 },
    { id: 3, title: "ไซยาไนด์: 10 ข้อควรรู้ พิษร้ายออกฤทธิ์เร็วถึงชีวิต อันตรายที่ต้องระวัง", category: "อาชญากรรม", date: "08/12/2025 18:17", views: 51 },
    { id: 4, title: "เมืองพัทยาจัดงานเชิดชูเกียรติ \"คุณพ่อคนดี ศรีแผ่นดิน\" ปี 2568 ยกย่องพ่อผู้เป็นแบบอย่างสังคม", category: "การเมือง", date: "15/12/2025 18:51", views: 28 },
  ];

  // ข้อมูลจำลองหมวดหมู่
  const categories = [
    { name: "การเมือง", count: 12, color: "#ff4d4d" },
    { name: "เศรษฐกิจ", count: 7, color: "#00a859" },
    { name: "กีฬา", count: 3, color: "#004a7c" },
    { name: "บันเทิง", count: 4, color: "#a16eff" },
    { name: "เทคโนโลยี", count: 1, color: "#ff8c00" },
  ];

  return (
    <div className="popular-container">
      {/* ฝั่งซ้าย: ยอดนิยม */}
      <div className="popular-list-section">
        <h2 className="section-title">📊 ยอดนิยม</h2>
        <div className="list-wrapper">
          {popularNews.map((news, index) => (
            <div key={news.id} className="popular-item-card">
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
          ))}
        </div>
      </div>

      {/* ฝั่งขวา: หมวดหมู่ */}
      <div className="category-section">
        <h2 className="section-title">หมวดหมู่</h2>
        <div className="category-wrapper">
          {categories.map((cat, index) => (
            <div key={index} className="category-item-card">
              <div className="cat-indicator" style={{ backgroundColor: cat.color }}></div>
              <div className="cat-info">
                <span className="cat-name">{cat.name}</span>
                <span className="cat-count">{cat.count} ข่าว</span>
              </div>
              <HiOutlineChevronRight className="arrow-icon" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PopularNews;