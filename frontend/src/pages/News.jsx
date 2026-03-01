import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { newsAPI, categoryAPI } from '../services/api';
import { useLanguage } from '../context/Languagecontext';
import { useTranslatedNews } from '../hooks/useTranslatedNews';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CategoryFilter from '../components/CategoryFilter';
import NewsHero from '../components/Newshero';
import '../css/News.css';
import PopularSection from '../components/Popularcard';

function News() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { t }     = useLanguage();

  const queryParams   = new URLSearchParams(location.search);
  const searchFromUrl = queryParams.get('search') || '';

  const [newsList, setNewsList]                   = useState([]);
  const [categories, setCategories]               = useState([]);
  const [selectedCategory, setSelectedCategory]   = useState('');
  const [loading, setLoading]                     = useState(true);
  const [searchTerm, setSearchTerm]               = useState(searchFromUrl);

  // ── แปลภาษา real-time ──────────────────────────────────────────────────────
  const { data: displayNews, translating } = useTranslatedNews(newsList);

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

        {/* ── translating banner ── */}
        {translating && (
          <div className="news-translating-bar">
            <span className="news-translating-spinner" />
            {t('translating')}
          </div>
        )}

        {/* ── search result banner ── */}
        {searchTerm && (
          <div className="news-search-banner">
            <span>{t('news_search_result')} <strong>"{searchTerm}"</strong></span>
            <button className="news-clear-btn" onClick={handleClearSearch}>
              {t('news_clear_search')}
            </button>
          </div>
        )}

        {/* ── CategoryFilter ── */}
        {loading ? (
          <div className="news-loading">
            <div className="news-loading-spinner" />
            <span>{t('nd_loading')}</span>
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
            news={displayNews}  {/* ← ส่ง displayNews แทน newsList */}
          />
        )}

      </div>

      <PopularSection news={displayNews} />  {/* ← ส่ง displayNews แทน newsList */}

      <Footer />
    </div>
  );
}

export default News;