import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FiShoppingCart, 
  FiTruck, 
  FiCreditCard, 
  FiShield, 
  FiStar, 
  FiUsers,
  FiArrowRight 
} from 'react-icons/fi';
import { useCategories } from '../../hooks/useCategories';
import { useProducts } from '../../hooks/useProducts';
import ProductCard from '../Products/ProductCard';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { categories, isLoading: isCategoriesLoading, error: categoriesError } = useCategories();
  const { products, isLoading: isProductsLoading, error: productsError } = useProducts();
  const featuredProducts = products.slice(0, 4);
  const stats = [
    { icon: FiUsers, value: '10K+', label: 'Happy Customers' },
    { icon: FiShoppingCart, value: '50K+', label: 'Orders Delivered' },
    { icon: FiStar, value: '4.8', label: 'Average Rating' },
    { icon: FiShield, value: '99%', label: 'Secure Payments' }
  ];

  const features = [
    {
      icon: FiTruck,
      title: 'Free Shipping',
      description: 'Free shipping on orders over $50'
    },
    {
      icon: FiCreditCard,
      title: 'Secure Payment',
      description: '100% secure payment processing'
    },
    {
      icon: FiShield,
      title: 'Money Back Guarantee',
      description: '30-day return policy'
    },
    {
      icon: FiStar,
      title: 'Quality Products',
      description: 'Curated selection of premium items'
    }
  ];

  return (
    <div className="dashboard">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Welcome to RetailHub</h1>
            <p>Your one-stop destination for quality products at unbeatable prices.</p>
            <div className="hero-buttons">
              <Link to="/products" className="btn-primary">
                Shop Now <FiArrowRight />
              </Link>
              <Link to="/categories" className="btn-secondary">
                Browse Categories
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <stat.icon className="stat-icon" />
                <div className="stat-info">
                  <h3>{stat.value}</h3>
                  <p>{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose RetailHub?</h2>
            <p>We provide the best shopping experience with these amazing features</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  <feature.icon />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <h2>Shop by Category</h2>
            <p>Explore our wide range of product categories</p>
          </div>
          {isCategoriesLoading ? (
            <div className="categories-state">Loading categories...</div>
          ) : categoriesError ? (
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

      {/* Featured Products Section */}
      <section className="featured-products">
        <div className="container">
          <div className="section-header">
            <h2>Featured Products</h2>
            <p>Check out our most popular and trending products</p>
            <Link to="/products" className="view-all">
              View All Products <FiArrowRight />
            </Link>
          </div>
          {isProductsLoading ? (
            <div className="categories-state">Loading products...</div>
          ) : productsError ? (
            <div className="categories-state categories-state-error">Unable to load products right now.</div>
          ) : (
            <div className="products-grid">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter">
        <div className="container">
          <div className="newsletter-content">
            <h3>Stay Updated</h3>
            <p>Subscribe to our newsletter for the latest deals and product updates</p>
            <div className="newsletter-form">
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="newsletter-input"
              />
              <button className="newsletter-button">Subscribe</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;