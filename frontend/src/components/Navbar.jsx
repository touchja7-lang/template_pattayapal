import React, { useState, useEffect, useRef } from 'react';
import { IoPerson, IoSettingsOutline, IoMenu, IoClose, IoLogOut, IoChevronDown } from "react-icons/io5";
import { CiSearch } from "react-icons/ci";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { categoryAPI } from '../services/api';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const searchRef = useRef(null);

  const defaultAvatar = 'https://cdn-icons-png.flaticon.com/512/616/616408.png';

  useEffect(() => {
    categoryAPI.getAll()
      .then(res => setCategories(res.data))
      .catch(err => console.error('Error fetching categories:', err));
  }, []);

  useEffect(() => {
    if (showSearch && searchRef.current) {
      searchRef.current.focus();
    }
  }, [showSearch]);

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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&family=Prompt:wght@600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .nb-root {
          font-family: 'Sarabun', sans-serif;
          position: sticky;
          top: 0;
          z-index: 1000;
          background: #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        /* ===== TOP BAR ===== */
        .nb-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          height: 56px;
          border-bottom: 1px solid #f0f0f0;
        }

        /* Left: hamburger */
        .nb-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 120px;
        }

        .nb-icon-btn {
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          border-radius: 6px;
          color: #333;
          font-size: 22px;
          transition: background 0.15s;
        }
        .nb-icon-btn:hover { background: #f5f5f5; }

        /* Center: logo */
        .nb-center {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
        }

        .nb-logo {
          text-decoration: none;
          font-family: 'Prompt', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: #1a1a1a;
          letter-spacing: -0.5px;
        }
        .nb-logo span { color: #16a34a; }

        /* Right: search + profile */
        .nb-right {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 120px;
          justify-content: flex-end;
        }

        /* Search overlay */
        .nb-search-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.4);
          z-index: 2000;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 80px;
          animation: fadeIn 0.15s ease;
        }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }

        .nb-search-box {
          background: #fff;
          border-radius: 12px;
          width: min(560px, 90vw);
          padding: 16px 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        }
        .nb-search-box form {
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 2px solid #16a34a;
          padding-bottom: 8px;
        }
        .nb-search-box input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 18px;
          font-family: 'Sarabun', sans-serif;
          color: #1a1a1a;
        }
        .nb-search-box input::placeholder { color: #aaa; }
        .nb-search-box button {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 22px;
          color: #16a34a;
        }

        /* Profile */
        .nb-profile-wrap { position: relative; }
        .nb-avatar-btn {
          width: 36px; height: 36px;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid #e5e7eb;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          background: #f3f4f6;
          color: #555;
          font-size: 18px;
          transition: border-color 0.15s;
        }
        .nb-avatar-btn:hover { border-color: #16a34a; }
        .nb-avatar-btn img { width: 100%; height: 100%; object-fit: cover; }

        .nb-dropdown {
          position: absolute;
          right: 0; top: calc(100% + 10px);
          background: #fff;
          border-radius: 12px;
          min-width: 200px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.14);
          overflow: hidden;
          animation: slideDown 0.15s ease;
        }
        @keyframes slideDown { from { opacity:0; transform:translateY(-6px) } to { opacity:1; transform:translateY(0) } }

        .nb-dropdown-header {
          padding: 14px 16px;
          background: #f9fafb;
          border-bottom: 1px solid #f0f0f0;
        }
        .nb-dropdown-header .name {
          font-weight: 600; font-size: 14px; color: #1a1a1a;
        }
        .nb-dropdown-header .email {
          font-size: 12px; color: #888; margin-top: 2px;
          display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .nb-dropdown a, .nb-dropdown button {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 16px;
          text-decoration: none;
          font-size: 14px; font-family: 'Sarabun', sans-serif;
          color: #333; background: none; border: none;
          width: 100%; cursor: pointer;
          transition: background 0.12s;
        }
        .nb-dropdown a:hover, .nb-dropdown button:hover { background: #f5f5f5; }
        .nb-dropdown button { color: #dc2626; }

        /* ===== CATEGORY BAR ===== */
        .nb-cats {
          display: flex;
          align-items: center;
          gap: 0;
          overflow-x: auto;
          scrollbar-width: none;
          padding: 0 16px;
          height: 44px;
          border-bottom: 2px solid #e5e7eb;
        }
        .nb-cats::-webkit-scrollbar { display: none; }

        .nb-cat-link {
          text-decoration: none;
          color: #333;
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
          padding: 0 14px;
          height: 100%;
          display: flex; align-items: center;
          border-bottom: 3px solid transparent;
          margin-bottom: -2px;
          transition: color 0.15s, border-color 0.15s;
        }
        .nb-cat-link:hover { color: #16a34a; border-bottom-color: #16a34a; }
        .nb-cat-link.all { font-weight: 700; color: #16a34a; }

        /* ===== MOBILE DRAWER ===== */
        .nb-drawer-backdrop {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.3);
          z-index: 1500;
          animation: fadeIn 0.2s ease;
        }
        .nb-drawer {
          position: fixed;
          top: 0; left: 0; bottom: 0;
          width: 280px;
          background: #fff;
          z-index: 1600;
          box-shadow: 4px 0 24px rgba(0,0,0,0.12);
          display: flex; flex-direction: column;
          animation: slideRight 0.2s ease;
          overflow-y: auto;
        }
        @keyframes slideRight { from { transform: translateX(-100%) } to { transform: translateX(0) } }

        .nb-drawer-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #f0f0f0;
        }
        .nb-drawer-logo {
          font-family: 'Prompt', sans-serif;
          font-size: 20px; font-weight: 700;
          color: #1a1a1a; text-decoration: none;
        }
        .nb-drawer-logo span { color: #16a34a; }

        .nb-drawer-links {
          padding: 12px 0;
        }
        .nb-drawer-link {
          display: block;
          text-decoration: none;
          color: #1a1a1a;
          font-size: 15px; font-weight: 500;
          padding: 12px 20px;
          transition: background 0.12s;
        }
        .nb-drawer-link:hover { background: #f5fdf7; color: #16a34a; }

        .nb-drawer-section-title {
          padding: 10px 20px 6px;
          font-size: 11px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 1px;
          color: #aaa;
        }

        .nb-drawer-cat {
          display: block;
          text-decoration: none;
          color: #555;
          font-size: 14px;
          padding: 9px 20px 9px 28px;
          transition: background 0.12s;
        }
        .nb-drawer-cat:hover { background: #f5fdf7; color: #16a34a; }

        /* Login btn */
        .nb-login-btn {
          display: flex; align-items: center; gap: 6px;
          text-decoration: none;
          background: #16a34a;
          color: #fff;
          padding: 7px 14px;
          border-radius: 20px;
          font-size: 14px; font-weight: 600;
          font-family: 'Sarabun', sans-serif;
          transition: background 0.15s;
        }
        .nb-login-btn:hover { background: #15803d; }

        @media (max-width: 768px) {
          .nb-cats { display: none; }
        }
      `}</style>

      <nav className="nb-root">
        {/* ── TOP BAR ── */}
        <div className="nb-top">
          {/* Left */}
          <div className="nb-left">
            <button className="nb-icon-btn" onClick={() => setShowMobileMenu(true)} aria-label="เมนู">
              <IoMenu />
            </button>
          </div>

          {/* Center Logo */}
          <div className="nb-center">
            <Link to="/" className="nb-logo">
              Athip<span>burapa</span>
            </Link>
          </div>

          {/* Right */}
          <div className="nb-right">
            <button className="nb-icon-btn" onClick={() => setShowSearch(true)} aria-label="ค้นหา">
              <CiSearch />
            </button>

            {user ? (
              <div className="nb-profile-wrap">
                <div className="nb-avatar-btn" onClick={() => setShowUserMenu(!showUserMenu)}>
                  {(user.profileImage || user.image) ? (
                    <img
                      src={user.profileImage || user.image}
                      alt="Profile"
                      onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }}
                    />
                  ) : <IoPerson />}
                </div>
                {showUserMenu && (
                  <>
                    <div style={{ position:'fixed', inset:0, zIndex:999 }} onClick={() => setShowUserMenu(false)} />
                    <div className="nb-dropdown" style={{ zIndex: 1000 }}>
                      <div className="nb-dropdown-header">
                        <p className="name">{user.fullName || user.username}</p>
                        <span className="email">{user.email}</span>
                      </div>
                      <Link to="/profile" onClick={() => setShowUserMenu(false)}>
                        <IoPerson /> โปรไฟล์
                      </Link>
                      {user.role === 'admin' && (
                        <Link to="/admin" onClick={() => setShowUserMenu(false)}>
                          <IoSettingsOutline /> แอดมิน
                        </Link>
                      )}
                      <button onClick={handleLogout}><IoLogOut /> ออกจากระบบ</button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link to="/login" className="nb-login-btn">
                <IoPerson /> เข้าสู่ระบบ
              </Link>
            )}
          </div>
        </div>

        {/* ── CATEGORY BAR ── */}
        <div className="nb-cats">
          <Link to="/news" className="nb-cat-link all">ข่าวทั้งหมด</Link>
          {categories.map(cat => (
            <Link
              key={cat._id}
              to={`/news/category/${encodeURIComponent(cat.name)}`}
              className="nb-cat-link"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* ── SEARCH OVERLAY ── */}
      {showSearch && (
        <div className="nb-search-overlay" onClick={() => setShowSearch(false)}>
          <div className="nb-search-box" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSearch}>
              <input
                ref={searchRef}
                type="text"
                placeholder="ค้นหาข่าว..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <button type="submit"><CiSearch /></button>
            </form>
          </div>
        </div>
      )}

      {/* ── MOBILE DRAWER ── */}
      {showMobileMenu && (
        <>
          <div className="nb-drawer-backdrop" onClick={() => setShowMobileMenu(false)} />
          <div className="nb-drawer">
            <div className="nb-drawer-header">
              <Link to="/" className="nb-drawer-logo" onClick={() => setShowMobileMenu(false)}>
                Athip<span>burapa</span>
              </Link>
              <button className="nb-icon-btn" onClick={() => setShowMobileMenu(false)}>
                <IoClose />
              </button>
            </div>
            <div className="nb-drawer-links">
              <Link to="/news" className="nb-drawer-link" onClick={() => setShowMobileMenu(false)}>
                ข่าวทั้งหมด
              </Link>
              {categories.length > 0 && (
                <>
                  <div className="nb-drawer-section-title">หมวดหมู่</div>
                  {categories.map(cat => (
                    <Link
                      key={cat._id}
                      to={`/news/category/${encodeURIComponent(cat.name)}`}
                      className="nb-drawer-cat"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Navbar;