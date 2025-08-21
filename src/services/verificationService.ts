// 验证服务 - 现在使用外部API
import apiService from './apiService';

export interface VerificationCode {
  id: string;
  email: string;
  code: string;
  type: 'verification' | 'password_reset';
  expires_at: string;
  used: boolean;
  created_at: string;
}

// 存储验证码到外部API
export const storeVerificationCode = async (
  email: string, 
  code: string, 
  type: 'verification' | 'password_reset'
): Promise<boolean> => {
  try {
    const response = await apiService.sendVerificationEmail(email, type);
    return response.success;
  } catch (error) {
    console.error('Store verification code error:', error);
    return false;
  }
};

// 验证验证码
export const verifyCode = async (
  email: string, 
  code: string, 
  type: 'verification' | 'password_reset'
): Promise<boolean> => {
  try {
    const response = await apiService.verifyEmail(email, code, type);
    return response.success;
  } catch (error) {
    console.error('Verify code error:', error);
    return false;
  }
};

// 清理过期的验证码 (现在由外部API处理)
export const cleanupExpiredCodes = async (): Promise<void> => {
  try {
    console.log('Expired codes cleanup handled by external API');
  } catch (error) {
    console.error('Cleanup expired codes error:', error);
  }
};