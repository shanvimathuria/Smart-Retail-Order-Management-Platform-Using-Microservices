import React, { useState } from 'react';
import { FiStar, FiShoppingCart, FiEye, FiX } from 'react-icons/fi';
import type { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/currency';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleAddToCart = () => {
    if (product.stock === 0) {
      return;
    }

    addItem(product);
    showToast(`${product.name} added to cart`);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FiStar key={i} className="star filled" />);
    }

    if (hasHalfStar) {
      stars.push(<FiStar key="half" className="star half" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FiStar key={`empty-${i}`} className="star" />);
    }

    return stars;
  };

  return (
    <>
      <div className="product-card">
        <div className="product-image">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} />
          ) : (
            <div className="product-image-empty" aria-hidden="true" />
          )}
          <div className="product-overlay">
            <button type="button" className="overlay-button" onClick={() => setIsDetailsOpen(true)}>
              <FiEye />
            </button>
            <button type="button" className="overlay-button" onClick={handleAddToCart}>
              <FiShoppingCart />
            </button>
          </div>
          {product.stock < 10 && product.stock > 0 && (
            <div className="stock-badge low-stock">
              Only {product.stock} left
            </div>
          )}
          {product.stock === 0 && (
            <div className="stock-badge out-of-stock">
              Out of Stock
            </div>
          )}
        </div>

        <div className="product-info">
          <div className="product-category">
            {product.categoryLabel ?? (product.category.charAt(0).toUpperCase() + product.category.slice(1))}
          </div>
          <h3 className="product-name">{product.name}</h3>
          <p className="product-description">{product.description}</p>

          {typeof product.rating === 'number' && typeof product.reviews === 'number' ? (
            <div className="product-rating">
              <div className="stars">
                {renderStars(product.rating)}
              </div>
              <span className="rating-text">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>
          ) : null}

          <div className="product-footer">
            <div className="product-price">
              {formatCurrency(product.price)}
            </div>
            <button 
              type="button"
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <FiShoppingCart />
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      {isDetailsOpen && (
        <div className="product-modal-backdrop" onClick={() => setIsDetailsOpen(false)}>
          <div className="product-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={product.name}>
            <button type="button" className="product-modal-close" onClick={() => setIsDetailsOpen(false)}>
              <FiX />
            </button>

            <div className="product-modal-media">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} />
              ) : (
                <div className="product-image-empty" aria-hidden="true" />
              )}
            </div>

            <div className="product-modal-content">
              <div className="product-category">
                {product.categoryLabel ?? (product.category.charAt(0).toUpperCase() + product.category.slice(1))}
              </div>
              <h3 className="product-modal-title">{product.name}</h3>
              <p className="product-modal-description">{product.description}</p>

              <div className="product-modal-meta">
                <div>
                  <span className="product-modal-label">Price</span>
                  <strong>{formatCurrency(product.price)}</strong>
                </div>
                <div>
                  <span className="product-modal-label">Stock</span>
                  <strong>{product.stock > 0 ? `${product.stock} available` : 'Out of stock'}</strong>
                </div>
              </div>

              {typeof product.rating === 'number' && typeof product.reviews === 'number' ? (
                <div className="product-rating product-modal-rating">
                  <div className="stars">
                    {renderStars(product.rating)}
                  </div>
                  <span className="rating-text">
                    {product.rating} ({product.reviews} reviews)
                  </span>
                </div>
              ) : null}

              <div className="product-modal-actions">
                <button
                  type="button"
                  className="add-to-cart-btn"
                  onClick={() => {
                    handleAddToCart();
                    setIsDetailsOpen(false);
                  }}
                  disabled={product.stock === 0}
                >
                  <FiShoppingCart />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;