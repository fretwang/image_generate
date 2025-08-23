import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Mail, Lock, User, Sparkles, Eye, EyeOff } from 'lucide-react';
import GoogleLoginButton from './GoogleLoginButton';
import VerificationCodeInput from './VerificationCodeInput';
import ForgotPasswordModal from './ForgotPasswordModal';

const Login: React.FC = () => {
  const { t } = useLanguage();
  const [mode, setMode] = useState<'login' | 'register' | 'verify' | 'unverified'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  
  const { login, register, verifyEmail, resendVerificationEmail, googleLogin, isLoading } = useAuth();

  const validatePasswords = () => {
    if (mode === 'register' && password !== confirmPassword) {
      setPasswordError(t.login.passwordMismatch);
      return false;
    }
    if (mode === 'register' && password.length < 6) {
      setPasswordError(t.login.passwordTooShort);
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'register' && !validatePasswords()) {
      return;
    }
    
    if (mode === 'login') {
      const result = await login(email, password);
      if (result === 'unverified' as any) {
        setUnverifiedEmail(email);
        setMode('unverified');
      }
    } else if (mode === 'register') {
      const success = await register(email, password, name);
      if (success) {
        setPendingEmail(email);
        setMode('verify');
      }
    }
  };

  const handleVerificationComplete = async (code: string) => {
    const success = await verifyEmail(pendingEmail, code);
    if (success) {
      setMode('login');
      setPendingEmail('');
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (passwordError) {
      setPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (passwordError) {
      setPasswordError('');
    }
  };

  const handleResendVerification = async () => {
    const success = await resendVerificationEmail(unverifiedEmail);
    if (success) {
      setPendingEmail(unverifiedEmail);
      setMode('verify');
    }
  };

  const handleGoogleLogin = async () => {
    await googleLogin();
  };

  if (mode === 'verify') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{t.login.title}</h1>
            <p className="text-gray-600">{t.login.subtitle}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <VerificationCodeInput
              onComplete={handleVerificationComplete}
              email={pendingEmail}
              name={name}
            />
            
            <button
              onClick={() => setMode('register')}
              className="w-full mt-4 text-gray-500 hover:text-gray-700 text-sm"
            >
              {t.login.backToRegister}
            </button>
            
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'unverified') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{t.login.emailNotVerified}</h1>
            <p className="text-gray-600">{t.login.emailNotVerifiedDescription}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 font-medium mb-2">{t.login.accountStatus}</p>
                <p className="text-yellow-700 text-sm">
                  {t.login.email} <span className="font-medium">{unverifiedEmail}</span> {t.login.emailNeedsVerification}
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleResendVerification}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? t.login.sending : t.login.resendVerificationEmail}
                </button>

                <button
                  onClick={() => setMode('login')}
                  className="w-full py-3 text-gray-600 hover:text-gray-800 font-medium"
                >
                  {t.login.backToLogin}
                </button>
              </div>

              <div className="text-xs text-gray-500 space-y-2">
                <p>💡 {t.login.emailTips}</p>
                <p>{t.login.checkSpam}</p>
                <p>{t.login.validFor10Minutes}</p>
                <p>{t.login.noEmailReceived}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">AI Art Studio</h1>
          <p className="text-gray-600">Create stunning images with AI</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex mb-6">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-center rounded-lg transition-colors ${
                mode === 'login'
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.login.login}
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-2 text-center rounded-lg transition-colors ${
                mode === 'register'
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.login.register}
            </button>
          </div>

          {/* Google Login */}
          <GoogleLoginButton onClick={handleGoogleLogin} isLoading={isLoading} />
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">{t.login.orUseEmail}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t.login.name}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            )}
            
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder={t.login.email}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={t.login.password}
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  passwordError ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {mode === 'register' && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder={t.login.confirmPassword}
                  value={confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    passwordError ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            )}

            {passwordError && (
              <div className="text-red-600 text-sm flex items-center space-x-1">
                <span>⚠️</span>
                <span>{passwordError}</span>
              </div>
            )}

            {mode === 'login' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {t.login.forgotPassword}
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? t.login.processing : (mode === 'login' ? t.login.login : t.login.register)}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            {t.login.useRealEmail}
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />
      )}
    </div>
  );
};

export default Login;