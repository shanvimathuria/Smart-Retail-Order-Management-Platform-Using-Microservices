import type { StoreCategory, Product } from '../types';

const INVENTORY_API_BASE_URL = (
  import.meta.env.VITE_INVENTORY_API_URL ??
  (import.meta.env.DEV ? '/api/inventory' : 'http://127.0.0.1:8003')
).replace(/\/$/, '');

// Category Management APIs
export const fetchCategoriesAdmin = async (): Promise<StoreCategory[]> => {
  const response = await fetch(`${INVENTORY_API_BASE_URL}/categories/`);

  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.status}`);
  }

  const payload = await response.json();
  const records = Array.isArray(payload) ? payload : Array.isArray(payload?.value) ? payload.value : [];

  return records.map((record: any) => ({
    id: record.id,
    name: record.category_name,
    description: record.description || '',
    createdAt: record.created_at,
    slug: record.category_name.toLowerCase().replace(/\s+/g, '-'),
    productCategoryKey: record.category_name.toLowerCase().replace(/\s+/g, '-'),
    imageUrl: record.image_url || '',
  }));
};

export const addCategory = async (categoryName: string, description: string = ''): Promise<StoreCategory> => {
  const response = await fetch(`${INVENTORY_API_BASE_URL}/categories/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      category_name: categoryName,
      description: description,
      image_url: '',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to add category: ${error}`);
  }

  const record = await response.json();
  return {
    id: record.id,
    name: record.category_name,
    description: record.description || '',
    createdAt: record.created_at,
    slug: record.category_name.toLowerCase().replace(/\s+/g, '-'),
    productCategoryKey: record.category_name.toLowerCase().replace(/\s+/g, '-'),
    imageUrl: record.image_url || '',
  };
};

export const deleteCategory = async (categoryId: string): Promise<void> => {
  const response = await fetch(`${INVENTORY_API_BASE_URL}/categories/${categoryId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete category: ${response.status}`);
  }
};

// Product Management APIs
export const fetchProductsAdmin = async (): Promise<Product[]> => {
  const response = await fetch(`${INVENTORY_API_BASE_URL}/products/`);

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.status}`);
  }

  const payload = await response.json();
  const records = Array.isArray(payload) ? payload : Array.isArray(payload?.value) ? payload.value : [];

  return records.map((record: any) => ({
    id: String(record.id),
    name: record.product_name,
    description: record.description || '',
    price: Number(record.price),
    imageUrl: record.image_url || '/api/placeholder/200/200',
    category: `category-${record.category_id}`,
    categoryId: record.category_id,
    categoryLabel: `Category ${record.category_id}`,
    productCategoryKey: `category-${record.category_id}`,
    createdAt: record.created_at,
    stock: record.stock_quantity || 0,
    rating: null,
    reviews: null,
  }));
};

export const addProduct = async (
  name: string,
  categoryId: string,
  price: number,
  stock: number,
  description: string = ''
): Promise<Product> => {
  const response = await fetch(`${INVENTORY_API_BASE_URL}/products/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      product_name: name,
      description: description,
      price: price,
      stock_quantity: stock,
      category_id: parseInt(categoryId),
      image_url: '/api/placeholder/200/200',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to add product: ${error}`);
  }

  const record = await response.json();
  return {
    id: String(record.id),
    name: record.product_name,
    description: record.description || '',
    price: Number(record.price),
    imageUrl: record.image_url || '/api/placeholder/200/200',
    category: `category-${record.category_id}`,
    categoryId: record.category_id,
    categoryLabel: `Category ${record.category_id}`,
    productCategoryKey: `category-${record.category_id}`,
    createdAt: record.created_at,
    stock: record.stock_quantity || 0,
    rating: null,
    reviews: null,
  };
};

export const updateProduct = async (
  productId: string,
  name: string,
  categoryId: string,
  price: number,
  stock: number,
  description: string = ''
): Promise<Product> => {
  const response = await fetch(`${INVENTORY_API_BASE_URL}/products/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      product_name: name,
      description: description,
      price: price,
      stock_quantity: stock,
      category_id: parseInt(categoryId),
      image_url: '/api/placeholder/200/200',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update product: ${error}`);
  }

  const record = await response.json();
  return {
    id: String(record.id),
    name: record.product_name,
    description: record.description || '',
    price: Number(record.price),
    imageUrl: record.image_url || '/api/placeholder/200/200',
    category: `category-${record.category_id}`,
    categoryId: record.category_id,
    categoryLabel: `Category ${record.category_id}`,
    productCategoryKey: `category-${record.category_id}`,
    createdAt: record.created_at,
    stock: record.stock_quantity || 0,
    rating: null,
    reviews: null,
  };
};

export const deleteProduct = async (productId: string): Promise<void> => {
  const response = await fetch(`${INVENTORY_API_BASE_URL}/products/${productId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete product: ${response.status}`);
  }
};
