import React, { useState } from 'react';
import './Navbar.css';
import { IoPerson, IoSettingsOutline, IoMenu, IoClose, IoLogOut } from "react-icons/io5";
import { CiSearch } from "react-icons/ci";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');


  const defaultAvatar = 'https://cdn-icons-png.flaticon.com/512/616/616408.png';

  const categories = ["กีฬา", "บันเทิง", "เทคโนโลยี", "เศรษฐกิจ"];

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowUserMenu(false);
    setShowMobileMenu(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/news?search=${encodeURIComponent(searchTerm.trim())}`);
      setShowSearch(false);
      setSearchTerm('');
      setShowMobileMenu(false);
    }
  };

  return (
    <nav className='navbar-main-container'>
      <div className="navbar-content">
        
        {/* --- ฝั่งซ้าย: Logo --- */}
        <div className="nav-left">
          <button className="mobile-menu-btn" onClick={() => setShowMobileMenu(!showMobileMenu)}>
            {showMobileMenu ? <IoClose /> : <IoMenu />}
          </button>
          <Link to="/" className="logo">
            <p>Athip<span>burapa</span></p>
          </Link>
        </div>

        {/* --- ตรงกลาง: เมนู --- */}
        <div className={`nav-center ${showMobileMenu ? 'active' : ''}`}>
          <div className="nav-links">
            <Link to="/news" className="nav-link-item" onClick={() => setShowMobileMenu(false)}>ข่าว</Link>
            {categories.map((cat, index) => (
              <Link 
                key={index} 
                to={`/news/category/${encodeURIComponent(cat)}`} 
                className="nav-link-item"
                onClick={() => setShowMobileMenu(false)}
              >
                {cat}
              </Link>
            ))}
            {/* <Link to="/library" className="nav-link-item" onClick={() => setShowMobileMenu(false)}>ห้องสมุด</Link> */}
          </div>
        </div>

        {/* --- ฝั่งขวา: ค้นหา & โปรไฟล์ --- */}
        <div className="nav-right">
          <div className="search-box">
            <button className='icon-btn' onClick={() => setShowSearch(!showSearch)}>
              <CiSearch />
            </button>
            {showSearch && (
              <form onSubmit={handleSearch} className="search-input-wrapper">
                <input
                  type="text"
                  placeholder="ค้นหาข่าว..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
              </form>
            )}
          </div>

          {user ? (
            <div className="user-profile-wrapper">
              <div className="profile-trigger" onClick={() => setShowUserMenu(!showUserMenu)}>
                {/* ตรวจสอบทั้ง user.profileImage (จาก DB) และ user.image (เผื่อบางที่เก็บคนละชื่อ) 
                  ใส่ Query String เพื่อป้องกัน Browser Cache รูปเก่า
                */}
                {(user.profileImage || user.image) ? (
                  <img 
                    src={user.profileImage || user.image} 
                    alt="Profile" 
                    key={user.profileImage || user.image} // ใช้ key เพื่อให้ React บังคับ re-render เมื่อ URL เปลี่ยน
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = defaultAvatar;
                    }} 
                  />
                ) : (
                  <div className="default-avatar-placeholder">
                    <IoPerson />
                  </div>
                )}
              </div>
              
              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <p className="dropdown-user-name">{user.fullName || user.username}</p>
                    <span className="dropdown-user-email">{user.email}</span>
                  </div>
                  <hr />
                  <Link to="/profile" className="dropdown-link" onClick={() => setShowUserMenu(false)}>
                    <IoPerson /> โปรไฟล์
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="dropdown-link" onClick={() => setShowUserMenu(false)}>
                      <IoSettingsOutline /> แอดมิน
                    </Link>
                  )}
                  <button onClick={handleLogout} className="logout-button">
                    <IoLogOut /> ออกจากระบบ
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className='icon-btn'><IoPerson /></Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;