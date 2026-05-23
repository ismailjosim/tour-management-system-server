/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status-codes';
import { NextFunction, Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AuthServices } from './auth.service';
import AppError from '../../errorHelpers/AppError';
import { setAuthCookie } from '../../utils/setCookie';
import { JwtPayload } from 'jsonwebtoken';
import { createUserToken } from '../../utils/userTokens';
import { environmentVariables } from '../../configs/env';
import passport from 'passport';
import { verifyToken } from '../../utils/jwt';

// googleCallbackController
const googleCallbackController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let redirectTo = req.query.state ? (req.query.state as string) : '';

    if (redirectTo.startsWith('/')) {
      redirectTo = redirectTo.slice(1);
    }

    const user = req.user;
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'User Not Found');
    }
    const token = createUserToken(user);
    setAuthCookie(res, token);

    res.redirect(`${environmentVariables.FRONTEND_URL}/${redirectTo}`);
  }
);

// credentialsLogin
const credentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // const loginInfo = await AuthServices.credentialsLogin(req.body)

  passport.authenticate('local', async (err: any, user: any, info: any) => {
    if (err) {
      //! this don't work
      // return new AppError(httpStatus.BAD_REQUEST, err)

      // * to do that
      // return next(err) //* way-01
      return next(new AppError(httpStatus.BAD_REQUEST, err)); //* way-2: this is organized way.
    }

    if (!user) {
      return next(new AppError(httpStatus.UNAUTHORIZED, info?.message));
    }

    // generate access & refresh Token
    const tokens = createUserToken(user);

    // 🧼 Remove password before returning user data
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    // * set token access and refresh
    setAuthCookie(res, tokens);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: 'User login successfully',
      data: {
        user: userWithoutPassword,
      },
    });
  })(req, res, next);
});

// getNewAccessToken
const getNewAccessToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies.refreshToken;
  // const refreshToken = req.headers.authorization as string

  // show error message if refreshToken is not available
  if (!refreshToken) {
    throw new AppError(httpStatus.BAD_REQUEST, 'No Refresh Token received for cookies');
  }

  const loginInfo = await AuthServices.getNewAccessToken(refreshToken);

  // send accessToken in cookies
  // res.cookie('accessToken', loginInfo.accessToken, {
  // 	httpOnly: true,
  // 	secure: false,
  // })
  setAuthCookie(res, loginInfo);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'New Access Token Generate successfully',
    data: null,
  });
});

// user logout
const logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // ✅ Clear access token cookie
  const isProduction = environmentVariables.NODE_ENV === 'production';

  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: isProduction, // ✅ Set to true in production (HTTPS)
    sameSite: isProduction ? 'none' : 'lax',
    path: '/', // ✅ Ensure cookie is cleared from all paths
  });

  // ✅ Clear refresh token cookie
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/', // ✅ Ensure cookie is cleared from all paths
  });

  // ✅ Send logout confirmation
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User Logged Out Successfully',
    data: null,
  });
});

// section: Password change, forget, reset and set

//* if a logged in your want to change password
const changePassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const newPassword = req.body.newPassword;
  const oldPassword = req.body.oldPassword;
  const decodedToken = req.user;

  await AuthServices.changePasswordIntoDB(oldPassword, newPassword, decodedToken as JwtPayload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Password reset Successfully',
    data: null,
  });
});

//* if a google login in user want to set a password
const setPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { password } = req.body;
  const decodedToken = req.user as JwtPayload;

  await AuthServices.setPasswordIntoDB(decodedToken.userId, password);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Password set Successfully',
    data: null,
  });
});

// user forget password but not currently logged in
const forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;
  await AuthServices.forgotPasswordIntoDB(email);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Email sent Successfully',
    data: null,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body;
  const token = req.headers.authorization || payload.token;

  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Reset token is required');
  }

  const decodedToken = verifyToken(
    token.startsWith('Bearer ') ? token.slice(7) : token,
    environmentVariables.JWT_ACCESS_SECRET
  );

  await AuthServices.resetPasswordIntoDB(payload, decodedToken as JwtPayload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Password reset Successfully',
    data: null,
  });
});

export const AuthControllers = {
  credentialsLogin,
  getNewAccessToken,
  logout,
  resetPassword,
  changePassword,
  setPassword,
  forgotPassword,
  googleCallbackController,
};
