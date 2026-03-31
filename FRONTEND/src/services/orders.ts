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

// ✅ NO HeadersInit anywhere
const normalizeHeaders = (headers: any): Record<string, string> => {
  const result: Record<string, string> = {};

  if (!headers) return result;

  if (headers instanceof Headers) {
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  if (Array.isArray(headers)) {
    headers.forEach(([key, value]) => {
      result[key] = value;
    });
    return result;
  }

  return headers;
};

const readValidationMessage = (detail: unknown): string => {
  if (detail && typeof detail === 'object' && 'msg' in (detail as Record<string, unknown>)) {
    return String((detail as Record<string, unknown>).msg);
  }
  return String(detail);
};

const requestJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const authHeaders = normalizeHeaders(getStoredAuthHeader());

  const authHeader = authHeaders["Authorization"];
  if (!authHeader) {
    throw new Error('User not authenticated. Please login to access orders.');
  }

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...authHeaders,
    ...normalizeHeaders(init?.headers),
  };

  let response: Response;

  try {
    response = await fetch(`${ORDER_API_BASE_URL}${path}`, {
      ...init,
      headers: requestHeaders,
    });
  } catch (error) {
    console.error('Order API request failed:', error);
    throw new Error('Unable to reach the order service.');
  }

  const responseText = await response.text();

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;

    if (response.status === 401) {
      errorMessage = 'Authentication failed. Please login again.';
    } else if (response.status === 403) {
      errorMessage = 'Access denied.';
    } else if (responseText) {
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.detail) {
          errorMessage = Array.isArray(errorData.detail)
            ? errorData.detail.map(readValidationMessage).join(', ')
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

  return JSON.parse(responseText) as T;
};

// API functions
export const placeOrder = async (orderData: CreateOrderRequest): Promise<OrderResponse> => {
  return requestJson<OrderResponse>('/orders/place', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
};

export const getUserOrders = async (): Promise<OrderResponse[]> => {
  return requestJson<OrderResponse[]>('/orders/me');
};

export const getOrder = async (orderId: number): Promise<OrderResponse> => {
  return requestJson<OrderResponse>(`/orders/${orderId}`);
};