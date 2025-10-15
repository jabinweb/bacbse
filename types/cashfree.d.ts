declare module '@cashfreepayments/cashfree-js' {
  export interface CashfreeInstance {
    checkout: (options: {
      paymentSessionId: string;
      redirectTarget: string;
    }) => Promise<{
      error?: { message: string };
      paymentDetails?: {
        paymentId?: string;
        orderId?: string;
        status?: string;
        amount?: number;
        currency?: string;
      };
      redirect?: boolean;
    }>;
  }

  export function load(config: {
    mode: 'sandbox' | 'production';
  }): Promise<CashfreeInstance>;
}