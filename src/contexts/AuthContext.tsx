import React, { createContext, useContext, useState, ReactNode } from 'react';
import { buildGoogleAuthUrl, storeState } from '../config/google';
import { exchangeCodeForTokens, getUserInfo, verifyIdToken } from '../services/googleAuth';
import { userService } from '../services/userService';
import type { User as DBUser } from '../lib/supabase';

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
    
    try {
      // Get user from database
      const dbUser = await userService.getUserByEmail(email);
      
      if (dbUser && dbUser.email_verified) {
        setUser({
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          avatar: dbUser.avatar || `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2`
        });
        setIsLoading(false);
        return true;
      }
    } catch (error) {
      console.error('Login error:', error);
    }
    
    setIsLoading(false);
    return false;
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Check if user already exists
      const existingUser = await userService.getUserByEmail(email);
      if (existingUser) {
        console.error('User already exists');
        setIsLoading(false);
        return false;
      }

      // Create new user
      const newUser = await userService.createUser({
        email,
        name,
        password_hash: password, // In production, hash this password
        email_verified: false
      });

      if (newUser) {
        setIsLoading(false);
        return true;
      }
    } catch (error) {
      console.error('Registration error:', error);
    }
    
    setIsLoading(false);
    return false;
  };

  const verifyEmail = async (email: string, code: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Mock successful verification - any 6-digit code works
      if (code.length === 6) {
        const dbUser = await userService.getUserByEmail(email);
        if (dbUser) {
          // Verify email in database
          await userService.verifyEmail(dbUser.id);
          
          setUser({
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            avatar: dbUser.avatar || `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2`
          });
          setIsLoading(false);
          return true;
        }
      }
    } catch (error) {
      console.error('Email verification error:', error);
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
      console.log('handleGoogleCallback called with code:', code.substring(0, 20) + '...');
      
      // 交换授权码获取令牌
      console.log('Exchanging code for tokens...');
      const tokens = await exchangeCodeForTokens(code);
      console.log('Tokens received:', !!tokens.access_token);
      
      // 验证ID Token
      console.log('Verifying ID token...');
      const idTokenPayload = verifyIdToken(tokens.id_token);
      console.log('ID token verified:', !!idTokenPayload);
      
      // 获取用户信息
      console.log('Getting user info...');
      const userInfo = await getUserInfo(tokens.access_token);
      console.log('User info received:', userInfo.email);
      
      // Check if user exists in database
      let dbUser = await userService.getUserByGoogleId(userInfo.id);
      
      if (!dbUser) {
        // Create new user from Google info
        dbUser = await userService.createUser({
          email: userInfo.email,
          name: userInfo.name,
          google_id: userInfo.id,
          avatar: userInfo.picture,
          email_verified: true
        });
      }
      
      if (dbUser) {
        // 设置用户信息
        setUser({
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          avatar: dbUser.avatar || userInfo.picture
        });
      }
      
      // 存储令牌（可选）
      localStorage.setItem('google_access_token', tokens.access_token);
      if (tokens.refresh_token) {
        localStorage.setItem('google_refresh_token', tokens.refresh_token);
      }
      
      console.log('Google login successful!');
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