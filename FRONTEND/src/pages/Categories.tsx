import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { useCategories } from '../hooks/useCategories';
import '../components/Dashboard/Dashboard.css';
import './Categories.css';

const Categories: React.FC = () => {
  const { categories, isLoading, error } = useCategories();

  return (
    <div className="categories-page">
      <section className="categories-section categories-page-section">
        <div className="container">
          <div className="section-header">
            <h2>Categories</h2>
            <p>Explore the live categories available from your inventory service</p>
          </div>

          {isLoading ? (
            <div className="categories-state">Loading categories...</div>
          ) : error ? (
            <div className="categories-state categories-state-error">Unable to load categories right now.</div>
          ) : categories.length > 0 ? (
            <div className="categories-grid">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/products?category=${encodeURIComponent(category.productCategoryKey)}`}
                  className="category-card"
                >
                  <div className="category-image">
                    {category.imageUrl ? <img src={category.imageUrl} alt={category.name} /> : null}
                  </div>
                  <div className="category-info">
                    <h3>{category.name}</h3>
                    <FiArrowRight className="category-arrow" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="categories-state">No categories available.</div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Categories;
