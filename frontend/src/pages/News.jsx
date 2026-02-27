import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { newsAPI, categoryAPI } from '../services/api';
import ImageSlider from '../components/ImageSlider';
import Navbar from '../components/Navbar';
import PopularNews from '../components/Popularnews';
import Footer from '../components/Footer';
import CategoryFilter from '../components/CategoryFilter';
import '../css/News.css';
import NewsHero from '../components/Newshero';

function News() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const searchFromUrl = queryParams.get('search') || '';

  const [newsList, setNewsList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchFromUrl);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setSearchTerm(searchFromUrl);
    fetchNews(selectedCategory, searchFromUrl);
  }, [selectedCategory, location.search]);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchNews = useCallback(async (category, search) => {
    try {
      setLoading(true);
      const params = {};
      if (category) params.category = category;
      if (search) params.search = search;

      const response = await newsAPI.getAll(params);
      setNewsList(response.data);
    } catch (err) {
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div>
      <Navbar />
      <NewsHero />

      <div className="news-page-container">
        <div className="news-header">
          <h2 className="news-page-title">
            {searchTerm ? `ผลการค้นหา: "${searchTerm}"` : 'ข่าวสารทั้งหมด'}
          </h2>
          {searchTerm && (
            <button
              className="clear-search-btn"
              onClick={() => {
                setSearchTerm('');
                navigate('/news');
              }}
            >
              ล้างการค้นหา
            </button>
          )}
        </div>

        <CategoryFilter
          categories={categories.map(c => c.name)}
          selectedCategory={categories.find(c => c._id === selectedCategory)?.name || ''}
          onSelectCategory={(catName) => {
            const cat = categories.find(c => c.name === catName);
            setSelectedCategory(cat ? cat._id : '');
          }}
        />

        {loading ? (
          <div className="loading-state">กำลังโหลดข่าวสาร...</div>
        ) : (
          <div className="filtered-news-grid">
            {newsList.length > 0 ? (
              newsList.map((news) => (
                <Link to={`/news/${news._id}`} key={news._id} className="news-card">
                  <div className="news-card-image">
                    <img src={news.image} alt={news.title} />
                    <span className="news-card-category">{news.category?.name}</span>
                  </div>
                  <div className="news-card-content">
                    <h3 className="news-card-title">{news.title}</h3>
                    <div className="news-card-meta">
                      <span>{new Date(news.createdAt).toLocaleDateString('th-TH')}</span>
                      <span>{news.views} ครั้ง</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="no-news-container">
                <p className="no-news">ไม่พบข่าวที่คุณต้องการ</p>
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setSearchTerm('');
                    navigate('/news');
                  }}
                  className="reset-btn"
                >
                  ดูข่าวทั้งหมด
                </button>
              </div>
            )}
          </div>
        )}

        <div className="popular-news-section-wrapper">
          <PopularNews />
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default News;