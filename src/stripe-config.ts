export const STRIPE_CONFIG = {
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  products: [
    {
      id: 'prod_Sv2jGBZeGgx2m7',
      priceId: 'price_1RzCeQE7CKZEmvizxkNpu3ol',
      name: '1000 credits',
      description: 'AI IMAGE CREDIT',
      mode: 'payment' as const,
      credits: 1000,
      price: 100.00
    },
    {
      id: 'prod_Sv2iyoqpWBDSDH',
      priceId: 'price_1RzCcvE7CKZEmviz9414f6RA',
      name: '500 credits',
      description: 'AI IMAGE CREDIT',
      mode: 'payment' as const,
      credits: 500,
      price: 50.00
    },
    {
      id: 'prod_Sv2gUczvmB1ctg',
      priceId: 'price_1RzCbQE7CKZEmviz1rBJJDFg',
      name: '200 credits',
      description: 'AI IMAGE CREDIT',
      mode: 'payment' as const,
      credits: 200,
      price: 20.00
    }
  ]
};

export type StripeProduct = typeof STRIPE_CONFIG.products[0];