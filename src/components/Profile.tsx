import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCredit } from '../contexts/CreditContext';
import { Coins, CreditCard, Smartphone, Globe, User as UserIcon, History, TrendingUp } from 'lucide-react';
import RechargeModal from './RechargeModal';

interface ProfileProps {
  onNavigate: (page: 'home' | 'generate' | 'gallery' | 'profile') => void;
}

const Profile: React.FC<ProfileProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { credits, transactions } = useCredit();
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  const totalRecharged = transactions
    .filter(t => t.type === 'recharge')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalSpent = Math.abs(transactions
    .filter(t => t.type === 'consume')
    .reduce((acc, t) => acc + t.amount, 0));

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Profile & Credits</h1>
        <p className="text-gray-600">Manage your account and recharge credits</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4 mb-6">
          <img
            src={user?.avatar}
            alt={user?.name}
            className="w-16 h-16 rounded-full"
          />
          <div>
            <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
            <p className="text-gray-600">{user?.email}</p>
          </div>
        </div>

        {/* Credit Balance */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Coins className="w-6 h-6 text-orange-600" />
                <span className="text-lg font-medium text-gray-700">Available Credits</span>
              </div>
              <div className="text-4xl font-bold text-orange-700">{credits}</div>
              <p className="text-sm text-orange-600 mt-1">
                {Math.floor(credits / 10)} image generations available
              </p>
            </div>
            <button
              onClick={() => setShowRechargeModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
            >
              Recharge
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-700">{totalRecharged}</div>
            <div className="text-sm text-blue-600">Total Recharged</div>
          </div>
          <div className="bg-red-50 rounded-xl p-4 text-center">
            <History className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-700">{totalSpent}</div>
            <div className="text-sm text-red-600">Credits Used</div>
          </div>
        </div>

      </div>

      {/* Quick Recharge Options */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Recharge</h3>
        <button
          onClick={() => setShowRechargeModal(true)}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
        >
          Purchase Credits with Stripe
        </button>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">Recent Transactions</h3>
          <span className="text-sm text-gray-500">{transactions.length} total</span>
        </div>
        
        {recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'recharge' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {transaction.type === 'recharge' ? (
                      <TrendingUp className={`w-5 h-5 ${
                        transaction.type === 'recharge' ? 'text-green-600' : 'text-red-600'
                      }`} />
                    ) : (
                      <History className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">
                      {transaction.description}
                    </div>
                    <div className="text-sm text-gray-500">
                      {transaction.timestamp.toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className={`font-bold ${
                  transaction.type === 'recharge' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'recharge' ? '+' : ''}{transaction.amount}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No transactions yet</p>
          </div>
        )}
      </div>

      {/* Recharge Modal */}
      {showRechargeModal && (
        <RechargeModal onClose={() => setShowRechargeModal(false)} />
      )}
    </div>
  );
};

export default Profile;