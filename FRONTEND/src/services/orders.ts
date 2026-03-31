import { getStoredAuthHeader } from './auth';

const ORDER_API_BASE_URL = (
  import.meta.env.VITE_ORDER_API_URL ??
  (import.meta.env.DEV ? '/api/order' : 'http://127.0.0.1:8000')
).replace(/\/$/, '');

export interface OrderItem {
  product_id: number;
  quantity: number;
  price?: number;
}

export interface CreateOrderRequest {
  items: OrderItem[];
  payment_method: 'COD' | 'UPI';
}

export interface OrderResponse {
  id: number;
  user_id: number;
  total_amount: number;
  status: string;
  created_at: string;
  payment_method?: 'COD' | 'UPI' | string;
  items: OrderItem[];
}

const requestJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  // ✅ FIXED: safer typing
  const authHeaders = getStoredAuthHeader() as Record<string, string> | undefined;

  // ✅ FIXED: use bracket notation + null check
  if (!authHeaders || !authHeaders["Authorization"]) {
    throw new Error('User not authenticated. Please login to access orders.');
  }

  let response: Response;

  try {
    response = await fetch(`${ORDER_API_BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...(init?.headers ?? {}),
      },
      ...init,
    });
  } catch (error) {
    console.error('Order API request failed:', error);
    throw new Error('Unable to reach the order service. Check that the backend is running.');
  }

  let responseText: string;
  try {
    responseText = await response.text();
  } catch {
    throw new Error('Failed to read response from order service.');
  }

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;

    if (response.status === 401) {
      errorMessage = 'Authentication failed. Please login again.';
    } else if (response.status === 403) {
      errorMessage = 'Access denied. Please check your permissions.';
    } else if (responseText) {
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.detail) {
          errorMessage = Array.isArray(errorData.detail)
            ? errorData.detail.map((d: any) => d.msg || d).join(', ')
            : errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        errorMessage = responseText.substring(0, 200);
      }
    }

    throw new Error(errorMessage);
  }

  if (!responseText) {
    throw new Error('Empty response from order service');
  }

  try {
    return JSON.parse(responseText) as T;
  } catch {
    throw new Error('Invalid JSON response from order service');
  }
};

// API functions for orders
export const placeOrder = async (orderData: CreateOrderRequest): Promise<OrderResponse> => {
  return await requestJson<OrderResponse>('/orders/place', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
};

export const getUserOrders = async (): Promise<OrderResponse[]> => {
  return await requestJson<OrderResponse[]>('/orders/me');
};

export const getOrder = async (orderId: number): Promise<OrderResponse> => {
  return await requestJson<OrderResponse>(`/orders/${orderId}`);
};