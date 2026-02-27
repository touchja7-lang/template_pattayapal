import React from 'react';
import { Link } from 'react-router-dom';
import { IoLogoFacebook, IoLogoTiktok, IoLogoInstagram, IoLogoYoutube, IoGlobeOutline } from "react-icons/io5";
import './Footer.css';

const Footer = () => {
  return (
    <footer className="ft-root">

      {/* ── MAIN COLUMNS ── */}
      <div className="ft-main">
        <div className="ft-inner">

          {/* หมวดหมู่ */}
          <div className="ft-col">
            <h4 className="ft-col-title">หมวดหมู่</h4>
            <div className="ft-links">
              <Link to="/news/category/การเมือง">การเมือง</Link>
              <Link to="/news/category/เศรษฐกิจ">เศรษฐกิจ</Link>
              <Link to="/news/category/กีฬา">กีฬา</Link>
              <Link to="/news/category/บันเทิง">บันเทิง</Link>
              <Link to="/news/category/เทคโนโลยี">เทคโนโลยี</Link>
            </div>
          </div>

          {/* เกี่ยวกับเรา */}
          <div className="ft-col">
            <h4 className="ft-col-title">เกี่ยวกับเรา</h4>
            <div className="ft-links">
              <Link to="/about">เกี่ยวกับเรา</Link>
              <Link to="/contact">ติดต่อเรา</Link>
              <Link to="/privacy">นโยบายความเป็นส่วนตัว</Link>
              <Link to="/terms">เงื่อนไขการใช้งาน</Link>
            </div>
          </div>

          {/* ติดตามเราได้ที่ */}
          <div className="ft-col ft-col-social">
            <h4 className="ft-col-title">ติดตามเราได้ที่</h4>
            <div className="ft-social">
              <a href="https://web.facebook.com/Athipburapa.news?locale=th_TH" target="_blank" rel="noreferrer" aria-label="Facebook">
                <IoLogoFacebook />
              </a>
              <a href="#" aria-label="TikTok"><IoLogoTiktok /></a>
              <a href="#" aria-label="Instagram"><IoLogoInstagram /></a>
              <a href="#" aria-label="YouTube"><IoLogoYoutube /></a>
              <a href="#" aria-label="Website"><IoGlobeOutline /></a>
            </div>
          </div>

        </div>
      </div>

      {/* ── BOTTOM: เกี่ยวกับ + copyright ── */}
      <div className="ft-bottom">
        <div className="ft-bottom-inner">
          <div className="ft-bottom-links">
            <span className="ft-bottom-label">เกี่ยวกับ Athipburapa</span>
            <Link to="/about">เกี่ยวกับเรา</Link>
            <Link to="/contact">ติดต่อเรา</Link>
            <Link to="/privacy">นโยบายความเป็นส่วนตัว</Link>
            <Link to="/terms">เงื่อนไขการใช้งาน</Link>
          </div>
          <p className="ft-copyright">© 2026 Athipburapa - เว็บไซต์ข่าวสารออนไลน์ สงวนลิขสิทธิ์</p>
        </div>
      </div>

    </footer>
  );
};

export default Footer;