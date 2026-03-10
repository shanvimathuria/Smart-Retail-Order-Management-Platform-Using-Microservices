import type { Product } from '../types';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Wireless Bluetooth Headphones',
    description: 'Premium quality wireless headphones with noise cancellation and 30-hour battery life.',
    price: 199.99,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
    category: 'electronics',
    stock: 15,
    rating: 4.5,
    reviews: 128
  },
  {
    id: '2',
    name: 'Smart Fitness Tracker',
    description: 'Track your daily activities, heart rate, and sleep patterns with this advanced fitness tracker.',
    price: 89.99,
    imageUrl: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400&h=400&fit=crop',
    category: 'electronics',
    stock: 23,
    rating: 4.2,
    reviews: 89
  },
  {
    id: '3',
    name: 'Casual Cotton T-Shirt',
    description: 'Comfortable and stylish cotton t-shirt perfect for everyday wear.',
    price: 24.99,
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
    category: 'clothing',
    stock: 50,
    rating: 4.0,
    reviews: 45
  },
  {
    id: '4',
    name: 'Modern LED Desk Lamp',
    description: 'Adjustable LED desk lamp with USB charging port and touch controls.',
    price: 79.99,
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    category: 'home',
    stock: 12,
    rating: 4.7,
    reviews: 67
  },
  {
    id: '5',
    name: 'Professional Camera Lens',
    description: '85mm f/1.8 portrait lens for professional photography.',
    price: 599.99,
    imageUrl: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=400&fit=crop',
    category: 'electronics',
    stock: 8,
    rating: 4.8,
    reviews: 156
  },
  {
    id: '6',
    name: 'Yoga Exercise Mat',
    description: 'Non-slip yoga mat made from eco-friendly materials.',
    price: 39.99,
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop',
    category: 'sports',
    stock: 35,
    rating: 4.3,
    reviews: 92
  },
  {
    id: '7',
    name: 'Leather Wallet',
    description: 'Genuine leather wallet with RFID blocking technology.',
    price: 49.99,
    imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=400&fit=crop',
    category: 'accessories',
    stock: 18,
    rating: 4.4,
    reviews: 73
  },
  {
    id: '8',
    name: 'Organic Skincare Set',
    description: 'Complete organic skincare routine with cleanser, toner, and moisturizer.',
    price: 129.99,
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
    category: 'beauty',
    stock: 22,
    rating: 4.6,
    reviews: 114
  },
  {
    id: '9',
    name: 'Running Shoes',
    description: 'Lightweight running shoes with superior cushioning and breathability.',
    price: 119.99,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    category: 'sports',
    stock: 28,
    rating: 4.1,
    reviews: 201
  },
  {
    id: '10',
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with thermal carafe and auto-brew feature.',
    price: 179.99,
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop',
    category: 'home',
    stock: 14,
    rating: 4.5,
    reviews: 87
  }
];

export const categories = [
  { id: 'all', name: 'All Products' },
  { id: 'electronics', name: 'Electronics' },
  { id: 'clothing', name: 'Clothing' },
  { id: 'home', name: 'Home & Garden' },
  { id: 'sports', name: 'Sports & Fitness' },
  { id: 'beauty', name: 'Beauty & Health' },
  { id: 'accessories', name: 'Accessories' },
  { id: 'automotive', name: 'Automotive' },
  { id: 'books', name: 'Books' }
];

export const getProductsByCategory = (category: string): Product[] => {
  if (category === 'all') return mockProducts;
  return mockProducts.filter(product => product.category === category);
};

export const getProductById = (id: string): Product | undefined => {
  return mockProducts.find(product => product.id === id);
};

export const searchProducts = (query: string): Product[] => {
  const lowercaseQuery = query.toLowerCase();
  return mockProducts.filter(product => 
    product.name.toLowerCase().includes(lowercaseQuery) ||
    product.description.toLowerCase().includes(lowercaseQuery) ||
    product.category.toLowerCase().includes(lowercaseQuery)
  );
};