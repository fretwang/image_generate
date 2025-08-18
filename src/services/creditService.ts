import { supabase } from '../lib/supabase';
import type { Credits, Transaction } from '../lib/supabase';

// Check if supabase is available
const checkSupabase = () => {
  if (!supabase) {
    console.error('Supabase not initialized');
    return false;
  }
  return true;
};

export const creditService = {
  // Get user credits
  async getUserCredits(userId: string): Promise<number> {
    if (!checkSupabase()) return 0;
    
    try {
      const { data, error } = await supabase
        .from('credits')
        .select('balance')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error getting user credits:', error);
        return 0;
      }

      return data?.balance || 0;
    } catch (error) {
      console.error('Error in getUserCredits:', error);
      return 0;
    }
  },

  // Get user transactions
  async getUserTransactions(userId: string): Promise<Transaction[]> {
    if (!checkSupabase()) return [];
    
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting user transactions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserTransactions:', error);
      return [];
    }
  },

  // Recharge credits
  async rechargeCredits(userId: string, amount: number, paymentMethod: string): Promise<boolean> {
    if (!checkSupabase()) return false;
    
    try {
      // Start a transaction
      const { data: currentCredits, error: fetchError } = await supabase
        .from('credits')
        .select('balance')
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        console.error('Error fetching current credits:', fetchError);
        return false;
      }

      const creditsToAdd = amount * 10; // 1 yuan = 10 credits
      const newBalance = (currentCredits?.balance || 0) + creditsToAdd;

      // Update credits balance
      const { error: updateError } = await supabase
        .from('credits')
        .update({ balance: newBalance })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating credits:', updateError);
        return false;
      }

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          user_id: userId,
          type: 'recharge',
          amount: creditsToAdd,
          description: `Recharged ¥${amount} via ${paymentMethod}`,
          payment_method: paymentMethod
        }]);

      if (transactionError) {
        console.error('Error creating transaction:', transactionError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in rechargeCredits:', error);
      return false;
    }
  },

  // Consume credits
  async consumeCredits(userId: string, amount: number, description: string): Promise<boolean> {
    if (!checkSupabase()) return false;
    
    try {
      // Get current credits
      const { data: currentCredits, error: fetchError } = await supabase
        .from('credits')
        .select('balance')
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        console.error('Error fetching current credits:', fetchError);
        return false;
      }

      const currentBalance = currentCredits?.balance || 0;
      
      if (currentBalance < amount) {
        console.error('Insufficient credits');
        return false;
      }

      const newBalance = currentBalance - amount;

      // Update credits balance
      const { error: updateError } = await supabase
        .from('credits')
        .update({ balance: newBalance })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating credits:', updateError);
        return false;
      }

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          user_id: userId,
          type: 'consume',
          amount: -amount,
          description: description
        }]);

      if (transactionError) {
        console.error('Error creating transaction:', transactionError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in consumeCredits:', error);
      return false;
    }
  }
};