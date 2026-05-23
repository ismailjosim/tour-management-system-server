import { Response } from 'express';
import { environmentVariables } from '../configs/env';
import { tokenExpiryToMs } from './tokenExpiry';

export interface AuthToken {
  accessToken?: string;
  refreshToken?: string;
}

export const setAuthCookie = (res: Response, token: AuthToken) => {
  const isProduction = environmentVariables.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ('none' as const) : ('lax' as const),
    path: '/',
  };

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
