// Type declarations for Paystack Inline JS
declare global {
  interface Window {
    PaystackPop: {
      setup: (options: PaystackOptions) => PaystackHandler;
    };
  }
}

export interface PaystackOptions {
  key: string;
  email: string;
  amount: number;
  currency?: string;
  ref: string;
  metadata?: Record<string, any>;
  onClose?: () => void;
  callback?: (response: PaystackResponse) => void;
}

export interface PaystackHandler {
  openIframe: () => void;
}

export interface PaystackResponse {
  reference: string;
  status: string;
  message: string;
}

export {};

