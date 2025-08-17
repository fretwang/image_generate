import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCredit } from '../contexts/CreditContext';
import { Sparkles, Home, ImageIcon, GalleryVertical as Gallery, User as UserIcon, LogOut, Coins } from 'lucide-react';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: 'home' | 'generate' | 'gallery' | 'profile') => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate }) => {
  const { user, logout } = useAuth();
  const { credits } = useCredit();

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'generate', icon: ImageIcon, label: 'Generate' },
    { id: 'gallery', icon: Gallery, label: 'Gallery' },
    { id: 'profile', icon: UserIcon, label: 'Profile' },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">AI Art Studio</h1>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as any)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  currentPage === item.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-100 to-orange-100 px-3 py-2 rounded-full">
              <Coins className="w-5 h-5 text-orange-600" />
              <span className="font-bold text-orange-700">{credits}</span>
            </div>

            <div className="flex items-center space-x-3">
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-8 h-8 rounded-full"
              />
              <span className="hidden md:block text-sm font-medium text-gray-700">
                {user?.name}
              </span>
              <button
                onClick={logout}
                className="text-gray-500 hover:text-red-600 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="md:hidden border-t border-gray-100">
          <nav className="flex items-center justify-around py-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as any)}
                className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
                  currentPage === item.id
                    ? 'text-blue-600'
                    : 'text-gray-500'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;