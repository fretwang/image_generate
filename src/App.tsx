import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { CreditProvider } from './contexts/CreditContext';
import { ImageProvider } from './contexts/ImageContext';
import Header from './components/Header';
import Login from './components/Login';
import Home from './components/Home';
import Generate from './components/Generate';
import Gallery from './components/Gallery';
import Profile from './components/Profile';
import { useAuth } from './contexts/AuthContext';
import GoogleAuthCallback from './components/GoogleAuthCallback';

type Page = 'home' | 'generate' | 'gallery' | 'profile';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const { user } = useAuth();

  // 检查是否是Google OAuth回调
  const urlParams = new URLSearchParams(window.location.search);
  const hasAuthCode = urlParams.has('code') && urlParams.has('state');
  // 只有在没有用户登录且有授权码时才显示回调组件
  const isGoogleCallback = hasAuthCode && !user;

  React.useEffect(() => {
    console.log('App routing check:', {
      currentPath: window.location.pathname,
      hasAuthCode,
      isGoogleCallback,
      searchParams: window.location.search,
      hasUser: !!user,
      userInfo: user ? { id: user.id, email: user.email } : null
    });
  }, [hasAuthCode, isGoogleCallback, user]);

  // 如果用户已登录但URL还有OAuth参数，清理URL
  React.useEffect(() => {
    if (user && hasAuthCode) {
      console.log('用户已登录，清理OAuth参数');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [user, hasAuthCode]);

  // 如果检测到Google OAuth参数，显示回调处理组件
  if (isGoogleCallback) {
    console.log('Rendering GoogleAuthCallback component');
    return <GoogleAuthCallback />;
  }

  if (!user) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={setCurrentPage} />;
      case 'generate':
        return <Generate onNavigate={setCurrentPage} />;
      case 'gallery':
        return <Gallery onNavigate={setCurrentPage} />;
      case 'profile':
        return <Profile onNavigate={setCurrentPage} />;
      default:
        return <Home onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        {renderPage()}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CreditProvider>
        <ImageProvider>
          <AppContent />
        </ImageProvider>
      </CreditProvider>
    </AuthProvider>
  );
}

export default App;