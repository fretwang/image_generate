import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import apiService from '../services/apiService';

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
      
      // Load credits
      const creditsResponse = await apiService.getCreditsBalance();
      if (creditsResponse.success && creditsResponse.data) {
        logger.info('积分加载成功', { balance: creditsResponse.data.balance });
        setCredits(creditsResponse.data.balance);
      } else {
        logger.warn('积分加载失败', { error: creditsResponse.error, message: creditsResponse.message });
        // 不要因为积分加载失败就清除用户状态
        setCredits(0);
      }

      // Load transactions
      const transactionsResponse = await apiService.getTransactions();
      if (transactionsResponse.success && transactionsResponse.data) {
        logger.info('交易记录加载成功', { count: transactionsResponse.data.transactions.length });
        const formattedTransactions: Transaction[] = transactionsResponse.data.transactions.map((t: any) => ({
          id: t.id,
          type: t.type,
          amount: t.amount,
          description: t.description,
          timestamp: new Date(t.created_at)
        }));
        setTransactions(formattedTransactions);
      } else {
        logger.warn('交易记录加载失败', { error: transactionsResponse.error, message: transactionsResponse.message });
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
      
      const response = await apiService.rechargeCredits(amount, paymentMethod);
      
      if (response.success) {
        // Reload user data to get updated credits and transactions
        await loadUserData();
      }
      
      setIsProcessing(false);
      return response.success;
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
      apiService.consumeCredits(amount, description)
        .then(response => {
          if (response.success) {
            // Add transaction to local state
            const transaction: Transaction = {
              id: Date.now().toString(),
              type: 'consume',
              amount: -amount,
              description,
              timestamp: new Date()
            };
            setTransactions(prev => [transaction, ...prev]);
          } else {
            // Revert optimistic update if failed
            setCredits(prev => prev + amount);
          }
        })
        .catch(error => {
          console.error('Consume credits error:', error);
          // Revert optimistic update
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