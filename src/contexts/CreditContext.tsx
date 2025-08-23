import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

interface Transaction {
  id: string;
  type: 'recharge' | 'consume';
  amount: number;
  description: string;
  timestamp: Date;
}

interface CreditContextType {
  credits: number;
  transactions: Transaction[];
  recharge: (amount: number, paymentMethod: string) => Promise<boolean>;
  consume: (amount: number, description: string) => boolean;
  isProcessing: boolean;
}

const CreditContext = createContext<CreditContextType | undefined>(undefined);

export const useCredit = () => {
  const context = useContext(CreditContext);
  if (context === undefined) {
    throw new Error('useCredit must be used within a CreditProvider');
  }
  return context;
};

export const CreditProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [credits, setCredits] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();

  // Load user credits and transactions when user changes
  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      setCredits(0);
      setTransactions([]);
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      logger.info('开始加载用户积分和交易数据', { userId: user.id });
      
      // Load credits from Supabase
      const { data: creditsData, error: creditsError } = await supabase
        .from('credits')
        .select('balance')
        .eq('user_id', user.id)
        .maybeSingle();

      if (creditsError) {
        logger.warn('积分加载失败', { error: creditsError });
        setCredits(0);
      } else if (creditsData) {
        logger.info('积分加载成功', { balance: creditsData.balance });
        setCredits(creditsData.balance);
      } else {
        // Create initial credits record if it doesn't exist
        const { error: createError } = await supabase
          .from('credits')
          .insert({ user_id: user.id, balance: 0 });
        
        if (createError) {
          logger.error('创建积分记录失败', createError);
        }
        setCredits(0);
      }

      // Load transactions from Supabase
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (transactionsError) {
        logger.warn('交易记录加载失败', { error: transactionsError });
        setTransactions([]);
      } else if (transactionsData) {
        logger.info('交易记录加载成功', { count: transactionsData.length });
        const formattedTransactions: Transaction[] = transactionsData.map((t: any) => ({
          id: t.id,
          type: t.type,
          amount: t.amount,
          description: t.description,
          timestamp: new Date(t.created_at)
        }));
        setTransactions(formattedTransactions);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      logger.error('加载用户数据时发生错误', error);
      // 不要因为数据加载失败就影响用户登录状态
      setCredits(0);
      setTransactions([]);
    }
  };

  const recharge = async (amount: number, paymentMethod: string): Promise<boolean> => {
    if (!user) return false;

    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // This is now handled by Stripe webhooks
      // For demo purposes, we'll simulate a successful recharge
      const creditsToAdd = amount * 10; // 1 dollar = 10 credits
      
      // Update credits in Supabase
      const { error: updateError } = await supabase
        .from('credits')
        .update({ balance: credits + creditsToAdd })
        .eq('user_id', user.id);

      if (updateError) {
        logger.error('更新积分失败', updateError);
        setIsProcessing(false);
        return false;
      }

      // Add transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'recharge',
          amount: creditsToAdd,
          description: `Recharged ${creditsToAdd} credits via ${paymentMethod}`,
          payment_method: paymentMethod
        });

      if (transactionError) {
        logger.error('添加交易记录失败', transactionError);
      }

      // Reload user data
      await loadUserData();
      
      setIsProcessing(false);
      return true;
    } catch (error) {
      console.error('Recharge error:', error);
      setIsProcessing(false);
      return false;
    }
  };

  const consume = (amount: number, description: string): boolean => {
    if (!user) return false;

    if (credits >= amount) {
      // Optimistically update UI
      setCredits(prev => prev - amount);
      
      // Update database in background
      supabase
        .from('credits')
        .update({ balance: credits - amount })
        .eq('user_id', user.id)
        .then(({ error: updateError }) => {
          if (updateError) {
            logger.error('消费积分失败', updateError);
            setCredits(prev => prev + amount);
            return;
          }

          // Add transaction record
          return supabase
            .from('transactions')
            .insert({
              user_id: user.id,
              type: 'consume',
              amount: -amount,
              description
            });
        })
        .then((result) => {
          if (result && result.error) {
            logger.error('添加消费记录失败', result.error);
          } else {
            // Add transaction to local state
            const transaction: Transaction = {
              id: Date.now().toString(),
              type: 'consume',
              amount: -amount,
              description,
              timestamp: new Date()
            };
            setTransactions(prev => [transaction, ...prev]);
          }
        })
        .catch(error => {
          logger.error('消费积分过程中发生错误', error);
          setCredits(prev => prev + amount);
        });
      
      return true;
    }
    return false;
  };

  return (
    <CreditContext.Provider value={{ credits, transactions, recharge, consume, isProcessing }}>
      {children}
    </CreditContext.Provider>
  );
};