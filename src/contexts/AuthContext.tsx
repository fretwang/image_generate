import React, { createContext, useContext, useState, ReactNode } from 'react';
import { buildGoogleAuthUrl, storeState } from '../config/google';
import { exchangeCodeForTokens, getUserInfo, verifyIdToken } from '../services/googleAuth';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  verifyEmail: (email: string, code: string) => Promise<boolean>;
  googleLogin: () => Promise<boolean>;
  handleGoogleCallback: (code: string) => Promise<boolean>;
  sendResetCode: (email: string) => Promise<boolean>;
  verifyResetCode: (email: string, code: string) => Promise<boolean>;
  resetPassword: (email: string, newPassword: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful login
    setUser({
      id: '1',
      email,
      name: email.split('@')[0],
      avatar: `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2`
    });
    
    setIsLoading(false);
    return true;
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful registration - don't login immediately, wait for email verification
    setIsLoading(false);
    return true;
  };

  const verifyEmail = async (email: string, code: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock successful verification - any 6-digit code works
    if (code.length === 6) {
      setUser({
        id: '1',
        email,
        name: email.split('@')[0],
        avatar: `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2`
      });
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const googleLogin = async (): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // 检查Google配置
      if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
        console.warn('Google Client ID not configured, using mock login');
        // 模拟Google登录作为后备
        await new Promise(resolve => setTimeout(resolve, 2000));
        setUser({
          id: 'google-mock-1',
          email: 'user@gmail.com',
          name: 'Google User',
          avatar: `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2`
        });
        setIsLoading(false);
        return true;
      }

      // 构建Google OAuth URL
      const authUrl = buildGoogleAuthUrl();
      const urlParams = new URLSearchParams(new URL(authUrl).search);
      const state = urlParams.get('state');
      
      if (state) {
        storeState(state);
      }
      
      // 重定向到Google OAuth
      window.location.href = authUrl;
      return true;
      
    } catch (error) {
      console.error('Google login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const handleGoogleCallback = async (code: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // 交换授权码获取令牌
      const tokens = await exchangeCodeForTokens(code);
      
      // 验证ID Token
      const idTokenPayload = verifyIdToken(tokens.id_token);
      
      // 获取用户信息
      const userInfo = await getUserInfo(tokens.access_token);
      
      // 设置用户信息
      setUser({
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        avatar: userInfo.picture
      });
      
      // 存储令牌（可选）
      localStorage.setItem('google_access_token', tokens.access_token);
      if (tokens.refresh_token) {
        localStorage.setItem('google_refresh_token', tokens.refresh_token);
      }
      
      setIsLoading(false);
      return true;
      
    } catch (error) {
      console.error('Google callback error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const sendResetCode = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate sending reset code
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    return true;
  };

  const verifyResetCode = async (email: string, code: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate code verification
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    // Any 6-digit code works for demo
    return code.length === 6;
  };

  const resetPassword = async (email: string, newPassword: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate password reset
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      verifyEmail, 
      googleLogin, 
      handleGoogleCallback,
      sendResetCode, 
      verifyResetCode, 
      resetPassword, 
      logout, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};