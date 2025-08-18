import React, { createContext, useContext, useState, ReactNode } from 'react';
import { buildGoogleAuthUrl, storeState } from '../config/google';
import { exchangeCodeForTokens, getUserInfo, verifyIdToken } from '../services/googleAuth';
import { userService } from '../services/userService';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService';
import { storeVerificationCode, verifyCode } from '../services/verificationService';
import { supabase } from '../lib/supabase';
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
      
      // Get user from database
      const dbUser = await userService.getUserByEmail(email);
      console.log('User found:', !!dbUser);
      
      if (dbUser && dbUser.email_verified) {
        console.log('User verified, setting user state');
        setUser({
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          avatar: dbUser.avatar || `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2`
        });
        setIsLoading(false);
        return true;
      } else if (dbUser && !dbUser.email_verified) {
        console.log('User found but not verified');
        // 返回特殊状态，让前端处理未验证的情况
        setIsLoading(false);
        return 'unverified' as any; // 返回特殊状态
      } else {
        console.log('User not found or invalid credentials');
        alert('邮箱或密码错误');
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
      
      // Check if user already exists
      const existingUser = await userService.getUserByEmail(email);
      if (existingUser) {
        console.error('User already exists');
        alert('该邮箱已被注册');
        setIsLoading(false);
        return false;
      }

      console.log('Creating new user...');
      // Create new user
      const newUser = await userService.createUser({
        email,
        name,
        password_hash: password, // In production, hash this password
        email_verified: false
      });

      if (newUser) {
        console.log('User created successfully:', newUser.id);
        setIsLoading(false);
        // Send verification email
        const emailResult = await sendVerificationEmail(email, name);
        
        if (emailResult.success && emailResult.code) {
          // Store verification code in database
          await storeVerificationCode(email, emailResult.code, 'verification');
          console.log('Verification email sent successfully');
        } else {
          console.error('Failed to send verification email:', emailResult.error);
          alert('注册成功，但发送验证邮件失败。请稍后重试。');
        }
        
        return true;
      } else {
        console.error('Failed to create user');
        alert('注册失败，请稍后重试');
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
      
      // Verify code against database
      const isValidCode = await verifyCode(email, code, 'verification');
      
      if (isValidCode) {
        const dbUser = await userService.getUserByEmail(email);
        if (dbUser) {
          console.log('Verifying user email in database...');
          // Verify email in database
          const success = await userService.verifyEmail(dbUser.id);
          
          if (!success) {
            console.error('Failed to verify email in database');
            alert('验证失败，请稍后重试');
            setIsLoading(false);
            return false;
          }
          
          console.log('Email verified, logging in user');
          setUser({
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            avatar: dbUser.avatar || `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2`
          });
          setIsLoading(false);
          return true;
        }
      } else {
        console.log('Invalid verification code');
        alert('验证码错误或已过期，请重新获取');
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
      // Check if user exists
      const user = await userService.getUserByEmail(email);
      if (!user) {
        alert('该邮箱未注册');
        setIsLoading(false);
        return false;
      }

      if (user.email_verified) {
        alert('该邮箱已经验证过了，可以直接登录');
        setIsLoading(false);
        return false;
      }

      // Send verification email
      const emailResult = await sendVerificationEmail(email, user.name);
      
      if (emailResult.success && emailResult.code) {
        // Store verification code in database
        await storeVerificationCode(email, emailResult.code, 'verification');
        console.log('Verification email resent successfully');
        setIsLoading(false);
        return true;
      } else {
        console.error('Failed to resend verification email:', emailResult.error);
        alert('重发验证邮件失败，请稍后重试');
      }
    } catch (error) {
      console.error('Resend verification email error:', error);
      alert('重发验证邮件失败，请稍后重试');
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
    
    try {
      // Check if user exists
      const user = await userService.getUserByEmail(email);
      if (!user) {
        alert('该邮箱未注册');
        setIsLoading(false);
        return false;
      }

      // Send password reset email
      const emailResult = await sendPasswordResetEmail(email);
      
      if (emailResult.success && emailResult.code) {
        // Store verification code in database
        await storeVerificationCode(email, emailResult.code, 'password_reset');
        console.log('Password reset email sent successfully');
        setIsLoading(false);
        return true;
      } else {
        console.error('Failed to send password reset email:', emailResult.error);
        alert('发送重置邮件失败，请稍后重试');
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
      // Verify code against database
      const isValidCode = await verifyCode(email, code, 'password_reset');
      setIsLoading(false);
      return isValidCode;
    } catch (error) {
      console.error('Verify reset code error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const resetPassword = async (email: string, newPassword: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Get user by email
      const user = await userService.getUserByEmail(email);
      if (!user) {
        alert('用户不存在');
        setIsLoading(false);
        return false;
      }

      // Update password (in production, hash the password)
      const success = await userService.updateUser(user.id, {
        password_hash: newPassword
      });

      if (success) {
        console.log('Password reset successfully');
        setIsLoading(false);
        return true;
      } else {
        alert('密码重置失败，请稍后重试');
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