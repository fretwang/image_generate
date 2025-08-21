// 邮件服务 - 现在使用外部API
import apiService from './apiService';

export interface SendEmailRequest {
  to: string;
  type: 'verification' | 'password_reset';
  code: string;
  name?: string;
}

export interface SendEmailResponse {
  success: boolean;
  message: string;
  emailId?: string;
  error?: string;
}

// 生成6位随机验证码
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 发送邮件 (现在通过外部API)
export const sendEmail = async (request: SendEmailRequest): Promise<SendEmailResponse> => {
  try {
    console.log('Sending email request via external API:', { ...request, code: '[HIDDEN]' });

    const response = await apiService.sendVerificationEmail(request.to, request.type, request.name);
    
    return {
      success: response.success,
      message: response.message || 'Email sent successfully',
      error: response.error
    };
  } catch (error) {
    console.error('Email service error:', error);
    return {
      success: false,
      message: 'Failed to send email',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// 发送验证码邮件
export const sendVerificationEmail = async (email: string, name?: string): Promise<{ success: boolean; code?: string; error?: string }> => {
  try {
    console.log('Sending verification email via external API:', email);
    
    const response = await apiService.sendVerificationEmail(email, 'verification', name);
    
    if (response.success) {
      console.log('Verification email sent successfully');
      return { success: true };
    } else {
      console.error('Failed to send verification email:', response);
      return { success: false, error: response.error || response.message };
    }
  } catch (error) {
    console.error('Send verification email error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

// 发送密码重置邮件
export const sendPasswordResetEmail = async (email: string): Promise<{ success: boolean; code?: string; error?: string }> => {
  try {
    const response = await apiService.sendVerificationEmail(email, 'password_reset');
    
    if (response.success) {
      return { success: true };
    } else {
      return { success: false, error: response.error || response.message };
    }
  } catch (error) {
    console.error('Send password reset email error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};