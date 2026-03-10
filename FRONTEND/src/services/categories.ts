import type { BackendCategoryRecord, StoreCategory } from '../types';

const INVENTORY_API_BASE_URL = (
  import.meta.env.VITE_INVENTORY_API_URL ??
  (import.meta.env.DEV ? '/api/inventory' : 'http://127.0.0.1:8003')
).replace(/\/$/, '');

const CATEGORY_PRODUCT_KEY_ALIASES: Record<string, string> = {
  electronics: 'electronics',
  fashion: 'clothing',
  'home-garden': 'home',
  'sports-fitness': 'sports',
  'beauty-personal-care': 'beauty',
  'books-stationery': 'books',
};

export const toCategorySlug = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const toProductCategoryKey = (categoryName: string): string => {
  const normalized = toCategorySlug(categoryName)
    .replace(/-and-/g, '-')
    .replace(/-+/g, '-');

  return CATEGORY_PRODUCT_KEY_ALIASES[normalized] ?? normalized;
};

const mapBackendCategory = (category: BackendCategoryRecord): StoreCategory => ({
  id: category.id,
  name: category.category_name,
  description: category.description,
  createdAt: category.created_at,
  slug: toCategorySlug(category.category_name),
  productCategoryKey: toProductCategoryKey(category.category_name),
  imageUrl: category.image_url,
});

export const fetchCategories = async (): Promise<StoreCategory[]> => {
  const response = await fetch(`${INVENTORY_API_BASE_URL}/categories/`);

  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.status}`);
  }

  const payload = await response.json();
  const records = Array.isArray(payload) ? payload : Array.isArray(payload?.value) ? payload.value : [];

  return records.map(mapBackendCategory);
};
