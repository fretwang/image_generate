import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { buildGoogleAuthUrl, storeState } from '../config/google';
import apiService from '../services/apiService';
import { logger } from '../utils/logger';

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
  isInitialized: boolean;
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
  const [isInitialized, setIsInitialized] = useState(false);
  const [isHandlingCallback, setIsHandlingCallback] = useState(false);
  const [pendingVerificationData, setPendingVerificationData] = useState<{
    email: string;
    code: string;
    type: 'verification' | 'password_reset';
  } | null>(null);

  // 初始化时检查是否有保存的token和用户状态
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const savedUser = localStorage.getItem('user_data');
        
        logger.info('初始化认证状态', { hasToken: !!token, hasSavedUser: !!savedUser });
        
        if (token && savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            logger.info('恢复用户状态', { userId: userData.id, email: userData.email });
            setUser(userData);
          } catch (error) {
            logger.error('解析保存的用户数据失败', error);
            // 清理无效数据
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
          }
        } else if (token) {
          // 有token但没有用户数据，尝试获取用户信息
          logger.info('有token但无用户数据，尝试获取用户信息');
          try {
            const response = await apiService.getUserProfile();
            if (response.success && response.data?.user) {
              const userData = {
                id: response.data.user.id,
                email: response.data.user.email,
                name: response.data.user.name,
                avatar: response.data.user.avatar || `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2`
              };
              setUser(userData);
              localStorage.setItem('user_data', JSON.stringify(userData));
              logger.info('成功获取用户信息', { userId: userData.id });
            } else {
              logger.warn('获取用户信息失败，清理token');
              localStorage.removeItem('auth_token');
            }
          } catch (error) {
            logger.error('获取用户信息出错，清理token', error);
            localStorage.removeItem('auth_token');
          }
        }
      } catch (error) {
        logger.error('初始化认证状态失败', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      logger.info('用户尝试登录', { email });
      
      const response = await apiService.login(email, password);
      
      if (response.success && response.data?.user) {
        logger.info('用户登录成功', { userId: response.data.user.id, email: response.data.user.email });
        setUser({
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.name,
          avatar: response.data.user.avatar || `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2`
        });
        setIsLoading(false);
        return true;
      } else if (response.error === 'EMAIL_NOT_VERIFIED') {
        logger.warn('用户邮箱未验证', { email });
        setIsLoading(false);
        return 'unverified' as any;
      } else {
        logger.error('用户登录失败', { email, error: response.error, message: response.message });
        alert(response.message || '邮箱或密码错误');
      }
    } catch (error) {
      logger.error('登录过程中发生错误', { email, error });
      alert('登录失败，请稍后重试');
    }
    
    setIsLoading(false);
    return false;
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      logger.info('用户尝试注册', { email, name });
      
      const response = await apiService.register(email, password, name);
      
      if (response.success) {
        logger.info('用户注册成功', { email, name });
        setIsLoading(false);
        return true;
      } else {
        logger.error('用户注册失败', { email, error: response.error, message: response.message });
        alert(response.message || '注册失败，请稍后重试');
      }
    } catch (error) {
      logger.error('注册过程中发生错误', { email, error });
      alert('注册失败，请稍后重试');
    }
    
    setIsLoading(false);
    return false;
  };

  const verifyEmail = async (email: string, code: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      logger.info('用户尝试验证邮箱', { email, code });
      
      const response = await apiService.verifyEmail(email, code, 'verification');
      
      if (response.success && response.data?.user) {
        logger.info('邮箱验证成功，用户自动登录', { userId: response.data.user.id, email: response.data.user.email });
        setUser({
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.name,
          avatar: response.data.user.avatar || `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2`
        });
        setIsLoading(false);
        return true;
      } else {
        logger.error('邮箱验证失败', { email, code, error: response.error, message: response.message });
        alert(response.message || '验证码错误或已过期，请重新获取');
      }
    } catch (error) {
      logger.error('邮箱验证过程中发生错误', { email, code, error });
      alert('验证失败，请稍后重试');
    }
    
    setIsLoading(false);
    return false;
  };

  const resendVerificationEmail = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      logger.info('重新发送验证邮件', { email });
      
      const response = await apiService.sendVerificationEmail(email, 'verification');
      
      if (response.success) {
        logger.info('验证邮件重发成功', { email });
        setIsLoading(false);
        return true;
      } else {
        logger.error('验证邮件重发失败', { email, error: response.error, message: response.message });
        alert(response.message || '重发验证邮件失败');
      }
    } catch (error) {
      logger.error('重发验证邮件过程中发生错误', { email, error });
      alert(`重发验证邮件失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
    
    setIsLoading(false);
    return false;
  };

  const googleLogin = async (): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      logger.logGoogleAuth('开始Google登录流程');
      
      // 检查Google配置
      if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
        logger.warn('Google Client ID未配置，使用模拟登录');
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

      logger.logGoogleAuth('构建Google OAuth URL');
      // 构建Google OAuth URL
      const authUrl = buildGoogleAuthUrl();
      const urlParams = new URLSearchParams(new URL(authUrl).search);
      const state = urlParams.get('state');
      
      if (state) {
        storeState(state);
        logger.logGoogleAuth('存储OAuth状态码', { state: state.substring(0, 10) + '...' });
      }
      
      logger.logGoogleAuth('重定向到Google OAuth', { url: authUrl.substring(0, 50) + '...' });
      // 重定向到Google OAuth
      window.location.href = authUrl;
      return true;
      
    } catch (error) {
      logger.logGoogleError('Google登录过程中发生错误', error);
      setIsLoading(false);
      return false;
    }
  };

  const handleGoogleCallback = async (code: string): Promise<boolean> => {
    // 防止重复调用
    if (isHandlingCallback) {
      logger.logGoogleAuth('Google回调已在处理中，跳过重复调用');
      return false;
    }

    setIsLoading(true);
    setIsHandlingCallback(true);
    
    try {
      logger.logGoogleAuth('处理Google OAuth回调', { code: code.substring(0, 20) + '...' });
      
      // 调用外部API处理Google OAuth
      const response = await apiService.googleLogin(code, '');
      
      if (response.success && response.data?.user) {
        logger.logGoogleAuth('Google登录成功', { userId: response.data.user.id, email: response.data.user.email });
        
        // 确保用户状态正确设置
        setUser({
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.name,
          avatar: response.data.user.avatar || `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2`
        });
        
        // 保存token到localStorage
        if (response.data.token) {
          localStorage.setItem('auth_token', response.data.token);
          logger.logGoogleAuth('保存认证token', { tokenLength: response.data.token.length });
        }
        
        // 清理URL参数
        window.history.replaceState({}, document.title, window.location.pathname);
        
        setIsLoading(false);
        setIsHandlingCallback(false);
        
        // 等待状态更新完成后再重新加载
        setTimeout(() => {
          window.location.reload();
        }, 100);
        
        return true;
      } else {
        logger.logGoogleError('Google登录失败', { error: response.error, message: response.message });
        alert(response.message || 'Google登录失败，请稍后重试');
        setIsLoading(false);
        setIsHandlingCallback(false);
        return false;
      }
      
    } catch (error) {
      logger.logGoogleError('Google OAuth回调处理失败', error);
      alert('Google登录失败，请稍后重试');
      setIsLoading(false);
      setIsHandlingCallback(false);
      return false;
    }
  };

  const sendResetCode = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      logger.info('发送密码重置邮件', { email });
      const response = await apiService.sendVerificationEmail(email, 'password_reset');
      
      if (response.success) {
        logger.info('密码重置邮件发送成功', { email });
        setIsLoading(false);
        return true;
      } else {
        logger.error('密码重置邮件发送失败', { email, error: response.error, message: response.message });
        alert(response.message || '发送重置邮件失败，请稍后重试');
      }
    } catch (error) {
      logger.error('发送密码重置邮件过程中发生错误', { email, error });
      alert('发送重置邮件失败，请稍后重试');
    }
    
    setIsLoading(false);
    return false;
  };

  const verifyResetCode = async (email: string, code: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      logger.info('验证密码重置验证码', { email, code });
      const response = await apiService.verifyEmail(email, code, 'password_reset');
      
      if (response.success) {
        logger.info('密码重置验证码验证成功', { email });
      } else {
        logger.error('密码重置验证码验证失败', { email, code, error: response.error });
      }
      
      setIsLoading(false);
      return response.success;
    } catch (error) {
      logger.error('验证密码重置验证码过程中发生错误', { email, code, error });
      setIsLoading(false);
      return false;
    }
  };

  const resetPassword = async (email: string, newPassword: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      logger.info('重置用户密码', { email });
      const response = await apiService.resetPassword(email, '', newPassword);
      
      if (response.success) {
        logger.info('密码重置成功', { email });
        setIsLoading(false);
        return true;
      } else {
        logger.error('密码重置失败', { email, error: response.error, message: response.message });
        alert(response.message || '密码重置失败，请稍后重试');
      }
    } catch (error) {
      logger.error('密码重置过程中发生错误', { email, error });
      alert('密码重置失败，请稍后重试');
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    logger.info('用户退出登录', { userId: user?.id, email: user?.email });
    setUser(null);
    localStorage.removeItem('user_data');
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
      isLoading,
      isInitialized
    }}>
      {children}
    </AuthContext.Provider>
  );
};