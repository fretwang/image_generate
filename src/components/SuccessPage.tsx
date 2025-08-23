import React from 'react';
import { CheckCircle, Home, CreditCard } from 'lucide-react';

interface SuccessPageProps {
  onNavigate: (page: 'home' | 'generate' | 'gallery' | 'profile') => void;
}

const SuccessPage: React.FC<SuccessPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full mx-4">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your purchase. Your credits have been added to your account.
        </p>

        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-2">What's Next?</h3>
          <p className="text-sm text-gray-600">
            Your credits are now available in your account. Start creating amazing AI-generated images!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
          >
            <div className="flex items-center justify-center space-x-2">
              <Home className="w-5 h-5" />
              <span>Go to Home</span>
            </div>
          </button>
          
          <button
            onClick={() => onNavigate('generate')}
            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition-all duration-200 transform hover:scale-105"
          >
            <div className="flex items-center justify-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <span>Start Creating</span>
            </div>
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          You can view your transaction history in your profile page.
        </p>
      </div>
    </div>
  );
};

export default SuccessPage;