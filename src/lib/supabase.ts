// 移除Supabase配置，改为使用外部API

// Database types (保留类型定义)
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  google_id?: string;
  password_hash?: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Credits {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'recharge' | 'consume';
  amount: number;
  description: string;
  payment_method?: string;
  created_at: string;
}