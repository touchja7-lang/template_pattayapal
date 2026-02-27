import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { newsAPI, categoryAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CategoryFilter from '../components/CategoryFilter';
import NewsHero from '../components/Newshero';
import '../css/News.css';

function News() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const searchFromUrl = queryParams.get('search') || '';

  const [newsList, setNewsList]           = useState([]);
  const [categories, setCategories]       = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading]             = useState(true);
  const [searchTerm, setSearchTerm]       = useState(searchFromUrl);

  useEffect(() => {
    categoryAPI.getAll()
      .then(res => setCategories(res.data))
      .catch(err => console.error('Error fetching categories:', err));
  }, []);

  useEffect(() => {
    setSearchTerm(searchFromUrl);
    fetchNews(selectedCategory, searchFromUrl);
  }, [selectedCategory, location.search]);

  const fetchNews = useCallback(async (category, search) => {
    try {
      setLoading(true);
      const params = {};
      if (category) params.category = category;
      if (search)   params.search   = search;
      const response = await newsAPI.getAll(params);
      setNewsList(response.data);
    } catch (err) {
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleClearSearch = () => {
    setSearchTerm('');
    navigate('/news');
  };

  return (
    <div>
      <Navbar />
      <NewsHero />

      <div className="news-page-container">

        {/* ── search result banner ── */}
        {searchTerm && (
          <div className="news-search-banner">
            <span>ผลการค้นหา: <strong>"{searchTerm}"</strong></span>
            <button className="news-clear-btn" onClick={handleClearSearch}>
              ✕ ล้างการค้นหา
            </button>
          </div>
        )}

        {/* ── CategoryFilter รับ news prop แสดง grid + pills ── */}
        {loading ? (
          <div className="news-loading">
            <div className="news-loading-spinner" />
            <span>กำลังโหลดข่าวสาร...</span>
          </div>
        ) : (
          <CategoryFilter
            categories={categories.map(c => c.name)}
            selectedCategory={
              categories.find(c => c._id === selectedCategory)?.name || ''
            }
            onSelectCategory={(catName) => {
              const cat = categories.find(c => c.name === catName);
              setSelectedCategory(cat ? cat._id : '');
            }}
            news={newsList}
          />
        )}

      </div>

      <Footer />
    </div>
  );
}

export default News;