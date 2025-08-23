import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import apiService from '../services/apiService';
import { logger } from '../utils/logger';

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
      
      // Load credits from API
      const creditsResponse = await apiService.getCreditsBalance();
      
      if (!creditsResponse.success) {
        logger.warn('积分加载失败', { error: creditsResponse.error });
        setCredits(0);
      } else if (creditsResponse.data) {
        logger.info('积分加载成功', { balance: creditsResponse.data.balance });
        setCredits(creditsResponse.data.balance);
      } else {
        setCredits(0);
      }

      // Load transactions from API
      const transactionsResponse = await apiService.getTransactions();
      
      if (!transactionsResponse.success) {
        logger.warn('交易记录加载失败', { error: transactionsResponse.error });
        setTransactions([]);
      } else if (transactionsResponse.data?.transactions) {
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

    try {
      // Recharge is now handled by your backend via Stripe webhooks
      // This function just triggers the Stripe checkout process
      logger.info('充值流程由后端和Stripe webhook处理', { amount, paymentMethod });
      return true;
    } catch (error) {
      logger.error('充值过程中发生错误', error);
      return false;
    }
  };

  const consume = (amount: number, description: string): boolean => {
    if (!user) return false;

    if (credits >= amount) {
      // Optimistically update UI
      setCredits(prev => prev - amount);
      
      // Update database via API in background
      apiService.consumeCredits(amount, description)
        .then((response) => {
          if (!response.success) {
            logger.error('消费积分失败', response.error);
            setCredits(prev => prev + amount);
            return;
          }
          
          // Add transaction to local state
          const transaction: Transaction = {
            id: Date.now().toString(),
            type: 'consume',
            amount: -amount,
            description,
            timestamp: new Date()
          };
          setTransactions(prev => [transaction, ...prev]);
          
          // Update credits with server response if available
          if (response.data?.new_balance !== undefined) {
            setCredits(response.data.new_balance);
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