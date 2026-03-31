export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  category: string;
  categoryId?: number;
  categoryLabel?: string;
  productCategoryKey?: string;
  createdAt?: string;
  stock: number;
  rating?: number | null;
  reviews?: number | null;
}

export interface BackendProductRecord {
  id: number;
  product_name: string;
  description: string;
  price: number;
  stock_quantity: number;
  category_id: number;
  image_url: string | null;
  created_at: string;
}

export interface BackendCategoryRecord {
  id: number;
  category_name: string;
  description: string;
  image_url: string | null;
  created_at: string;
}

export interface StoreCategory {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  slug: string;
  productCategoryKey: string;
  imageUrl: string | null;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  createdAt?: string;
  avatar?: string;
}

export interface SignupFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  deliveryDate?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  tokenType: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: SignupFormData) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
}

export interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export type Category = 
  | 'all'
  | 'electronics'
  | 'clothing' 
  | 'books'
  | 'home'
  | 'sports'
  | 'beauty'
  | 'automotive';

export interface Filter {
  category: Category;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
}