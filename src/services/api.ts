import axios, {
    AxiosError,
    AxiosInstance,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from 'axios';
import { ApiError, ApiResponse } from '../types';
import { normalizeFieldErrors } from './normalizeFieldErrors';
import { clearToken, getToken } from './tokenManager';

// ─── Configuration ───

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

if (!BASE_URL) {
  throw new Error(
    'Missing EXPO_PUBLIC_API_URL environment variable. ' +
      'Set it in your .env file or app.config to point to the backend API.'
  );
}

const REQUEST_TIMEOUT = 30_000; // 30 seconds

// ─── Axios Instance ───

const client: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor ───
// Attach Bearer token if available; reject with AUTH_MISSING if no token.

client.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Reject the request — no token available
      return Promise.reject({
        __isApiError: true,
        code: 'AUTH_MISSING',
        message: 'Please log in to continue',
        url: `${config.baseURL ?? ''}${config.url ?? ''}`,
      } as ApiError & { __isApiError: boolean });
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ───
// Handle 401 (clear token, AUTH_EXPIRED) and normalize network/timeout errors.

client.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    // If this is already our custom ApiError from the request interceptor, pass through
    if ((error as any).__isApiError) {
      return Promise.reject(error);
    }

    const url =
      error.config?.baseURL && error.config?.url
        ? `${error.config.baseURL}${error.config.url}`
        : error.config?.url ?? 'unknown';

    // 401 — session expired
    if (error.response?.status === 401) {
      await clearToken();
      const apiError: ApiError = {
        code: 'AUTH_EXPIRED',
        message: 'Session expired, please log in again',
        url,
        status: 401,
      };
      return Promise.reject({ ...apiError, __isApiError: true });
    }

    // Timeout
    if (error.code === 'ECONNABORTED') {
      const apiError: ApiError = {
        code: 'TIMEOUT_ERROR',
        message: 'Request timed out. Please try again.',
        url,
      };
      return Promise.reject({ ...apiError, __isApiError: true });
    }

    // Network error (no response received)
    if (!error.response) {
      const apiError: ApiError = {
        code: 'NETWORK_ERROR',
        message: 'Unable to connect. Check your internet and try again.',
        url,
      };
      return Promise.reject({ ...apiError, __isApiError: true });
    }

    // Other HTTP errors — normalize into ApiError
    const status = error.response.status;
    const data = error.response.data as Record<string, any> | undefined;

    let code = 'SERVER_ERROR';
    let message = 'Something went wrong. Please try again later.';
    let fieldErrors: Record<string, string> | undefined;

    if (status === 400 || status === 422) {
      code = 'VALIDATION_ERROR';
      message = data?.message ?? 'Validation failed';
      fieldErrors = normalizeFieldErrors(data?.errors ?? data?.fieldErrors);
    } else if (status === 403) {
      code = 'FORBIDDEN';
      message = data?.message ?? "You don't have access to this resource";
    } else if (status === 404) {
      code = 'NOT_FOUND';
      message = data?.message ?? 'The requested resource was not found';
    } else if (status === 409) {
      code = 'CONFLICT';
      message = data?.message ?? 'A conflict occurred';
    } else if (status >= 500) {
      code = 'SERVER_ERROR';
      message = data?.message ?? 'Something went wrong. Please try again later.';
    }

    const apiError: ApiError = { code, message, url, status, fieldErrors };
    return Promise.reject({ ...apiError, __isApiError: true });
  }
);

// ─── Helper: check if a value is an ApiError ───

export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    'message' in value
  );
}

// ─── Typed request methods ───

async function get<T>(
  path: string,
  params?: Record<string, string | number | undefined>
): Promise<ApiResponse<T> | ApiError> {
  try {
    const response = await client.get<ApiResponse<T>>(path, { params });
    return response.data;
  } catch (error: unknown) {
    if (isApiError(error)) {
      const { __isApiError, ...apiError } = error as ApiError & { __isApiError?: boolean };
      return apiError as ApiError;
    }
    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred',
    };
  }
}

async function post<T>(
  path: string,
  body?: unknown
): Promise<ApiResponse<T> | ApiError> {
  try {
    const response = await client.post<ApiResponse<T>>(path, body);
    return response.data;
  } catch (error: unknown) {
    if (isApiError(error)) {
      const { __isApiError, ...apiError } = error as ApiError & { __isApiError?: boolean };
      return apiError as ApiError;
    }
    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred',
    };
  }
}

async function put<T>(
  path: string,
  body?: unknown
): Promise<ApiResponse<T> | ApiError> {
  try {
    const response = await client.put<ApiResponse<T>>(path, body);
    return response.data;
  } catch (error: unknown) {
    if (isApiError(error)) {
      const { __isApiError, ...apiError } = error as ApiError & { __isApiError?: boolean };
      return apiError as ApiError;
    }
    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred',
    };
  }
}

async function del<T>(
  path: string,
  params?: Record<string, string | number | undefined>
): Promise<ApiResponse<T> | ApiError> {
  try {
    const response = await client.delete<ApiResponse<T>>(path, { params });
    return response.data;
  } catch (error: unknown) {
    if (isApiError(error)) {
      const { __isApiError, ...apiError } = error as ApiError & { __isApiError?: boolean };
      return apiError as ApiError;
    }
    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred',
    };
  }
}

async function upload<T>(
  path: string,
  formData: FormData
): Promise<ApiResponse<T> | ApiError> {
  try {
    const response = await client.post<ApiResponse<T>>(path, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error: unknown) {
    if (isApiError(error)) {
      const { __isApiError, ...apiError } = error as ApiError & { __isApiError?: boolean };
      return apiError as ApiError;
    }
    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred',
    };
  }
}

// ─── Public API ───

const api = { get, post, put, delete: del, upload };

export default api;
