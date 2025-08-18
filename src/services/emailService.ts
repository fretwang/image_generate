import { supabase } from '../lib/supabase';

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

// 发送邮件
export const sendEmail = async (request: SendEmailRequest): Promise<SendEmailResponse> => {
  try {

    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to send email');
    }

    return result;
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
    const code = generateVerificationCode();
    
    const result = await sendEmail({
      to: email,
      type: 'verification',
      code,
      name
    });

    if (result.success) {
      return { success: true, code };
    } else {
      return { success: false, error: result.error || result.message };
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
    const code = generateVerificationCode();
    
    const result = await sendEmail({
      to: email,
      type: 'password_reset',
      code
    });

    if (result.success) {
      return { success: true, code };
    } else {
      return { success: false, error: result.error || result.message };
    }
  } catch (error) {
    console.error('Send password reset email error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};