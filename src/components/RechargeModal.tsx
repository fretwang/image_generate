import React, { useState } from 'react';
import { X } from 'lucide-react';
import StripeCheckout from './StripeCheckout';

interface RechargeModalProps {
  onClose: () => void;
}

const RechargeModal: React.FC<RechargeModalProps> = ({ onClose }) => {
  return <StripeCheckout onClose={onClose} />;
};

export default RechargeModal;