import { fetchCategories } from './categories';
import type { BackendProductRecord, Product, StoreCategory } from '../types';

const INVENTORY_API_BASE_URL = (
  import.meta.env.VITE_INVENTORY_API_URL ??
  (import.meta.env.DEV ? '/api/inventory' : 'http://127.0.0.1:8003')
).replace(/\/$/, '');

const getCategoryMap = (categories: StoreCategory[]) =>
  new Map(categories.map((category) => [category.id, category]));

const mapBackendProduct = (
  product: BackendProductRecord,
  categories: StoreCategory[],
): Product => {
  const categoryMap = getCategoryMap(categories);
  const category = categoryMap.get(product.category_id);

  return {
    id: String(product.id),
    name: product.product_name,
    description: product.description,
    price: Number(product.price),
    imageUrl: product.image_url,
    category: category?.productCategoryKey ?? `category-${product.category_id}`,
    categoryId: product.category_id,
    categoryLabel: category?.name ?? `Category ${product.category_id}`,
    productCategoryKey: category?.productCategoryKey ?? `category-${product.category_id}`,
    createdAt: product.created_at,
    stock: product.stock_quantity,
    rating: null,
    reviews: null,
  };
};

export const fetchProducts = async (): Promise<Product[]> => {
  const [categories, response] = await Promise.all([
    fetchCategories(),
    fetch(`${INVENTORY_API_BASE_URL}/products/`),
  ]);

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.status}`);
  }

  const payload = await response.json();
  const records = Array.isArray(payload) ? payload : Array.isArray(payload?.value) ? payload.value : [];

  return records.map((record: BackendProductRecord) => mapBackendProduct(record, categories));
};

export const getProductById = async (productId: string): Promise<Product | null> => {
  try {
    const [categories, response] = await Promise.all([
      fetchCategories(),
      fetch(`${INVENTORY_API_BASE_URL}/products/${productId}`),
    ]);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch product: ${response.status}`);
    }

    const record: BackendProductRecord = await response.json();
    return mapBackendProduct(record, categories);
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    throw error;
  }
};