import React from 'react';
import { useCredit } from '../contexts/CreditContext';
import { useImage } from '../contexts/ImageContext';
import { ImageIcon, Coins, TrendingUp, Clock, Sparkles } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: 'home' | 'generate' | 'gallery' | 'profile') => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const { credits } = useCredit();
  const { history } = useImage();

  const stats = [
    {
      icon: Coins,
      label: 'Available Credits',
      value: credits,
      color: 'text-orange-600',
      bg: 'bg-orange-100'
    },
    {
      icon: ImageIcon,
      label: 'Images Generated',
      value: history.reduce((acc, h) => acc + h.images.length, 0),
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    {
      icon: TrendingUp,
      label: 'Credits Used',
      value: history.reduce((acc, h) => acc + h.creditsUsed, 0),
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    {
      icon: Clock,
      label: 'Sessions',
      value: history.length,
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          Create Amazing Art with{' '}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Magic
          </span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Transform your ideas into stunning visuals with our advanced AI image generation platform. 
          Simply describe what you want, and watch your imagination come to life.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => onNavigate('generate')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="w-6 h-6" />
              <span>Start Creating</span>
            </div>
          </button>
          
          <div className="flex items-center space-x-2 text-gray-600">
            <Coins className="w-5 h-5 text-orange-500" />
            <span className="font-medium">10 credits per generation</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</div>
            <div className="text-gray-600 text-sm font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Generation Preview */}
      {history.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Recent Creations</h2>
            <button
              onClick={() => onNavigate('gallery')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View All →
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {history[0]?.images.slice(0, 4).map((image) => (
              <div
                key={image.id}
                className="aspect-square rounded-xl overflow-hidden bg-gray-100 hover:scale-105 transition-transform cursor-pointer"
              >
                <img
                  src={image.url}
                  alt={image.prompt}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          
          {history[0] && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
              <div className="text-sm text-gray-600 mb-1">Latest prompt:</div>
              <div className="font-medium text-gray-800">"{history[0].prompt}"</div>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div
          onClick={() => onNavigate('generate')}
          className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white cursor-pointer hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105"
        >
          <ImageIcon className="w-12 h-12 mb-4" />
          <h3 className="text-xl font-bold mb-2">Generate Images</h3>
          <p className="text-blue-100">Create stunning AI-generated artwork from text descriptions</p>
        </div>
        
        <div
          onClick={() => onNavigate('profile')}
          className="bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl p-6 text-white cursor-pointer hover:from-green-600 hover:to-teal-700 transition-all transform hover:scale-105"
        >
          <Coins className="w-12 h-12 mb-4" />
          <h3 className="text-xl font-bold mb-2">Recharge Credits</h3>
          <p className="text-green-100">Top up your account to continue creating amazing art</p>
        </div>
      </div>
    </div>
  );
};

export default Home;