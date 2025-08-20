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
      // Load credits
      const creditsResponse = await apiService.getCreditsBalance();
      if (creditsResponse.success && creditsResponse.data) {
        setCredits(creditsResponse.data.balance);
      }

      // Load transactions
      const transactionsResponse = await apiService.getTransactions();
      if (transactionsResponse.success && transactionsResponse.data) {
        const formattedTransactions: Transaction[] = transactionsResponse.data.transactions.map((t: any) => ({
          id: t.id,
          type: t.type,
          amount: t.amount,
          description: t.description,
          timestamp: new Date(t.created_at)
        }));
        setTransactions(formattedTransactions);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
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