
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';

// Components
import Navigation from './components/Navigation/Navigation';
import Dashboard from './components/Dashboard/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Cart from './components/Cart/Cart';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import PublicOnlyRoute from './components/Auth/PublicOnlyRoute';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <Router>
            <div className="app">
              <Navigation />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
                  <Route path="/signup" element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/orders" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  {/* Catch all route - redirect to home */}
                  <Route path="*" element={<Dashboard />} />
                </Routes>
              </main>
            </div>
          </Router>
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
