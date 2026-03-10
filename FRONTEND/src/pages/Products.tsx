import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiGrid, FiList, FiSearch } from 'react-icons/fi';
import { useCategories } from '../hooks/useCategories';
import { useProducts } from '../hooks/useProducts';
import type { Product } from '../types';
import { formatCurrency } from '../utils/currency';
import ProductCard from '../components/Products/ProductCard';
import './Products.css';

type QuickFilterState = {
  inStockOnly: boolean;
  lowStockOnly: boolean;
  highStockOnly: boolean;
};

const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, isLoading: isProductsLoading, error: productsError } = useProducts();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [quickFilters, setQuickFilters] = useState<QuickFilterState>({
    inStockOnly: false,
    lowStockOnly: false,
    highStockOnly: false,
  });
  const { categories, isLoading: isCategoriesLoading, error: categoriesError } = useCategories();
  const categoryOptions = [
    { id: 'all', name: 'All Products' },
    ...categories.map((category) => ({
      id: category.productCategoryKey,
      name: category.name,
    })),
  ];
  const maxAvailablePrice = products.length > 0 ? Math.max(...products.map((product) => product.price)) : 0;
  const effectiveMinPrice = priceRange.min.trim() ? Number(priceRange.min) : 0;
  const effectiveMaxPrice = priceRange.max.trim() ? Number(priceRange.max) : maxAvailablePrice || Number.MAX_SAFE_INTEGER;

  // Initialize from URL parameters
  useEffect(() => {
    const category = searchParams.get('category') || 'all';
    const search = searchParams.get('search') || '';
    
    setSelectedCategory(category);
    setSearchQuery(search);
  }, [searchParams]);

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.productCategoryKey === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const normalizedQuery = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.description.toLowerCase().includes(normalizedQuery) ||
        (product.categoryLabel ?? product.category).toLowerCase().includes(normalizedQuery)
      );
    }

    // Filter by price range
    filtered = filtered.filter(product => 
      product.price >= effectiveMinPrice && product.price <= effectiveMaxPrice
    );

    if (quickFilters.inStockOnly) {
      filtered = filtered.filter(product => product.stock > 0);
    }

    if (quickFilters.lowStockOnly) {
      filtered = filtered.filter(product => product.stock > 0 && product.stock <= 10);
    }

    if (quickFilters.highStockOnly) {
      filtered = filtered.filter(product => product.stock >= 30);
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'newest':
          return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
        case 'stock-high':
          return b.stock - a.stock;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  }, [effectiveMaxPrice, effectiveMinPrice, products, quickFilters, searchQuery, selectedCategory, sortBy]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const params = new URLSearchParams(searchParams);
    if (category === 'all') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    setSearchParams(params);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    const params = new URLSearchParams(searchParams);
    if (query.trim()) {
      params.set('search', query);
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

  return (
    <div className="products-page">
      <div className="products-header">
        <div className="container">
          <div className="header-top">
            <div className="page-title">
              <h1>Products</h1>
              <p>Discover our amazing collection of products</p>
            </div>
            
            <div className="header-actions">
              <div className="search-box">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>

              <div className="view-controls">
                <button
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <FiGrid />
                </button>
                <button
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <FiList />
                </button>
              </div>

              <button 
                className="filter-toggle"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FiFilter />
                Filters
              </button>
            </div>
          </div>

          <div className="results-info">
            <span className="results-count">
              {filteredProducts.length} products found
            </span>
            
            <div className="sort-controls">
              <label htmlFor="sort">Sort by:</label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Name (A-Z)</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest</option>
                <option value="stock-high">Stock: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="products-content">
          {/* Sidebar Filters */}
          <aside className={`filters-sidebar ${showFilters ? 'filters-open' : ''}`}>
            <div className="filters-header">
              <h3>Filters</h3>
              <button 
                className="close-filters"
                onClick={() => setShowFilters(false)}
              >
                ×
              </button>
            </div>

            <div className="filter-section">
              <h4>Categories</h4>
              <div className="category-filters">
                {isCategoriesLoading ? (
                  <p className="filter-status">Loading categories...</p>
                ) : categoriesError ? (
                  <p className="filter-status">Unable to load categories.</p>
                ) : (
                  categoryOptions.map((category) => (
                    <label key={category.id} className="checkbox-label">
                      <input
                        type="radio"
                        name="category"
                        value={category.id}
                        checked={selectedCategory === category.id}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                      />
                      <span>{category.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="filter-section">
              <h4>Price Range</h4>
              <div className="price-filters">
                <div className="price-inputs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({
                      ...priceRange,
                      min: e.target.value
                    })}
                  />
                  <span>to</span>
                  <input
                    type="number"
                    placeholder={maxAvailablePrice ? String(maxAvailablePrice) : 'Max'}
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({
                      ...priceRange,
                      max: e.target.value
                    })}
                  />
                </div>
                <div className="price-presets">
                  <button onClick={() => setPriceRange({ min: '', max: '1000' })}>
                    Under {formatCurrency(1000)}
                  </button>
                  <button onClick={() => setPriceRange({ min: '1000', max: '3000' })}>
                    {formatCurrency(1000)} - {formatCurrency(3000)}
                  </button>
                  <button onClick={() => setPriceRange({ min: '3000', max: '' })}>
                    Over {formatCurrency(3000)}
                  </button>
                </div>
              </div>
            </div>

            <div className="filter-section">
              <h4>Quick Filters</h4>
              <div className="quick-filters">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={quickFilters.inStockOnly}
                    onChange={(e) => setQuickFilters({
                      ...quickFilters,
                      inStockOnly: e.target.checked,
                    })}
                  />
                  <span>In Stock Only</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={quickFilters.lowStockOnly}
                    onChange={(e) => setQuickFilters({
                      ...quickFilters,
                      lowStockOnly: e.target.checked,
                    })}
                  />
                  <span>Low Stock Only</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={quickFilters.highStockOnly}
                    onChange={(e) => setQuickFilters({
                      ...quickFilters,
                      highStockOnly: e.target.checked,
                    })}
                  />
                  <span>High Stock Only</span>
                </label>
              </div>
            </div>

            <button
              className="reset-filters"
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                setSortBy('name');
                setPriceRange({ min: '', max: '' });
                setQuickFilters({
                  inStockOnly: false,
                  lowStockOnly: false,
                  highStockOnly: false,
                });
                setSearchParams({});
              }}
            >
              Reset All Filters
            </button>
          </aside>

          {/* Products Grid */}
          <main className="products-main">
            {isProductsLoading ? (
              <div className="no-products">
                <h3>Loading products...</h3>
                <p>Please wait while we fetch inventory from the backend.</p>
              </div>
            ) : productsError ? (
              <div className="no-products">
                <h3>Unable to load products</h3>
                <p>Please check the backend service and try again.</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className={`products-grid ${viewMode}`}>
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="no-products">
                <h3>No products found</h3>
                <p>Try adjusting your search or filter criteria.</p>
                <button onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                  setSortBy('name');
                  setPriceRange({ min: '', max: '' });
                  setQuickFilters({
                    inStockOnly: false,
                    lowStockOnly: false,
                    highStockOnly: false,
                  });
                  setSearchParams({});
                }}>
                  Clear all filters
                </button>
              </div>
            )}

            {/* Load More Button */}
            {filteredProducts.length >= 12 && (
              <div className="load-more">
                <button className="load-more-btn">
                  Load More Products
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Filter Overlay for Mobile */}
      {showFilters && (
        <div 
          className="filter-overlay"
          onClick={() => setShowFilters(false)}
        />
      )}
    </div>
  );
};

export default Products;