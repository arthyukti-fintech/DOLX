import { create } from 'zustand';
import api, { isApiError } from '../services/api';
import { ApiError, Payment, RazorpayCallback, RazorpayOrder } from '../types';

// ─── Types ───

interface PaymentState {
  transactions: Payment[];
  isLoading: boolean;
  error: string | null;
  fetchTransactions: () => Promise<void>;
  fundEscrow: (paymentId: string) => Promise<RazorpayOrder | ApiError>;
  confirmEscrow: (paymentId: string, razorpayData: RazorpayCallback) => Promise<ApiError | null>;
  releasePayment: (paymentId: string) => Promise<ApiError | null>;
}

// ─── Store ───

export const usePaymentStore = create<PaymentState>((set) => ({
  transactions: [],
  isLoading: false,
  error: null,

  fetchTransactions: async (): Promise<void> => {
    set({ isLoading: true, error: null });

    const result = await api.get<{ payments: Payment[] }>('/api/payments/my');

    if (isApiError(result)) {
      set({ isLoading: false, error: result.message });
      return;
    }

    set({
      transactions: result.data.payments,
      isLoading: false,
      error: null,
    });
  },

  fundEscrow: async (paymentId: string): Promise<RazorpayOrder | ApiError> => {
    set({ isLoading: true, error: null });

    const result = await api.post<{
      orderId: string;
      amount: number;
      currency: string;
      keyId: string;
      paymentId: string;
    }>(`/api/payments/${paymentId}/fund`);

    if (isApiError(result)) {
      set({ isLoading: false, error: result.message });
      return result;
    }

    const order: RazorpayOrder = {
      orderId: result.data.orderId,
      amount: result.data.amount,
      currency: result.data.currency,
      keyId: result.data.keyId,
      paymentId: result.data.paymentId,
    };

    set({ isLoading: false, error: null });
    return order;
  },

  confirmEscrow: async (
    paymentId: string,
    razorpayData: RazorpayCallback
  ): Promise<ApiError | null> => {
    set({ isLoading: true, error: null });

    const result = await api.post<{ payment: Payment }>(
      `/api/payments/${paymentId}/confirm`,
      razorpayData
    );

    if (isApiError(result)) {
      set({ isLoading: false, error: result.message });
      return result;
    }

    const updatedPayment = result.data.payment;

    set((state) => ({
      transactions: state.transactions.map((t) =>
        t._id === paymentId ? updatedPayment : t
      ),
      isLoading: false,
      error: null,
    }));

    return null;
  },

  releasePayment: async (paymentId: string): Promise<ApiError | null> => {
    set({ isLoading: true, error: null });

    const result = await api.put<{ payment: Payment }>(
      `/api/payments/${paymentId}/release`
    );

    if (isApiError(result)) {
      set({ isLoading: false, error: result.message });
      return result;
    }

    const updatedPayment = result.data.payment;

    set((state) => ({
      transactions: state.transactions.map((t) =>
        t._id === paymentId ? updatedPayment : t
      ),
      isLoading: false,
      error: null,
    }));

    return null;
  },
}));
