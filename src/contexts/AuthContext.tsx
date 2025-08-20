import React, { createContext, useContext, useState, ReactNode } from 'react';
import { buildGoogleAuthUrl, storeState } from '../config/google';
import apiService from '../services/apiService';

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
  resendVerificationEmail: (email: string) => Promise<boolean>;
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
  const [pendingVerificationData, setPendingVerificationData] = useState<{
    email: string;
    code: string;
    type: 'verification' | 'password_reset';
  } | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log('Attempting login for:', email);
      
      const response = await apiService.login(email, password);
      
      if (response.success && response.data?.user) {
        setUser({
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.name,
          avatar: response.data.user.avatar || `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2`
        });
        setIsLoading(false);
        return true;
      } else if (response.error === 'EMAIL_NOT_VERIFIED') {
        console.log('User email not verified');
        setIsLoading(false);
        return 'unverified' as any;
      } else {
        console.log('Login failed:', response.error);
        alert(response.message || '邮箱或密码错误');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('登录失败，请稍后重试');
    }
    
    setIsLoading(false);
    return false;
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log('Attempting registration for:', email);
      
      const response = await apiService.register(email, password, name);
      
      if (response.success) {
        console.log('User registered successfully');
        setIsLoading(false);
        return true;
      } else {
        console.error('Registration failed:', response.error);
        alert(response.message || '注册失败，请稍后重试');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('注册失败，请稍后重试');
    }
    
    setIsLoading(false);
    return false;
  };

  const verifyEmail = async (email: string, code: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log('Verifying email for:', email, 'with code:', code);
      
      const response = await apiService.verifyEmail(email, code, 'verification');
      
      if (response.success && response.data?.user) {
        console.log('Email verified, logging in user');
        setUser({
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.name,
          avatar: response.data.user.avatar || `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2`
        });
        setIsLoading(false);
        return true;
      } else {
        console.log('Email verification failed:', response.error);
        alert(response.message || '验证码错误或已过期，请重新获取');
      }
    } catch (error) {
      console.error('Email verification error:', error);
      alert('验证失败，请稍后重试');
    }
    
    setIsLoading(false);
    return false;
  };

  const resendVerificationEmail = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log('Resending verification email to:', email);
      
      const response = await apiService.sendVerificationEmail(email, 'verification');
      
      if (response.success) {
        console.log('Verification email resent successfully');
        setIsLoading(false);
        return true;
      } else {
        console.error('Failed to resend verification email:', response.error);
        alert(response.message || '重发验证邮件失败');
      }
    } catch (error) {
      console.error('Resend verification email error:', error);
      alert(`重发验证邮件失败: ${error instanceof Error ? error.message : '未知错误'}`);
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
      
      const response = await apiService.googleLogin(code, 'state');
      
      if (response.success && response.data?.user) {
        setUser({
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.name,
          avatar: response.data.user.avatar
        });
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
    
    try {
      const response = await apiService.sendVerificationEmail(email, 'password_reset');
      
      if (response.success) {
        console.log('Password reset email sent successfully');
        setIsLoading(false);
        return true;
      } else {
        console.error('Failed to send password reset email:', response.error);
        alert(response.message || '发送重置邮件失败，请稍后重试');
      }
    } catch (error) {
      console.error('Send reset code error:', error);
      alert('发送重置邮件失败，请稍后重试');
    }
    
    setIsLoading(false);
    return false;
  };

  const verifyResetCode = async (email: string, code: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await apiService.verifyEmail(email, code, 'password_reset');
      setIsLoading(false);
      return response.success;
    } catch (error) {
      console.error('Verify reset code error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const resetPassword = async (email: string, newPassword: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await apiService.resetPassword(email, '', newPassword);
      
      if (response.success) {
        console.log('Password reset successfully');
        setIsLoading(false);
        return true;
      } else {
        alert(response.message || '密码重置失败，请稍后重试');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      alert('密码重置失败，请稍后重试');
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    apiService.logout();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      verifyEmail, 
      resendVerificationEmail,
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