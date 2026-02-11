import React, { useState } from 'react';
import './Navbar.css';
import { HiOutlineNewspaper } from "react-icons/hi";
import { MdOutlineLocalLibrary } from "react-icons/md";
import { IoPerson, IoSettingsOutline, IoMenu, IoClose } from "react-icons/io5";
import { CiSearch } from "react-icons/ci";
import { IoLogOut } from "react-icons/io5";
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
    <section className='navbar-container'>
        <div className="navbar">
            <div className="nav-left">
                <button className="mobile-menu-btn" onClick={() => setShowMobileMenu(!showMobileMenu)}>
                    {showMobileMenu ? <IoClose /> : <IoMenu />}
                </button>
                <Link to="/" className="logo">
                    <p>Pattaya Community</p>
                </Link>
            </div>

            <div className={`nav-center ${showMobileMenu ? 'active' : ''}`}>
                <div className="icons-menu-container">
                  <Link to="/news" className='icons-menu' onClick={() => setShowMobileMenu(false)}>
                    <HiOutlineNewspaper /> <span>ข่าวสาร</span>
                  </Link>
                  <Link to="/library" className='icons-menu' onClick={() => setShowMobileMenu(false)}>
                    <MdOutlineLocalLibrary /> <span>ห้องสมุด</span>
                  </Link>
                </div>
            </div>
            
            <div className="icons-other-container">
                <div className="search-wrapper">
                    <p className='icons-other search-trigger' onClick={() => setShowSearch(!showSearch)}>
                        <CiSearch />
                    </p>
                    {showSearch && (
                        <form onSubmit={handleSearch} className="search-dropdown">
                            <input 
                                type="text" 
                                placeholder="ค้นหาข่าวสาร..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                            <button type="submit">ค้นหา</button>
                        </form>
                    )}
                </div>

                {user ? (
                  <div className="user-menu">
                    <div 
                      className="icons-other user-icon" 
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        overflow: 'hidden',
                        padding: user.profileImage ? '0' : ''
                      }}
                    >
                      {user.profileImage ? (
                        <img 
                          src={user.profileImage} 
                          alt="Profile" 
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover',
                            borderRadius: '50%' 
                          }}
                          onError={(e) => { e.target.src = defaultAvatar }}
                        />
                      ) : (
                        <IoPerson />
                      )}
                    </div>
                    {showUserMenu && (
                      <div className="user-dropdown">
                        <p className="user-name">{user.fullName || 'ผู้ใช้งาน'}</p>
                        <Link to="/profile" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                          <IoPerson /> โปรไฟล์ของฉัน
                        </Link>
                        {user.role === 'admin' && (
                          <Link to="/admin" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                            <IoSettingsOutline /> จัดการระบบ
                          </Link>
                        )}
                        <button onClick={handleLogout} className="logout-btn">
                          <IoLogOut /> ออกจากระบบ
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link to="/login" className='icons-other'><IoPerson /></Link>
                )}
            </div>
        </div>
    </section>
  )
}

export default Navbar;
