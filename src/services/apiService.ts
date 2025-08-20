// API服务配置和通用请求方法
import { logger } from '../utils/logger';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: any;
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.loadToken();
  }

  private loadToken() {
    this.token = localStorage.getItem('auth_token');
  }

  private saveToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  private removeToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    logger.logApiCall(options.method || 'GET', endpoint, options.body ? JSON.parse(options.body as string) : undefined);
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        logger.logApiError(options.method || 'GET', endpoint, { status: response.status, data });
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      logger.debug(`API请求成功: ${options.method || 'GET'} ${endpoint}`, { status: response.status });
      return data;
    } catch (error) {
      logger.logApiError(options.method || 'GET', endpoint, error);
      throw error;
    }
  }

  // 认证相关接口
  async register(email: string, password: string, name: string) {
    return this.request<{ user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string) {
    const response = await this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.success && response.data?.token) {
      this.saveToken(response.data.token);
    }
    
    return response;
  }

  async googleLogin(code: string, state: string) {
    // 直接调用外部API而不是内部API
    const url = `https://fretwang.com/api/auth/google?code=${encodeURIComponent(code)}`;
    
    logger.logApiCall('GET', url);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        logger.logApiError('GET', url, { status: response.status, data });
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      logger.debug(`Google OAuth API请求成功`, { status: response.status });
      
      // 如果返回了token，保存它
      if (data.success && data.data?.token) {
        this.saveToken(data.data.token);
      }
      
      return data;
    } catch (error) {
      logger.logApiError('GET', url, error);
      throw error;
    }
  }

  async sendVerificationEmail(email: string, type: 'verification' | 'password_reset', name?: string) {
    return this.request('/auth/send-verification', {
      method: 'POST',
      body: JSON.stringify({ email, type, name }),
    });
  }

  async verifyEmail(email: string, code: string, type: 'verification' | 'password_reset') {
    const response = await this.request<{ user: any; token?: string }>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, code, type }),
    });
    
    if (response.success && response.data?.token) {
      this.saveToken(response.data.token);
    }
    
    return response;
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, code, new_password: newPassword }),
    });
  }

  // 用户信息接口
  async getUserProfile() {
    return this.request<{ user: any }>('/user/profile');
  }

  async updateUserProfile(updates: { name?: string; avatar?: string }) {
    return this.request<{ user: any }>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // 积分系统接口
  async getCreditsBalance() {
    return this.request<{ balance: number; user_id: string }>('/credits/balance');
  }

  async getTransactions(page = 1, limit = 20) {
    return this.request<{ transactions: any[]; total: number; page: number; limit: number }>(
      `/credits/transactions?page=${page}&limit=${limit}`
    );
  }

  async rechargeCredits(amount: number, paymentMethod: string) {
    return this.request<{ 
      transaction_id: string; 
      credits_added: number; 
      new_balance: number; 
      payment_url?: string 
    }>('/credits/recharge', {
      method: 'POST',
      body: JSON.stringify({ amount, payment_method: paymentMethod }),
    });
  }

  async consumeCredits(amount: number, description: string) {
    return this.request<{ transaction_id: string; new_balance: number }>('/credits/consume', {
      method: 'POST',
      body: JSON.stringify({ amount, description }),
    });
  }

  // AI图片生成接口
  async generateImages(
    prompt: string, 
    style: string, 
    transparent: boolean, 
    count = 4
  ) {
    return this.request<{
      images: any[];
      credits_consumed: number;
      remaining_credits: number;
    }>('/images/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt, style, transparent, count }),
    });
  }

  async getImageHistory(page = 1, limit = 20) {
    return this.request<{
      history: any[];
      total: number;
      page: number;
      limit: number;
    }>(`/images/history?page=${page}&limit=${limit}`);
  }

  // 登出
  logout() {
    this.removeToken();
  }
}

export const apiService = new ApiService();
export default apiService;