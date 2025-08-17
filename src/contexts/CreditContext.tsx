import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  const [credits, setCredits] = useState(100); // Start with 100 credits
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'recharge',
      amount: 100,
      description: 'Initial bonus credits',
      timestamp: new Date()
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  const recharge = async (amount: number, paymentMethod: string): Promise<boolean> => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const creditsToAdd = amount * 10; // 1 yuan = 10 credits
    setCredits(prev => prev + creditsToAdd);
    
    const transaction: Transaction = {
      id: Date.now().toString(),
      type: 'recharge',
      amount: creditsToAdd,
      description: `Recharged ¥${amount} via ${paymentMethod}`,
      timestamp: new Date()
    };
    
    setTransactions(prev => [transaction, ...prev]);
    setIsProcessing(false);
    return true;
  };

  const consume = (amount: number, description: string): boolean => {
    if (credits >= amount) {
      setCredits(prev => prev - amount);
      
      const transaction: Transaction = {
        id: Date.now().toString(),
        type: 'consume',
        amount: -amount,
        description,
        timestamp: new Date()
      };
      
      setTransactions(prev => [transaction, ...prev]);
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