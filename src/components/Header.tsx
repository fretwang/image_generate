import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCredit } from '../contexts/CreditContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Sparkles, Home, ImageIcon, GalleryVertical as Gallery, User as UserIcon, LogOut, Coins, Bug, Mail, Globe } from 'lucide-react';
import DebugLogs from './DebugLogs';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: 'home' | 'generate' | 'gallery' | 'profile') => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate }) => {
  const { user, logout } = useAuth();
  const { credits } = useCredit();
  const { language, setLanguage, t } = useLanguage();
  const [showDebugLogs, setShowDebugLogs] = React.useState(false);

  const navItems = [
    { id: 'home', icon: Home, label: t.header.home },
    { id: 'generate', icon: ImageIcon, label: t.header.generate },
    { id: 'gallery', icon: Gallery, label: t.header.gallery },
    { id: 'profile', icon: UserIcon, label: t.header.profile },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">{t.login.title}</h1>
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
              <button
                onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
                className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors px-2 py-1 rounded"
                title={language === 'zh' ? '切换到English' : 'Switch to 中文'}
              >
                <Globe className="w-5 h-5" />
                <span className="text-xs font-medium">
                  {language === 'zh' ? 'EN' : '中'}
                </span>
              </button>
              <button
                onClick={() => setShowDebugLogs(true)}
                className="text-gray-500 hover:text-blue-600 transition-colors"
                title={t.debug.title}
              >
                <Bug className="w-5 h-5" />
              </button>
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
                title={t.header.signOut}
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

      {/* Debug Logs Modal */}
      {showDebugLogs && (
        <DebugLogs onClose={() => setShowDebugLogs(false)} />
      )}
    </header>
  );
};

export default Header;