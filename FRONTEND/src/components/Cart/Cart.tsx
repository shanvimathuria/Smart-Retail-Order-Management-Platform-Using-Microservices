import React from 'react';
import { Link } from 'react-router-dom';
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiArrowLeft } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/currency';
import './Cart.css';

const Cart: React.FC = () => {
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <div className="empty-cart-content">
          <FiShoppingBag className="empty-cart-icon" />
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any items to your cart yet.</p>
          <div className="empty-cart-actions">
            <Link to="/products" className="continue-shopping">
              <FiArrowLeft />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const shippingCost = getTotalPrice() > 50 ? 0 : 9.99;
  const tax = getTotalPrice() * 0.08; // 8% tax
  const finalTotal = getTotalPrice() + shippingCost + tax;

  return (
    <div className="cart-container">
      <div className="cart-header">
        <Link to="/products" className="back-link">
          <FiArrowLeft />
          Continue Shopping
        </Link>
        <h1>Shopping Cart</h1>
        <p>{items.length} {items.length === 1 ? 'item' : 'items'} in your cart</p>
      </div>

      <div className="cart-content">
        <div className="cart-items">
          <div className="cart-items-header">
            <h2>Cart Items</h2>
            <button onClick={clearCart} className="clear-cart">
              <FiTrash2 />
              Clear Cart
            </button>
          </div>

          <div className="cart-items-list">
            {items.map((item) => (
              <div key={item.product.id} className="cart-item">
                <div className="item-image">
                  {item.product.imageUrl ? (
                    <img src={item.product.imageUrl} alt={item.product.name} />
                  ) : (
                    <div className="item-image-empty" aria-hidden="true" />
                  )}
                </div>

                <div className="item-details">
                  <h3 className="item-name">{item.product.name}</h3>
                  <p className="item-category">
                    {item.product.categoryLabel ?? (item.product.category.charAt(0).toUpperCase() + item.product.category.slice(1))}
                  </p>
                  <p className="item-price">{formatCurrency(item.product.price)}</p>

                  <div className="item-stock">
                    {item.product.stock < 10 && (
                      <span className="low-stock">Only {item.product.stock} left in stock</span>
                    )}
                  </div>
                </div>

                <div className="item-controls">
                  <div className="quantity-controls">
                    <button
                      onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                      className="quantity-btn"
                      disabled={item.quantity <= 1}
                    >
                      <FiMinus />
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                      className="quantity-btn"
                      disabled={item.quantity >= item.product.stock}
                    >
                      <FiPlus />
                    </button>
                  </div>

                  <div className="item-total">
                    {formatCurrency(item.product.price * item.quantity)}
                  </div>

                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="remove-item"
                    title="Remove item"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cart-summary">
          <div className="summary-card">
            <h3>Order Summary</h3>
            
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>{formatCurrency(getTotalPrice())}</span>
            </div>

            <div className="summary-row">
              <span>Shipping:</span>
              <span>
                {shippingCost === 0 ? (
                  <span className="free-shipping">FREE</span>
                ) : (
                  formatCurrency(shippingCost)
                )}
              </span>
            </div>

            <div className="summary-row">
              <span>Tax (8%):</span>
              <span>{formatCurrency(tax)}</span>
            </div>

            {getTotalPrice() < 50 && (
              <div className="shipping-notice">
                Add {formatCurrency(50 - getTotalPrice())} more for free shipping!
              </div>
            )}

            <div className="summary-divider"></div>

            <div className="summary-total">
              <span>Total:</span>
              <span>{formatCurrency(finalTotal)}</span>
            </div>

            <div className="checkout-actions">
              <button className="checkout-btn">
                Proceed to Checkout
              </button>
              
              <div className="payment-methods">
                <p>We accept:</p>
                <div className="payment-icons">
                  <span>💳</span>
                  <span>📱</span>
                  <span>🏦</span>
                </div>
              </div>
            </div>

            <div className="security-badges">
              <div className="security-item">
                🔒 Secure Checkout
              </div>
              <div className="security-item">
                🏆 Money Back Guarantee
              </div>
            </div>
          </div>

          <div className="recommended-products">
            <h4>You might also like</h4>
            <p>Based on items in your cart</p>
            <div className="recommendations">
              <div className="recommendation-item">
                <img src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop" alt="Recommended" />
                <div className="rec-details">
                  <span className="rec-name">Wireless Mouse</span>
                  <span className="rec-price">{formatCurrency(29.99)}</span>
                </div>
                <button className="add-rec">+</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;