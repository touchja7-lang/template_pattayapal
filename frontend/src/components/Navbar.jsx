import React, { useState, useEffect, useRef } from 'react';
import { IoPerson, IoSettingsOutline, IoMenu, IoClose, IoLogOut } from "react-icons/io5";
import { CiSearch } from "react-icons/ci";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/Languagecontext';
import { categoryAPI } from '../services/api';
import './Navbar.css';

function Navbar() {
  const { user, logout }        = useAuth();
  const { lang, switchLang, t, translateList } = useLanguage();
  const navigate                = useNavigate();
  const location                = useLocation();
  const [showUserMenu, setShowUserMenu]     = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearch, setShowSearch]         = useState(false);
  const [searchTerm, setSearchTerm]         = useState('');
  const [rawCategories, setRawCategories]   = useState([]);
  const [displayCategories, setDisplayCategories] = useState([]);
  const searchRef = useRef(null);

  const defaultAvatar = 'https://cdn-icons-png.flaticon.com/512/616/616408.png';

  // ดึง categories จาก DB
  useEffect(() => {
    categoryAPI.getAll()
      .then(res => setRawCategories(res.data))
      .catch(err => console.error('Error fetching categories:', err));
  }, []);

  // แปลชื่อ category เมื่อ lang หรือ rawCategories เปลี่ยน
  useEffect(() => {
    if (!rawCategories.length) return;

    if (lang === 'th') {
      setDisplayCategories(rawCategories);
      return;
    }

    // แปล category objects (ใช้ translateList เหมือนข่าว)
    const catAsNews = rawCategories.map(c => ({ ...c, title: c.name }));
    translateList(catAsNews).then(translated => {
      setDisplayCategories(
        translated.map((item, i) => ({
          ...rawCategories[i],
          displayName: item.title, // ชื่อที่แปลแล้ว
        }))
      );
    });
  }, [rawCategories, lang, translateList]);

  useEffect(() => {
    if (showSearch && searchRef.current) searchRef.current.focus();
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

  const path        = location.pathname;
  const isAllActive = path === '/news';
  const activeCat   = path.startsWith('/news/category/')
    ? decodeURIComponent(path.split('/news/category/')[1])
    : null;

  return (
    <>
      <nav className="nb-root">
        <div className="nb-top">
          <div className="nb-left">
            <button className="nb-icon-btn" onClick={() => setShowMobileMenu(true)} aria-label="เมนู">
              <IoMenu />
            </button>
          </div>

          <div className="nb-center">
            <Link to="/" className="nb-logo">
              Athip<span>burapa</span>
            </Link>
          </div>

          <div className="nb-right">
            <div className="nb-lang-switcher">
              <button
                className={`nb-lang-btn${lang === 'th' ? ' active' : ''}`}
                onClick={() => switchLang('th')}
                aria-label="ภาษาไทย"
              >TH</button>
              <span className="nb-lang-sep">|</span>
              <button
                className={`nb-lang-btn${lang === 'en' ? ' active' : ''}`}
                onClick={() => switchLang('en')}
                aria-label="English"
              >EN</button>
            </div>

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
                  ) : (
                    <IoPerson />
                  )}
                </div>

                {showUserMenu && (
                  <>
                    <div
                      style={{ position: 'fixed', inset: 0, zIndex: 999 }}
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="nb-dropdown" style={{ zIndex: 1000 }}>
                      <div className="nb-dropdown-header">
                        <p className="name">{user.fullName || user.username}</p>
                        <span className="email">{user.email}</span>
                      </div>
                      <Link to="/profile" onClick={() => setShowUserMenu(false)}>
                        <IoPerson /> {t('nav_profile')}
                      </Link>
                      {user.role === 'admin' && (
                        <Link to="/admin" onClick={() => setShowUserMenu(false)}>
                          <IoSettingsOutline /> {t('nav_admin')}
                        </Link>
                      )}
                      <button onClick={handleLogout}>
                        <IoLogOut /> {t('nav_logout')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link to="/login" className="nb-login-btn">
                <IoPerson /><span className="nb-login-text">{t('nav_login')}</span>
              </Link>
            )}
          </div>
        </div>

        {/* Category bar — ใช้ displayName ที่แปลแล้ว */}
        <div className="nb-cats">
          <Link to="/news" className={`nb-cat-link${isAllActive ? ' active' : ''}`}>
            {t('nav_allNews')}
          </Link>
          {displayCategories.map(cat => (
            <Link
              key={cat._id}
              to={`/news/category/${encodeURIComponent(cat.name)}`}
              className={`nb-cat-link${activeCat === cat.name ? ' active' : ''}`}
            >
              {cat.displayName || cat.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* Search overlay */}
      {showSearch && (
        <div className="nb-search-overlay" onClick={() => setShowSearch(false)}>
          <div className="nb-search-box" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSearch}>
              <input
                ref={searchRef}
                type="text"
                placeholder={t('nav_search')}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <button type="submit"><CiSearch /></button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile drawer */}
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
              <Link
                to="/news"
                className={`nb-drawer-link${isAllActive ? ' active' : ''}`}
                onClick={() => setShowMobileMenu(false)}
              >
                {t('nav_allNews')}
              </Link>
              {displayCategories.length > 0 && (
                <>
                  <div className="nb-drawer-section-title">{t('nav_categories')}</div>
                  {displayCategories.map(cat => (
                    <Link
                      key={cat._id}
                      to={`/news/category/${encodeURIComponent(cat.name)}`}
                      className={`nb-drawer-cat${activeCat === cat.name ? ' active' : ''}`}
                      onClick={() => setShowMobileMenu(false)}
                    >
                      {cat.displayName || cat.name}
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