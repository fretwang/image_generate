// 积分服务 - 现在使用外部API
import type { Credits, Transaction } from '../lib/supabase';
import apiService from './apiService';

export const creditService = {
  // Get user credits
  async getUserCredits(userId: string): Promise<number> {
    try {
      const response = await apiService.getCreditsBalance();
      
      if (response.success && response.data) {
        return response.data.balance || 0;
      }
      
      return 0;
    } catch (error) {
      console.error('Error in getUserCredits:', error);
      return 0;
    }
  },

  // Get user transactions
  async getUserTransactions(userId: string): Promise<Transaction[]> {
    try {
      const response = await apiService.getTransactions();
      
      if (response.success && response.data?.transactions) {
        return response.data.transactions;
      }
      
      return [];
    } catch (error) {
      console.error('Error in getUserTransactions:', error);
      return [];
    }
  },

  // Recharge credits
  async rechargeCredits(userId: string, amount: number, paymentMethod: string): Promise<boolean> {
    try {
      const response = await apiService.rechargeCredits(amount, paymentMethod);
      return response.success;
    } catch (error) {
      console.error('Error in rechargeCredits:', error);
      return false;
    }
  },

  // Consume credits
  async consumeCredits(userId: string, amount: number, description: string): Promise<boolean> {
    try {
      const response = await apiService.consumeCredits(amount, description);
      return response.success;
    } catch (error) {
      console.error('Error in consumeCredits:', error);
      return false;
    }
  }
};