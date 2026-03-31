import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { fetchCategoriesAdmin, addCategory, deleteCategory, fetchProductsAdmin, addProduct, deleteProduct } from '../services/adminInventory';
import type { StoreCategory, Product } from '../types';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { adminUser, adminLogout } = useAdmin();
  const [activeSection, setActiveSection] = useState<'inventory' | 'orders'>('inventory');

  const handleLogout = () => {
    adminLogout();
    navigate('/admin');
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-content">
          <h1>Admin Dashboard</h1>
          <div className="admin-user-info">
            <span>Welcome, {adminUser?.name}!</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <div className="admin-container">
        <aside className="admin-sidebar">
          <nav className="admin-nav">
            <button
              className={`nav-item ${activeSection === 'inventory' ? 'active' : ''}`}
              onClick={() => setActiveSection('inventory')}
            >
              📦 Inventory Management
            </button>
            <button
              className={`nav-item ${activeSection === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveSection('orders')}
            >
              📋 Orders Management
            </button>
          </nav>
        </aside>

        <main className="admin-content">
          {activeSection === 'inventory' && (
            <InventoryManagement />
          )}
          {activeSection === 'orders' && (
            <OrdersManagement />
          )}
        </main>
      </div>
    </div>
  );
};

const InventoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [items, setItems] = useState<Product[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    stock: ''
  });
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      const fetchedCategories = await fetchCategoriesAdmin();
      setCategories(fetchedCategories);
      setErrorMessage('');
      
      // Auto-select first category if available
      if (fetchedCategories.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(String(fetchedCategories[0].id));
      }
    } catch (error) {
      setErrorMessage(`Error loading categories: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoadingCategories(false);
    }
  }, [selectedCategoryId]);

  // Fetch categories on mount
  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  // Fetch items when category is selected
  useEffect(() => {
    if (selectedCategoryId) {
      void loadItemsForCategory(selectedCategoryId);
    }
  }, [selectedCategoryId]);

  const loadItemsForCategory = async (categoryId: string) => {
    try {
      setLoadingItems(true);
      const fetchedItems = await fetchProductsAdmin();
      // Filter items by selected category
      const categoryItems = fetchedItems.filter(item => String(item.categoryId) === categoryId);
      setItems(categoryItems);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(`Error loading items: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      setErrorMessage('');
      await addCategory(newCategory);
      setNewCategory('');
      setShowCategoryForm(false);
      setSuccessMessage(`Category "${newCategory}" added successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      await loadCategories();
    } catch (error) {
      setErrorMessage(`Failed to add category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price || !newItem.stock || !selectedCategoryId) return;

    try {
      setErrorMessage('');
      await addProduct(
        newItem.name,
        selectedCategoryId,
        parseFloat(newItem.price),
        parseInt(newItem.stock)
      );
      setNewItem({ name: '', price: '', stock: '' });
      setShowItemForm(false);
      setSuccessMessage(`Product "${newItem.name}" added successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      await loadItemsForCategory(selectedCategoryId);
    } catch (error) {
      setErrorMessage(`Failed to add product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteItem = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      setErrorMessage('');
      await deleteProduct(id);
      setSuccessMessage(`Product deleted successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      if (selectedCategoryId) {
        await loadItemsForCategory(selectedCategoryId);
      }
    } catch (error) {
      setErrorMessage(`Failed to delete product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" and all its items?`)) return;

    try {
      setErrorMessage('');
      await deleteCategory(id);
      setSuccessMessage(`Category deleted successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      await loadCategories();
      setSelectedCategoryId(null);
      setItems([]);
    } catch (error) {
      setErrorMessage(`Failed to delete category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const selectedCategory = categories.find(c => String(c.id) === selectedCategoryId);

  return (
    <div className="inventory-section">
      <h2>Inventory Management</h2>

      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="inventory-layout">
        {/* Categories Sidebar */}
        <aside className="categories-sidebar">
          <div className="categories-header">
            <h3>Categories</h3>
            <button
              className="toggle-btn"
              onClick={() => setShowCategoryForm(!showCategoryForm)}
              title="Add new category"
            >
              {showCategoryForm ? '✖' : '+'}
            </button>
          </div>

          {showCategoryForm && (
            <form onSubmit={handleAddCategory} className="category-form">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Category name"
                required
                autoFocus
              />
              <button type="submit" className="add-btn">Add</button>
            </form>
          )}

          <div className="categories-list">
            {loadingCategories ? (
              <p className="loading-text">Loading categories...</p>
            ) : categories.length === 0 ? (
              <p className="empty-text">No categories found</p>
            ) : (
              categories.map(cat => (
                <div key={cat.id} className="category-item-container">
                  <button
                    className={`category-item ${String(cat.id) === selectedCategoryId ? 'active' : ''}`}
                    onClick={() => setSelectedCategoryId(String(cat.id))}
                  >
                    <span className="category-name">{cat.name}</span>
                    <span className="category-count">{items.filter(i => i.categoryId === cat.id).length}</span>
                  </button>
                  <button
                    className="delete-icon-btn"
                    onClick={() => handleDeleteCategory(String(cat.id), cat.name)}
                    title="Delete category"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Items Main Content */}
        <main className="items-main">
          {selectedCategory ? (
            <>
              <div className="category-header">
                <h3>{selectedCategory.name}</h3>
                <p className="category-description">
                  {selectedCategory.description || 'No description'}
                </p>
                <button
                  className="toggle-btn"
                  onClick={() => setShowItemForm(!showItemForm)}
                >
                  {showItemForm ? '✖ Cancel' : '+ Add Item to this Category'}
                </button>
              </div>

              {showItemForm && (
                <form onSubmit={handleAddItem} className="item-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Product Name *</label>
                      <input
                        type="text"
                        value={newItem.name}
                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                        placeholder="e.g., Laptop"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Price ($) *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newItem.price}
                        onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                        placeholder="e.g., 999.99"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Stock Quantity *</label>
                      <input
                        type="number"
                        value={newItem.stock}
                        onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })}
                        placeholder="e.g., 10"
                        required
                      />
                    </div>
                    <button type="submit" className="add-btn submit-btn">Add Item</button>
                  </div>
                </form>
              )}

              <div className="items-container">
                <h4>Items in {selectedCategory.name}</h4>
                {loadingItems ? (
                  <p className="loading-text">Loading items...</p>
                ) : items.length === 0 ? (
                  <p className="empty-text">No items in this category</p>
                ) : (
                  <div className="items-grid">
                    {items.map(item => (
                      <div key={item.id} className="product-card">
                        <div className="product-header">
                          <h5>{item.name}</h5>
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteItem(item.id, item.name)}
                            title="Delete item"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="product-details">
                          <div className="detail-row">
                            <span className="label">Price:</span>
                            <span className="value">${item.price.toFixed(2)}</span>
                          </div>
                          <div className="detail-row">
                            <span className="label">Stock:</span>
                            <span className={`value ${item.stock < 10 ? 'low-stock' : ''}`}>
                              {item.stock} units
                            </span>
                          </div>
                          {item.description && (
                            <div className="detail-row">
                              <span className="label">Description:</span>
                              <span className="value">{item.description}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="no-category-selected">
              <p>Please select a category from the left to view and manage items</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const OrdersManagement: React.FC = () => {
  const [orders] = useState<Array<{
    id: string;
    orderNumber: string;
    customer: string;
    status: string;
    total: number;
    date: string;
    items: Array<{ name: string; qty: number; price: number }>;
  }>>([]);

  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const statusColors: { [key: string]: string } = {
    pending: '#ff9800',
    processing: '#2196f3',
    completed: '#4caf50',
    cancelled: '#f44336'
  };

  return (
    <div className="orders-section">
      <h2>Orders Management</h2>

      {orders.length === 0 ? (
        <div className="empty-state">
          <p className="empty-text">No orders available yet</p>
          <p className="empty-subtitle">Orders will appear here when customers place them</p>
        </div>
      ) : (
        <>
          <div className="orders-grid">
            {orders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div>
                    <h4>{order.orderNumber}</h4>
                    <p className="customer-name">{order.customer}</p>
                  </div>
                  <div
                    className="status-badge"
                    style={{ backgroundColor: statusColors[order.status] }}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </div>
                </div>

                <div className="order-details">
                  <p><strong>Date:</strong> {order.date}</p>
                  <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
                </div>

                <button
                  className="expand-btn"
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                >
                  {expandedOrder === order.id ? '▼ Hide Items' : '▶ Show Items'}
                </button>

                {expandedOrder === order.id && (
                  <div className="order-items">
                    <h5>Items:</h5>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="order-item">
                        <span>{item.name}</span>
                        <span>x{item.qty} @ ${item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="orders-summary">
            <h3>Summary</h3>
            <div className="summary-stats">
              <div className="stat">
                <strong>Total Orders:</strong> {orders.length}
              </div>
              <div className="stat">
                <strong>Pending:</strong> {orders.filter(o => o.status === 'pending').length}
              </div>
              <div className="stat">
                <strong>Processing:</strong> {orders.filter(o => o.status === 'processing').length}
              </div>
              <div className="stat">
                <strong>Completed:</strong> {orders.filter(o => o.status === 'completed').length}
              </div>
              <div className="stat">
                <strong>Total Revenue:</strong> ${orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
