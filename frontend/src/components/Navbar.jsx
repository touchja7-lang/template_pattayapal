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

  // รายการหมวดหมู่ (เอาคำว่า "ข่าว" ออกจากลิสต์นี้เพื่อไปแยก Link ต่างหาก)
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
            <p>Pattaya<span>Community</span></p>
          </Link>
        </div>

        {/* --- ตรงกลาง: เมนูหลักและหมวดหมู่ (จัดระเบียบแถวเดียว) --- */}
        <div className={`nav-center ${showMobileMenu ? 'active' : ''}`}>
          <div className="nav-links">
            {/* เมนู ข่าว ลิงก์ไปที่หน้า news รวม */}
            <Link to="/news" className="nav-link-item" onClick={() => setShowMobileMenu(false)}>
              ข่าว
            </Link>

            {/* วนลูปหมวดหมู่ที่เหลือ */}
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

            <Link to="/library" className="nav-link-item" onClick={() => setShowMobileMenu(false)}>
              ห้องสมุด
            </Link>
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
                {user.profileImage ? (
                  <img src={user.profileImage} alt="User" onError={(e) => e.target.src = defaultAvatar} />
                ) : (
                  <IoPerson />
                )}
              </div>
              {showUserMenu && (
                <div className="user-dropdown">
                  <p className="dropdown-user-name">{user.fullName}</p>
                  <Link to="/profile" className="dropdown-link" onClick={() => setShowUserMenu(false)}>โปรไฟล์</Link>
                  {user.role === 'admin' && <Link to="/admin" className="dropdown-link" onClick={() => setShowUserMenu(false)}>แอดมิน</Link>}
                  <button onClick={handleLogout} className="logout-button">ออกจากระบบ</button>
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