import { Response } from 'express';
// import { environmentVariables } from '../configs/env'

export interface AuthToken {
  accessToken?: string;
  refreshToken?: string;
}

export const setAuthCookie = (res: Response, token: AuthToken) => {
  if (token.accessToken) {
    res.cookie('accessToken', token.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
  }
  if (token.refreshToken) {
    res.cookie('refreshToken', token.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
  }
};
