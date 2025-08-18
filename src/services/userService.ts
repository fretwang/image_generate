import { supabase } from '../lib/supabase';
import type { User } from '../lib/supabase';

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
      console.log('Creating user with data:', { ...userData, password_hash: '[HIDDEN]' });
      
      // Generate a UUID for the new user
      const userId = crypto.randomUUID();
      const userDataWithId = { ...userData, id: userId };
      
      const { data, error } = await supabase
        .from('users')
        .insert([userDataWithId])
        .select()
        .single();

      if (error) {
        console.error('Error creating user:', error);
        console.error('Error details:', error.message, error.details, error.hint);
        return null;
      }

      console.log('User created, creating credits record...');
      // Create initial credits record
      const { error: creditsError } = await supabase
        .from('credits')
        .insert([{
          user_id: userId,
          balance: 100 // Initial bonus credits
        }]);

      if (creditsError) {
        console.error('Error creating credits:', creditsError);
      }

      console.log('Creating initial transaction...');
      // Create initial transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          user_id: userId,
          type: 'recharge',
          amount: 100,
          description: 'Initial bonus credits'
        }]);

      if (transactionError) {
        console.error('Error creating transaction:', transactionError);
      }

      return data;
    } catch (error) {
      console.error('Error in createUser:', error);
      return null;
    }
  },

  // Get user by email
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      console.log('Getting user by email:', email);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // PGRST116 is "not found" error
          console.error('Error getting user by email:', error);
        }
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserByEmail:', error);
      return null;
    }
  },

  // Get user by Google ID
  async getUserByGoogleId(googleId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('google_id', googleId)
        .single();

      if (error) {
        console.error('Error getting user by Google ID:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserByGoogleId:', error);
      return null;
    }
  },

  // Update user
  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateUser:', error);
      return null;
    }
  },

  // Verify email
  async verifyEmail(userId: string): Promise<boolean> {
    try {
      console.log('Verifying email for user:', userId);
      
      const { error } = await supabase
        .from('users')
        .update({ email_verified: true })
        .eq('id', userId);

      if (error) {
        console.error('Error verifying email:', error);
        return false;
      }

      console.log('Email verified successfully');
      return true;
    } catch (error) {
      console.error('Error in verifyEmail:', error);
      return false;
    }
  }
};