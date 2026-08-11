/**
 * The `react-native-razorpay` package ships no bundled types, so the checkout
 * call in the payment flow would otherwise be implicitly `any`.
 *
 * This declares only the surface the app actually touches: `open()` and the
 * fields we read off its resolved payload.
 */
declare module 'react-native-razorpay' {
  export interface RazorpayCheckoutOptions {
    key: string;
    amount: number | string;
    currency: string;
    order_id: string;
    name?: string;
    description?: string;
    image?: string;
    prefill?: {
      name?: string;
      email?: string;
      contact?: string;
    };
    theme?: { color?: string };
    notes?: Record<string, string>;
  }

  export interface RazorpaySuccessResponse {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }

  export interface RazorpayErrorResponse {
    code?: number | string;
    description?: string;
    error?: { description?: string; code?: string | number };
  }

  const RazorpayCheckout: {
    open(options: RazorpayCheckoutOptions): Promise<RazorpaySuccessResponse>;
  };

  export default RazorpayCheckout;
}
