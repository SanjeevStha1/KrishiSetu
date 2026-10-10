/**
 * KrishiSetu Centralized Frontend API Client
 * Encapsulates base URL, Bearer authorization token, standard request headers, and formatted error handling.
 */

const BASE_URL = (import.meta as any).env?.VITE_API_URL || '';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export class ApiError extends Error {
  public status: number;
  public code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined'
    ? window.sessionStorage.getItem('krishisetu_auth_token_v3') || window.localStorage.getItem('krishisetu_auth_token_v3')
    : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage = data?.error || data?.message || `Request failed with status ${response.status}`;
      throw new ApiError(errorMessage, response.status, data?.code);
    }

    return data as T;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(err.message || 'Network communication error', 0);
  }
}
