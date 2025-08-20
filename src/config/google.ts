// Google OAuth 配置
export const GOOGLE_CONFIG = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  redirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI || window.location.origin,
  scope: 'openid email profile',
  responseType: 'code',
  accessType: 'offline',
  prompt: 'consent'
};

// Google OAuth URLs
export const GOOGLE_OAUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
export const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
export const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

// 构建Google OAuth授权URL
export const buildGoogleAuthUrl = (): string => {
  const params = new URLSearchParams({
    client_id: GOOGLE_CONFIG.clientId,
    redirect_uri: GOOGLE_CONFIG.redirectUri,
    scope: GOOGLE_CONFIG.scope,
    response_type: GOOGLE_CONFIG.responseType,
    access_type: GOOGLE_CONFIG.accessType,
    prompt: GOOGLE_CONFIG.prompt,
    state: generateRandomState()
  });

  return `${GOOGLE_OAUTH_URL}?${params.toString()}`;
};

// 生成随机状态码用于安全验证
const generateRandomState = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// 验证状态码
export const validateState = (receivedState: string): boolean => {
  const storedState = sessionStorage.getItem('google_oauth_state');
  return storedState === receivedState;
};

// 存储状态码
export const storeState = (state: string): void => {
  sessionStorage.setItem('google_oauth_state', state);
};