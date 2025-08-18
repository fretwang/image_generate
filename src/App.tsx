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

  // 检查是否是Google OAuth回调 - 检查URL参数和路径
  const urlParams = new URLSearchParams(window.location.search);
  const currentPath = window.location.pathname;
  const hasAuthCode = urlParams.has('code') && urlParams.has('state');
  const isCallbackPath = currentPath === '/auth/callback';
  const isGoogleCallback = hasAuthCode || isCallbackPath;

  console.log('App routing check:', {
    currentPath,
    hasAuthCode,
    isCallbackPath,
    isGoogleCallback,
    searchParams: window.location.search
  });

  // 如果是Google OAuth回调，显示回调处理组件
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