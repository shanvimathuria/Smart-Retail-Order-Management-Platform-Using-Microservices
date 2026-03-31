
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { AdminProvider } from './context/AdminContext';

// Components
import Navigation from './components/Navigation/Navigation';
import Dashboard from './components/Dashboard/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import Cart from './components/Cart/Cart';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import PublicOnlyRoute from './components/Auth/PublicOnlyRoute';
import AdminLogin from './components/Auth/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminProtectedRoute from './components/Auth/AdminProtectedRoute';

import './App.css';

function App() {
  return (
    <AdminProvider>
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            <Router>
              <div className="app">
                <Navigation />
                <main className="main-content">
                  <Routes>
                    {/* Admin Routes */}
                    <Route path="/admin" element={<AdminLogin />} />
                    <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />

                    {/* Regular User Routes */}
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
                    <Route path="/signup" element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                    {/* Catch all route - redirect to home */}
                    <Route path="*" element={<Dashboard />} />
                  </Routes>
                </main>
              </div>
            </Router>
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </AdminProvider>
  );
}

export default App;
