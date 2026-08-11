import axios from 'axios';
import { create } from 'zustand';
import api, { isApiError } from '../services/api';
import { normalizeFieldErrors } from '../services/normalizeFieldErrors';
import { clearToken, getToken, setToken } from '../services/tokenManager';
import { ApiError, ApiResponse, RegisterRequest, User } from '../types';

// ─── Public API client (no auth interceptor) ───
// Login and register endpoints don't require a token, but the main api.ts
// client rejects requests without one (AUTH_MISSING). We use a separate
// axios instance for these unauthenticated calls.

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const publicClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Types ───

interface AuthLoginResponse {
  token: string;
  user: User;
}

interface AuthMeResponse {
  user: User;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<ApiError | null>;
  register: (data: RegisterRequest) => Promise<ApiError | null>;
  forgotPassword: (email: string) => Promise<ApiError | null>;
  resetPassword: (email: string, secretKey: string, newPassword: string) => Promise<ApiError | null>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  updateProfile: (data: Partial<User>) => void;
}

// ─── Store ───

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, password: string): Promise<ApiError | null> => {
    try {
      const response = await publicClient.post<ApiResponse<AuthLoginResponse>>(
        '/api/auth/login',
        { email, password }
      );
      const { token, user } = response.data.data;

      await setToken(token);
      set({ user, isAuthenticated: true });

      return null;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        const data = error.response.data as Record<string, any> | undefined;

        const apiError: ApiError = {
          code: status === 401 ? 'AUTH_FAILED' : 'VALIDATION_ERROR',
          message: data?.message ?? 'Login failed. Please try again.',
          status,
          fieldErrors: normalizeFieldErrors(data?.errors ?? data?.fieldErrors),
        };
        return apiError;
      }

      if (axios.isAxiosError(error) && !error.response) {
        return {
          code: error.code === 'ECONNABORTED' ? 'TIMEOUT_ERROR' : 'NETWORK_ERROR',
          message: error.code === 'ECONNABORTED'
            ? 'Request timed out. Please try again.'
            : 'Unable to connect. Check your internet and try again.',
        };
      }

      return {
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred',
      };
    }
  },

  register: async (data: RegisterRequest): Promise<ApiError | null> => {
    try {
      const response = await publicClient.post<ApiResponse<AuthLoginResponse>>(
        '/api/auth/register',
        data
      );

      const { token, user } = response.data.data;

      await setToken(token);
      set({ user, isAuthenticated: true });

      return null;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        const data = error.response.data as Record<string, any> | undefined;

        const apiError: ApiError = {
          code: status === 409 ? 'CONFLICT' : 'VALIDATION_ERROR',
          message: data?.message ?? 'Registration failed. Please try again.',
          status,
          fieldErrors: normalizeFieldErrors(data?.errors ?? data?.fieldErrors),
        };
        return apiError;
      }

      if (axios.isAxiosError(error) && !error.response) {
        return {
          code: error.code === 'ECONNABORTED' ? 'TIMEOUT_ERROR' : 'NETWORK_ERROR',
          message: error.code === 'ECONNABORTED'
            ? 'Request timed out. Please try again.'
            : 'Unable to connect. Check your internet and try again.',
        };
      }

      return {
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred',
      };
    }
  },

  forgotPassword: async (email: string): Promise<ApiError | null> => {
    try {
      await publicClient.post<ApiResponse<null>>('/api/auth/forgot-password', { email });
      return null;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        const data = error.response.data as Record<string, any> | undefined;

        return {
          code: 'VALIDATION_ERROR',
          message: data?.message ?? 'Could not send reset code. Please try again.',
          status: error.response.status,
          fieldErrors: normalizeFieldErrors(data?.errors ?? data?.fieldErrors),
        };
      }

      if (axios.isAxiosError(error) && !error.response) {
        return {
          code: error.code === 'ECONNABORTED' ? 'TIMEOUT_ERROR' : 'NETWORK_ERROR',
          message: error.code === 'ECONNABORTED'
            ? 'Request timed out. Please try again.'
            : 'Unable to connect. Check your internet and try again.',
        };
      }

      return {
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred',
      };
    }
  },

  resetPassword: async (email: string, secretKey: string, newPassword: string): Promise<ApiError | null> => {
    try {
      await publicClient.post<ApiResponse<null>>('/api/auth/reset-password', {
        email,
        secretKey,
        newPassword,
      });
      return null;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        const data = error.response.data as Record<string, any> | undefined;

        return {
          code: error.response.status === 400 ? 'AUTH_FAILED' : 'VALIDATION_ERROR',
          message: data?.message ?? 'Could not reset password. Please try again.',
          status: error.response.status,
          fieldErrors: normalizeFieldErrors(data?.errors ?? data?.fieldErrors),
        };
      }

      if (axios.isAxiosError(error) && !error.response) {
        return {
          code: error.code === 'ECONNABORTED' ? 'TIMEOUT_ERROR' : 'NETWORK_ERROR',
          message: error.code === 'ECONNABORTED'
            ? 'Request timed out. Please try again.'
            : 'Unable to connect. Check your internet and try again.',
        };
      }

      return {
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred',
      };
    }
  },

  logout: async (): Promise<void> => {
    await clearToken();
    set({ user: null, isAuthenticated: false });
  },

  restoreSession: async (): Promise<void> => {
    set({ isLoading: true });

    try {
      const token = await getToken();

      if (!token) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      // Token exists — validate it by fetching the user profile
      const result = await api.get<AuthMeResponse>('/api/auth/me');

      if (isApiError(result)) {
        // Token is invalid or expired — clear it
        await clearToken();
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      // Successful session restore
      set({ user: result.data.user, isAuthenticated: true, isLoading: false });
    } catch {
      await clearToken();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  updateProfile: (data: Partial<User>): void => {
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
    }));
  },
}));
