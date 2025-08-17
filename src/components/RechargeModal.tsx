import React, { useState } from 'react';
import { useCredit } from '../contexts/CreditContext';
import { X, CreditCard, Smartphone, Globe, Loader2, CheckCircle } from 'lucide-react';

interface RechargeModalProps {
  onClose: () => void;
}

const RechargeModal: React.FC<RechargeModalProps> = ({ onClose }) => {
  const [amount, setAmount] = useState(20);
  const [paymentMethod, setPaymentMethod] = useState('wechat');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { recharge } = useCredit();

  const rechargeOptions = [
    { amount: 10, credits: 100, bonus: 0 },
    { amount: 20, credits: 200, bonus: 20 },
    { amount: 50, credits: 500, bonus: 100 },
    { amount: 100, credits: 1000, bonus: 300 },
  ];

  const paymentMethods = [
    { id: 'wechat', name: 'WeChat Pay', icon: Smartphone, color: 'text-green-600' },
    { id: 'alipay', name: 'Alipay', icon: CreditCard, color: 'text-blue-600' },
    { id: 'stripe', name: 'Credit Card', icon: Globe, color: 'text-purple-600' },
  ];

  const selectedOption = rechargeOptions.find(option => option.amount === amount);
  const totalCredits = selectedOption ? selectedOption.credits + selectedOption.bonus : 0;

  const handleRecharge = async () => {
    setIsProcessing(true);
    
    try {
      const success = await recharge(amount, paymentMethods.find(p => p.id === paymentMethod)?.name || '');
      if (success) {
        setIsSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Recharge failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Recharge Successful!</h2>
          <p className="text-gray-600 mb-4">
            Your account has been credited with {totalCredits} credits.
          </p>
          <p className="text-sm text-gray-500">This modal will close automatically...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Recharge Credits</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Amount Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Amount
            </label>
            <div className="grid grid-cols-2 gap-3">
              {rechargeOptions.map((option) => (
                <button
                  key={option.amount}
                  onClick={() => setAmount(option.amount)}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    amount === option.amount
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-lg font-bold text-gray-800">¥{option.amount}</div>
                  <div className="text-sm text-gray-600">
                    {option.credits} credits
                  </div>
                  {option.bonus > 0 && (
                    <div className="text-xs text-green-600 font-medium">
                      +{option.bonus} bonus
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Payment Method
            </label>
            <div className="space-y-2">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`w-full flex items-center space-x-3 p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === method.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <method.icon className={`w-6 h-6 ${method.color}`} />
                  <span className="font-medium text-gray-800">{method.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-medium text-gray-800 mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount</span>
                <span className="font-medium">¥{amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Base Credits</span>
                <span className="font-medium">{selectedOption?.credits}</span>
              </div>
              {selectedOption && selectedOption.bonus > 0 && (
                <div className="flex justify-between">
                  <span className="text-green-600">Bonus Credits</span>
                  <span className="font-medium text-green-600">+{selectedOption.bonus}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-2 flex justify-between">
                <span className="font-medium text-gray-800">Total Credits</span>
                <span className="font-bold text-gray-800">{totalCredits}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRecharge}
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-center space-x-2">
                {isProcessing && <Loader2 className="w-5 h-5 animate-spin" />}
                <span>{isProcessing ? 'Processing...' : `Pay ¥${amount}`}</span>
              </div>
            </button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            This is a demo. No actual payment will be processed.
          </div>
        </div>
      </div>
    </div>
  );
};

export default RechargeModal;