import { Response } from 'express';
import { environmentVariables } from '../configs/env';
import { tokenExpiryToMs } from './tokenExpiry';

export interface AuthToken {
  accessToken?: string;
  refreshToken?: string;
}

export const isProductionRuntime = () =>
  environmentVariables.NODE_ENV === 'production' || process.env.VERCEL === '1';

export const authCookieOptions = () => {
  const isProduction = isProductionRuntime();

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ('none' as const) : ('lax' as const),
    path: '/',
  };
};

export const setAuthCookie = (res: Response, token: AuthToken) => {
  const cookieOptions = authCookieOptions();

  if (token.accessToken) {
    res.cookie('accessToken', token.accessToken, {
      ...cookieOptions,
      maxAge: tokenExpiryToMs(environmentVariables.JWT_ACCESS_EXPIRES, 24 * 60 * 60 * 1000),
    });
  }
  if (token.refreshToken) {
    res.cookie('refreshToken', token.refreshToken, {
      ...cookieOptions,
      maxAge: tokenExpiryToMs(environmentVariables.REFRESH_TOKEN_EXPIRES, 7 * 24 * 60 * 60 * 1000),
    });
  }
};
