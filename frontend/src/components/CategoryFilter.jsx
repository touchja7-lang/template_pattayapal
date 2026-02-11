import React from 'react';
import './CategoryFilter.css';

function CategoryFilter({ categories, selectedCategory, onSelectCategory }) {
  return (
    <div className="category-filter">
      <button
        className={`category-btn ${selectedCategory === '' ? 'active' : ''}`}
        onClick={() => onSelectCategory('')}
      >
        ทั้งหมด
      </button>
      {categories.map((category) => (
        <button
          key={category}
          className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
          onClick={() => onSelectCategory(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}

export default CategoryFilter;
