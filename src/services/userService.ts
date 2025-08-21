// 用户服务 - 现在使用外部API
import type { User } from '../lib/supabase';
import apiService from './apiService';

export interface CreateUserData {
  email: string;
  name: string;
  password_hash?: string;
  google_id?: string;
  avatar?: string;
  email_verified?: boolean;
}

export const userService = {
  // Create new user
  async createUser(userData: CreateUserData): Promise<User | null> {
    try {
      console.log('Creating user with external API:', { ...userData, password_hash: '[HIDDEN]' });
      
      const response = await apiService.register(userData.email, userData.password_hash || '', userData.name);
      
      if (response.success && response.data?.user) {
        return response.data.user;
      }
      
      return null;
    } catch (error) {
      console.error('Error in createUser:', error);
      return null;
    }
  },

  // Get user by email
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      console.log('Getting user by email via API:', email);
      
      // 这个功能现在通过登录API实现
      return null;
    } catch (error) {
      console.error('Error in getUserByEmail:', error);
      return null;
    }
  },

  // Get user by Google ID
  async getUserByGoogleId(googleId: string): Promise<User | null> {
    try {
      // 这个功能现在通过Google登录API实现
      return null;
    } catch (error) {
      console.error('Error in getUserByGoogleId:', error);
      return null;
    }
  },

  // Update user
  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      const response = await apiService.updateUserProfile(updates);
      
      if (response.success && response.data?.user) {
        return response.data.user;
      }
      
      return null;
    } catch (error) {
      console.error('Error in updateUser:', error);
      return null;
    }
  },

  // Verify email
  async verifyEmail(userId: string): Promise<boolean> {
    try {
      console.log('Email verification now handled by external API');
      return true;
    } catch (error) {
      console.error('Error in verifyEmail:', error);
      return false;
    }
  }
};