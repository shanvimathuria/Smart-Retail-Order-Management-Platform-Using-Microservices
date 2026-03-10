import React, { useState } from 'react';
import { FiX, FiCreditCard, FiTruck, FiCheck } from 'react-icons/fi';
import { formatCurrency } from '../../utils/currency';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { placeOrder } from '../../services/orders';
import type { CartItem } from '../../types';
import './CheckoutModal.css';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  totalAmount: number;
  onOrderComplete: () => void;
}

type PaymentMethod = 'COD' | 'UPI';

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  totalAmount,
  onOrderComplete
}) => {
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  });
  const { user } = useAuth();
  const { showToast } = useToast();

  const handleAddressChange = (field: string, value: string) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isFormValid = () => {
    return selectedPayment;
  };

  const handlePlaceOrder = async () => {
    if (!isFormValid()) {
      showToast('Please select a payment method');
      return;
    }

    if (!user?.id) {
      showToast('Please login to place an order');
      return;
    }

    // Check if user has valid authentication token
    const token = localStorage.getItem('auth_token');
    if (!token) {
      showToast('Session expired. Please login again');
      return;
    }

    setIsProcessing(true);

    try {
      // Create order object for API
      const orderData = {
        items: cartItems.map(item => ({
          product_id: parseInt(item.product.id),
          quantity: item.quantity,
          price: item.product.price
        })),
        payment_method: selectedPayment as 'COD' | 'UPI'
      };

      if (selectedPayment === 'COD') {
        // For COD, place order immediately
        const orderResponse = await placeOrder(orderData);
        showToast(`Order #${orderResponse.id} placed successfully with Cash on Delivery!`);
        onOrderComplete();
        onClose();
      } else if (selectedPayment === 'UPI') {
        // For UPI, place order and simulate payment
        const orderResponse = await placeOrder(orderData);
        showToast(`Order #${orderResponse.id} placed! UPI payment processing...`);
        
        // Simulate UPI payment processing
        setTimeout(() => {
          showToast(`UPI payment successful for Order #${orderResponse.id}!`);
        }, 2000);
        
        onOrderComplete();
        onClose();
      }
      
    } catch (error) {
      console.error('Order placement failed:', error);
      let errorMessage = 'Failed to place order. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Authentication') || error.message.includes('login')) {
          errorMessage = 'Please login again to place your order.';
        } else {
          errorMessage = error.message;
        }
      }
      
      showToast(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="checkout-modal-overlay" onClick={onClose}>
      <div className="checkout-modal" onClick={e => e.stopPropagation()}>
        <div className="checkout-modal-header">
          <h2>Complete Your Order</h2>
          <button onClick={onClose} className="close-modal">
            <FiX />
          </button>
        </div>

        <div className="checkout-modal-content">
          {/* Shipping Address */}
          <div className="checkout-section">
            <h3>Delivery Address (Optional)</h3>
            <p className="section-description">Provide delivery address for accurate shipping</p>
            <div className="address-form">
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={shippingAddress.fullName}
                  onChange={(e) => handleAddressChange('fullName', e.target.value)}
                />
              </div>
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Address"
                  value={shippingAddress.address}
                  onChange={(e) => handleAddressChange('address', e.target.value)}
                />
              </div>
              <div className="form-row">
                <input
                  type="text"
                  placeholder="City"
                  value={shippingAddress.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="State"
                  value={shippingAddress.state}
                  onChange={(e) => handleAddressChange('state', e.target.value)}
                />
              </div>
              <div className="form-row">
                <input
                  type="text"
                  placeholder="PIN Code"
                  value={shippingAddress.pincode}
                  onChange={(e) => handleAddressChange('pincode', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={shippingAddress.phone}
                  onChange={(e) => handleAddressChange('phone', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="checkout-section">
            <h3>Payment Method</h3>
            <div className="payment-methods">
              <div 
                className={`payment-option ${selectedPayment === 'COD' ? 'selected' : ''}`}
                onClick={() => setSelectedPayment('COD')}
              >
                <div className="payment-option-content">
                  <FiTruck className="payment-icon" />
                  <div>
                    <h4>Cash on Delivery</h4>
                    <p>Pay when you receive your order</p>
                  </div>
                </div>
                {selectedPayment === 'COD' && <FiCheck className="selected-check" />}
              </div>

              <div 
                className={`payment-option ${selectedPayment === 'UPI' ? 'selected' : ''}`}
                onClick={() => setSelectedPayment('UPI')}
              >
                <div className="payment-option-content">
                  <FiCreditCard className="payment-icon" />
                  <div>
                    <h4>UPI Payment</h4>
                    <p>Pay instantly using UPI</p>
                  </div>
                </div>
                {selectedPayment === 'UPI' && <FiCheck className="selected-check" />}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="checkout-section">
            <h3>Order Summary</h3>
            <div className="checkout-summary">
              <div className="summary-items">
                {cartItems.slice(0, 3).map((item) => (
                  <div key={item.product.id} className="summary-item">
                    <span>{item.product.name} × {item.quantity}</span>
                    <span>{formatCurrency(item.product.price * item.quantity)}</span>
                  </div>
                ))}
                {cartItems.length > 3 && (
                  <div className="summary-item">
                    <span>+{cartItems.length - 3} more items</span>
                  </div>
                )}
              </div>
              <div className="summary-total">
                <strong>Total: {formatCurrency(totalAmount)}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="checkout-modal-footer">
          <button onClick={onClose} className="cancel-btn">
            Cancel
          </button>
          <button 
            onClick={handlePlaceOrder} 
            className="place-order-btn"
            disabled={!isFormValid() || isProcessing}
          >
            {isProcessing ? 'Processing...' : `Place Order - ${formatCurrency(totalAmount)}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;