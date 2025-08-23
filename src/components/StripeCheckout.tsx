import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { STRIPE_CONFIG, type StripeProduct } from '../stripe-config';
import { Loader2, CreditCard, Check, X } from 'lucide-react';

interface StripeCheckoutProps {
  onClose?: () => void;
}

const StripeCheckout: React.FC<StripeCheckoutProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<StripeProduct | null>(null);

  const handleCheckout = async (product: StripeProduct) => {
    if (!user) return;

    setLoading(true);
    setSelectedProduct(product);

    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch('https://www.fretwang.com/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          price_id: product.priceId,
          mode: product.mode,
          success_url: 'https://www.fretwang.com/stripe/success',
          cancel_url: 'https://www.fretwang.com/stripe/cancel',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.checkoutUrl || data.url) {
        window.location.href = data.checkoutUrl || data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error instanceof Error ? error.message : 'Failed to start checkout process');
    } finally {
      setLoading(false);
      setSelectedProduct(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Purchase Credits</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>

        <div className="p-6">
          <div className="grid gap-4">
            {STRIPE_CONFIG.products.map((product) => (
              <div
                key={product.id}
                className="border border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {product.description}
                    </p>
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl font-bold text-green-600">
                        ${product.price.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {product.credits} credits
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleCheckout(product)}
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <div className="flex items-center space-x-2">
                      {loading && selectedProduct?.id === product.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <CreditCard className="w-5 h-5" />
                      )}
                      <span>
                        {loading && selectedProduct?.id === product.id ? 'Processing...' : 'Purchase'}
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-xl">
            <div className="flex items-start space-x-3">
              <Check className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Secure Payment</p>
                <p>Your payment is processed securely through Stripe. Credits will be added to your account immediately after successful payment.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StripeCheckout;