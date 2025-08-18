import { GOOGLE_TOKEN_URL, GOOGLE_USERINFO_URL, GOOGLE_CONFIG } from '../config/google';

export interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
  id_token: string;
}

export interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

// 使用授权码换取访问令牌
export const exchangeCodeForTokens = async (code: string): Promise<GoogleTokenResponse> => {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: GOOGLE_CONFIG.clientId,
      client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
      code,
      grant_type: 'authorization_code',
      redirect_uri: GOOGLE_CONFIG.redirectUri,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Token exchange failed: ${error.error_description || error.error}`);
  }

  return response.json();
};

// 获取用户信息
export const getUserInfo = async (accessToken: string): Promise<GoogleUserInfo> => {
  const response = await fetch(`${GOOGLE_USERINFO_URL}?access_token=${accessToken}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to get user info: ${error.error_description || error.error}`);
  }

  return response.json();
};

// 验证ID Token (简化版本，生产环境建议使用jwt库)
export const verifyIdToken = (idToken: string): any => {
  try {
    // 解码JWT payload (不验证签名，仅用于演示)
    const payload = JSON.parse(atob(idToken.split('.')[1]));
    
    // 基本验证
    if (payload.aud !== GOOGLE_CONFIG.clientId) {
      throw new Error('Invalid audience');
    }
    
    if (payload.exp < Date.now() / 1000) {
      throw new Error('Token expired');
    }
    
    return payload;
  } catch (error) {
    throw new Error(`Invalid ID token: ${error}`);
  }
};