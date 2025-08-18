import { supabase } from '../lib/supabase';

export interface VerificationCode {
  id: string;
  email: string;
  code: string;
  type: 'verification' | 'password_reset';
  expires_at: string;
  used: boolean;
  created_at: string;
}

// 存储验证码到数据库
export const storeVerificationCode = async (
  email: string, 
  code: string, 
  type: 'verification' | 'password_reset'
): Promise<boolean> => {
  try {
    if (!supabase) {
      console.error('Supabase not initialized');
      return false;
    }

    // 设置过期时间为10分钟后
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // 先删除该邮箱的旧验证码
    await supabase
      .from('verification_codes')
      .delete()
      .eq('email', email)
      .eq('type', type);

    // 插入新验证码
    const { error } = await supabase
      .from('verification_codes')
      .insert([{
        email,
        code,
        type,
        expires_at: expiresAt.toISOString(),
        used: false
      }]);

    if (error) {
      console.error('Error storing verification code:', error);
      return false;
    }

    return true;
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
    if (!supabase) {
      console.error('Supabase not initialized');
      return false;
    }

    // 查找验证码
    const { data, error } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('type', type)
      .eq('used', false)
      .single();

    if (error || !data) {
      console.error('Verification code not found or error:', error);
      return false;
    }

    // 检查是否过期
    const now = new Date();
    const expiresAt = new Date(data.expires_at);
    
    if (now > expiresAt) {
      console.error('Verification code expired');
      return false;
    }

    // 标记验证码为已使用
    const { error: updateError } = await supabase
      .from('verification_codes')
      .update({ used: true })
      .eq('id', data.id);

    if (updateError) {
      console.error('Error marking verification code as used:', updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Verify code error:', error);
    return false;
  }
};

// 清理过期的验证码
export const cleanupExpiredCodes = async (): Promise<void> => {
  try {
    if (!supabase) {
      return;
    }

    const now = new Date().toISOString();
    
    await supabase
      .from('verification_codes')
      .delete()
      .lt('expires_at', now);
      
  } catch (error) {
    console.error('Cleanup expired codes error:', error);
  }
};