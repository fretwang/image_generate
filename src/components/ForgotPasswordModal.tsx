import React, { useState } from 'react';
import { X, Mail, Lock, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import VerificationCodeInput from './VerificationCodeInput';

interface ForgotPasswordModalProps {
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ onClose }) => {
  const [step, setStep] = useState<'email' | 'verify' | 'reset' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const { sendResetCode, verifyResetCode, resetPassword, isLoading } = useAuth();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await sendResetCode(email);
    if (success) {
      setStep('verify');
    }
  };

  const handleVerifyCode = async (code: string) => {
    const success = await verifyResetCode(email, code);
    if (success) {
      setStep('reset');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setPasswordError('两次输入的密码不一致');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('密码长度至少6位');
      return;
    }
    
    setPasswordError('');
    const success = await resetPassword(email, newPassword);
    if (success) {
      setStep('success');
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'email':
        return (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                邮箱地址
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="请输入注册邮箱"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>发送中...</span>
                </div>
              ) : (
                '发送验证码'
              )}
            </button>
          </form>
        );

      case 'verify':
        return (
          <VerificationCodeInput
            onComplete={handleVerifyCode}
            onResend={() => sendResetCode(email)}
            email={email}
          />
        );

      case 'reset':
        return (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                新密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="请输入新密码"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    passwordError ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                确认新密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="请再次输入新密码"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    passwordError ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  required
                />
              </div>
            </div>

            {passwordError && (
              <div className="text-red-600 text-sm flex items-center space-x-1">
                <span>⚠️</span>
                <span>{passwordError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>重置中...</span>
                </div>
              ) : (
                '重置密码'
              )}
            </button>
          </form>
        );

      case 'success':
        return (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">密码重置成功</h3>
            <p className="text-gray-600">您的密码已成功重置，请使用新密码登录</p>
          </div>
        );

      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (step) {
      case 'email':
        return '忘记密码';
      case 'verify':
        return '验证邮箱';
      case 'reset':
        return '重置密码';
      case 'success':
        return '重置成功';
      default:
        return '忘记密码';
    }
  };

  const getDescription = () => {
    switch (step) {
      case 'email':
        return '请输入您的注册邮箱，我们将发送验证码';
      case 'verify':
        return `验证码已发送至 ${email}`;
      case 'reset':
        return '请设置您的新密码';
      case 'success':
        return '';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{getTitle()}</h2>
            {getDescription() && (
              <p className="text-sm text-gray-600 mt-1">{getDescription()}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;