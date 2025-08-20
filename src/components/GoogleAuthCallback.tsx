import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { validateState } from '../config/google';
import { Loader2, AlertCircle } from 'lucide-react';
import { logger } from '../utils/logger';

const GoogleAuthCallback: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');
  const { handleGoogleCallback } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        logger.logGoogleAuth('开始处理OAuth回调', {
          url: window.location.href,
          pathname: window.location.pathname,
          search: window.location.search
        });
        
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        logger.logGoogleAuth('解析OAuth参数', { 
          code: code ? code.substring(0, 20) + '...' : null, 
          state: state ? state.substring(0, 10) + '...' : null, 
          error 
        });
        
        if (error) {
          logger.logGoogleError('Google OAuth返回错误', error);
          throw new Error(`Google OAuth error: ${error}`);
        }

        if (!code) {
          logger.logGoogleError('未收到授权码', 'No authorization code received');
          throw new Error('No authorization code received');
        }

        logger.logGoogleAuth('调用handleGoogleCallback处理授权码');
        const success = await handleGoogleCallback(code);
        
        if (success) {
          setStatus('success');
          logger.logGoogleAuth('OAuth回调处理成功，准备重定向到首页');
          setTimeout(() => {
            // 清理URL参数并重新加载
            window.history.replaceState({}, document.title, window.location.pathname);
            window.location.href = '/';
          }, 1000);
        } else {
          throw new Error('Google登录处理失败');
        }
        
      } catch (err) {
        logger.logGoogleError('OAuth回调处理失败', err);

        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setStatus('error');
      }
    };

    handleCallback();
  }, [handleGoogleCallback]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full mx-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">正在登录...</h2>
          <p className="text-gray-600">正在处理Google登录信息，请稍候</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full mx-4">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">登录失败</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
          >
            返回登录页
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default GoogleAuthCallback;