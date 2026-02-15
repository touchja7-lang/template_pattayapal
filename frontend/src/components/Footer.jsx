import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import { IoLogoFacebook, IoLogoTiktok, IoLogoInstagram, IoLogoYoutube } from "react-icons/io5";

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        {/* คอลัมน์ที่ 1: โลโก้และรายละเอียด */}
        <div className="footer-column brand-info">
          <div className="footer-logo">
             <div className="logo-icon">A</div>
             <h2>Athipburapa</h2>
          </div>
          <p className="brand-desc">
            แหล่งข่าวสารที่เชื่อถือได้ ครอบคลุมทุกมิติ อัปเดตข่าวตลอด 24 ชั่วโมง 
            พร้อมส่งมอบข้อมูลที่ถูกต้อง รวดเร็ว และทันสมัย
          </p>
          <div className="social-links">
            <a href="https://web.facebook.com/Athipburapa.news?locale=th_TH"><IoLogoFacebook /></a>
            <a href="#"><IoLogoTiktok /></a>
            <a href="#"><IoLogoInstagram /></a>
            <a href="#"><IoLogoYoutube /></a>
          </div>
        </div>

        {/* คอลัมน์ที่ 2: Pattaya Library */}
        <div className="footer-column">
          <h3>Pattaya Library</h3>
          <ul>
            <li><Link to="/library">พัทยาเหนือ</Link></li>
            <li><Link to="/library">พัทยากลาง</Link></li>
            <li><Link to="/library">พัทยาใต้</Link></li>
            <li><Link to="/library">นาเกลือ</Link></li>
            <li><Link to="/library">จอมเทียน</Link></li>
            <li><Link to="/library">เกาะล้าน</Link></li>
            <li><Link to="/library">การท่องเที่ยว</Link></li>
          </ul>
        </div>

        {/* คอลัมน์ที่ 3: หมวดหมู่ */}
        <div className="footer-column">
          <h3>หมวดหมู่</h3>
          <ul>
            <li><Link to="/news/category/การเมือง">การเมือง</Link></li>
            <li><Link to="/news/category/เศรษฐกิจ">เศรษฐกิจ</Link></li>
            <li><Link to="/news/category/กีฬา">กีฬา</Link></li>
            <li><Link to="/news/category/บันเทิง">บันเทิง</Link></li>
            <li><Link to="/news/category/เทคโนโลยี">เทคโนโลยี</Link></li>
          </ul>
        </div>

        {/* คอลัมน์ที่ 4: เกี่ยวกับเรา */}
        <div className="footer-column">
          <h3>เกี่ยวกับเรา</h3>
          <ul>
            <li><Link to="/about">เกี่ยวกับ Pattayapal</Link></li>
            <li><Link to="/contact">ติดต่อเรา</Link></li>
            <li><Link to="/privacy">นโยบายความเป็นส่วนตัว</Link></li>
            <li><Link to="/terms">เงื่อนไขการใช้งาน</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 Athipburapa - เว็บไซต์ข่าวสารออนไลน์ สงวนลิขสิทธิ์.</p>
      </div>
    </footer>
  );
};

export default Footer;