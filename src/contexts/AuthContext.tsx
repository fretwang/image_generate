import React, { createContext, useContext, useState, ReactNode } from 'react';

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
    // Simulate Google OAuth flow
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock successful Google login
    setUser({
      id: 'google-1',
      email: 'user@gmail.com',
      name: 'Google User',
      avatar: `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2`
    });
    
    setIsLoading(false);
    return true;
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