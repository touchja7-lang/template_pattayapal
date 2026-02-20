import React, { useState, useEffect } from 'react';
import './Popularnews.css';
import { HiOutlineClock, HiOutlineEye, HiOutlineChevronRight } from "react-icons/hi";
import { Link } from 'react-router-dom';
import { newsAPI, categoryAPI } from '../services/api';

const CATEGORY_COLORS = ['#ff4d4d', '#00a859', '#004a7c', '#a16eff', '#ff8c00', '#00bcd4', '#e91e63', '#795548'];

const PopularNews = () => {
  const [popularNews, setPopularNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newsCounts, setNewsCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [newsRes, catRes] = await Promise.all([
          newsAPI.getAll(),
          categoryAPI.getAll()
        ]);

        // เรียงข่าวตาม views มากสุด แล้วเอา 5 อันดับแรก
        const sorted = [...newsRes.data]
          .sort((a, b) => (b.views || 0) - (a.views || 0))
          .slice(0, 5);
        setPopularNews(sorted);

        // นับจำนวนข่าวแต่ละหมวดหมู่
        const counts = {};
        newsRes.data.forEach(news => {
          const catId = news.category?._id || news.category;
          if (catId) counts[catId] = (counts[catId] || 0) + 1;
        });
        setNewsCounts(counts);
        setCategories(catRes.data);
      } catch (err) {
        console.error('Error fetching popular news:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="popular-loading">กำลังโหลด...</div>;

  return (
    <div className="popular-container">
      {/* ฝั่งซ้าย: ยอดนิยม */}
      <div className="popular-list-section">
        <h2 className="section-title">📊 ยอดนิยม</h2>
        <div className="list-wrapper">
          {popularNews.length > 0 ? popularNews.map((news, index) => (
            <Link key={news._id} to={`/news/${news._id}`} className="popular-item-link">
              <div className="popular-item-card">
                <div className="rank-number">{index + 1}</div>
                <div className="item-content">
                  <h3 className="item-title">{news.title}</h3>
                  <div className="item-meta">
                    <span className="cat">{news.category?.name || 'ทั่วไป'}</span>
                    <span><HiOutlineClock /> {new Date(news.createdAt).toLocaleDateString('th-TH')}</span>
                    <span><HiOutlineEye /> {news.views || 0} ครั้ง</span>
                  </div>
                </div>
              </div>
            </Link>
          )) : (
            <p className="popular-empty">ยังไม่มีข่าว</p>
          )}
        </div>
      </div>

      {/* ฝั่งขวา: หมวดหมู่ */}
      <div className="category-section">
        <h2 className="section-title">หมวดหมู่</h2>
        <div className="category-wrapper">
          {categories.map((cat, index) => (
            <Link
              key={cat._id}
              to={`/news/category/${encodeURIComponent(cat.name)}`}
              className="category-link-wrapper"
            >
              <div className="category-item-card">
                <div className="cat-indicator" style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}></div>
                <div className="cat-info">
                  <span className="cat-name">{cat.name}</span>
                  <span className="cat-count">{newsCounts[cat._id] || 0} ข่าว</span>
                </div>
                <HiOutlineChevronRight className="arrow-icon" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PopularNews;