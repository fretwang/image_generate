import React, { useState, useRef, useEffect } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { sendVerificationEmail } from '../services/emailService';
import { storeVerificationCode } from '../services/verificationService';

interface VerificationCodeInputProps {
  onComplete: (code: string) => void;
  onResend?: () => void;
  email: string;
  name?: string;
}

const VerificationCodeInput: React.FC<VerificationCodeInputProps> = ({
  onComplete,
  onResend,
  email,
  name
}) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if code is complete
    if (newCode.every(digit => digit !== '') && newCode.join('').length === 6) {
      onComplete(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newCode = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
    setCode(newCode);
    
    if (newCode.every(digit => digit !== '')) {
      onComplete(newCode.join(''));
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    
    try {
      if (onResend) {
        await onResend();
      } else {
        // Default resend logic for verification emails
        const emailResult = await sendVerificationEmail(email, name);
        
        if (emailResult.success && emailResult.code) {
          await storeVerificationCode(email, emailResult.code, 'verification');
          console.log('Verification email resent successfully');
        } else {
          console.error('Failed to resend verification email:', emailResult.error);
          alert('重发邮件失败，请稍后重试');
        }
      }
    } catch (error) {
      console.error('Resend error:', error);
      alert('重发邮件失败，请稍后重试');
    }
    
    setIsResending(false);
    setCountdown(60);
    setCanResend(false);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-gray-600 mb-4">请输入6位验证码</p>
        
        <div className="flex justify-center space-x-3 mb-6" onPaste={handlePaste}>
          {code.map((digit, index) => (
            <input
              key={index}
              ref={el => inputRefs.current[index] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(index, e.target.value)}
              onKeyDown={e => handleKeyDown(index, e)}
              className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors"
            />
          ))}
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-500 mb-3">
          没有收到验证码？
        </p>
        
        <button
          onClick={handleResend}
          disabled={!canResend || isResending}
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {isResending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          <span>
            {canResend ? '重新发送' : `重新发送 (${countdown}s)`}
          </span>
        </button>
      </div>

      <div className="text-xs text-center">
        <p className="text-gray-500 mb-2">验证码已发送至 {email}</p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
          <p className="text-blue-700 font-medium">邮件提示：</p>
          <p className="text-blue-600">请检查您的邮箱（包括垃圾邮件文件夹）</p>
        </div>
      </div>
    </div>
  );
};

export default VerificationCodeInput;