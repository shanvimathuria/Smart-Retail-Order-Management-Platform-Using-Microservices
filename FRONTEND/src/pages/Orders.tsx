import React, { useState, useEffect } from 'react';
import { FiPackage, FiCalendar, FiCreditCard, FiTruck, FiCheck, FiClock, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/currency';
import { getUserOrders } from '../services/orders';
import { getProductById } from '../services/products';
import './Orders.css';

interface OrderItemWithDetails {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface OrderWithDetails {
  id: number;
  user_id: number;
  total_amount: number;
  status: string;
  created_at: string;
  items: OrderItemWithDetails[];
  paymentMethod: 'COD' | 'UPI' | 'Unknown';
}

const toPaymentMethod = (value: unknown): 'COD' | 'UPI' | 'Unknown' => {
  if (typeof value !== 'string') {
    return 'Unknown';
  }

  const normalized = value.trim().toUpperCase();
  if (normalized === 'COD' || normalized === 'UPI') {
    return normalized;
  }

  return 'Unknown';
};

const Orders: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);

  // Load user's orders from API
  useEffect(() => {
    const loadUserOrders = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userOrders = await getUserOrders();
        
        // Transform API response to include product details
        const ordersWithDetails = await Promise.all(
          userOrders.map(async (order) => {
            const itemsWithDetails = await Promise.all(
              order.items.map(async (item) => {
                try {
                  const product = await getProductById(item.product_id.toString());
                  return {
                    id: item.product_id.toString(),
                    name: product?.name || `Product ${item.product_id}`,
                    price: item.price || 0,
                    quantity: item.quantity,
                    image: product?.imageUrl || '/api/placeholder/60/60'
                  };
                } catch {
                  return {
                    id: item.product_id.toString(),
                    name: `Product ${item.product_id}`,
                    price: item.price || 0,
                    quantity: item.quantity,
                    image: '/api/placeholder/60/60'
                  };
                }
              })
            );
            
            return {
              ...order,
              items: itemsWithDetails,
              paymentMethod: toPaymentMethod(order.payment_method)
            };
          })
        );
        
        setOrders(ordersWithDetails);
      } catch (error) {
        console.error('Failed to load orders:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserOrders();
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <FiClock className="status-icon pending" />;
      case 'processing':
        return <FiPackage className="status-icon processing" />;
      case 'shipped':
        return <FiTruck className="status-icon shipped" />;
      case 'delivered':
        return <FiCheck className="status-icon delivered" />;
      case 'cancelled':
        return <FiX className="status-icon cancelled" />;
      default:
        return <FiClock className="status-icon" />;
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="orders-page">
        <div className="container">
          <div className="orders-loading">
            <div className="loading-spinner"></div>
            <p>Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="container">
        <div className="orders-header">
          <h1>My Orders</h1>
          <p>Track and manage your order history</p>
        </div>

        {orders.length === 0 ? (
          <div className="orders-empty">
            <FiPackage className="empty-icon" />
            <h2>No orders yet</h2>
            <p>When you place an order, it will appear here.</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>Order {order.id}</h3>
                    <div className="order-meta">
                      <span className="order-date">
                        <FiCalendar /> {formatDate(order.created_at)}
                      </span>
                      <span className="order-total">
                        <FiCreditCard /> {formatCurrency(order.total_amount)}
                      </span>
                    </div>
                  </div>
                  <div className="order-status">
                    {getStatusIcon(order.status)}
                    <span className={`status-text ${order.status}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>

                <div className="order-items">
                  {order.items.map(item => (
                    <div key={item.id} className="order-item">
                      <div className="item-image">
                        {item.image ? (
                          <img src={item.image} alt={item.name} />
                        ) : (
                          <div className="item-placeholder">
                            <FiPackage />
                          </div>
                        )}
                      </div>
                      <div className="item-details">
                        <h4>{item.name}</h4>
                        <p>Quantity: {item.quantity}</p>
                        <p className="item-price">{formatCurrency(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <div className="order-details">
                    <p><strong>Payment:</strong> {order.paymentMethod}</p>
                    <p><strong>Status:</strong> {getStatusText(order.status)}</p>
                  </div>
                  <button 
                    className="view-details-btn"
                    onClick={() => setSelectedOrder(order)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="order-modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="order-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details - {selectedOrder.id}</h2>
              <button 
                className="modal-close"
                onClick={() => setSelectedOrder(null)}
              >
                <FiX />
              </button>
            </div>
            <div className="modal-content">
              <div className="modal-section">
                <h3>Order Information</h3>
                <div className="info-grid">
                  <div>
                    <strong>Order Date:</strong> {formatDate(selectedOrder.created_at)}
                  </div>
                  <div>
                    <strong>Status:</strong> 
                    <span className={`status-badge ${selectedOrder.status.toLowerCase()}`}>
                      {getStatusText(selectedOrder.status)}
                    </span>
                  </div>
                  <div>
                    <strong>Total:</strong> {formatCurrency(selectedOrder.total_amount)}
                  </div>
                  <div>
                    <strong>Payment:</strong> {selectedOrder.paymentMethod}
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h3>Items Ordered</h3>
                <div className="modal-items">
                  {selectedOrder.items.map(item => (
                    <div key={item.id} className="modal-item">
                      <div className="modal-item-image">
                        {item.image ? (
                          <img src={item.image} alt={item.name} />
                        ) : (
                          <div className="modal-item-placeholder">
                            <FiPackage />
                          </div>
                        )}
                      </div>
                      <div className="modal-item-info">
                        <h4>{item.name}</h4>
                        <p>Quantity: {item.quantity}</p>
                        <p className="modal-item-price">{formatCurrency(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;