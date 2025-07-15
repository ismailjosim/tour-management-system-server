/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status-codes'
import { NextFunction, Request, Response } from 'express'
import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import { AuthServices } from './auth.service'
import AppError from '../../errorHelpers/AppError'
import { setAuthCookie } from '../../utils/setCookie'

const credentialsLogin = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const loginInfo = await AuthServices.credentialsLogin(req.body)

		// * set token access and refresh
		setAuthCookie(res, loginInfo)

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.CREATED,
			message: 'User login successfully',
			data: loginInfo,
		})
	},
)

const getNewAccessToken = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const refreshToken = req.cookies.refreshToken
		// const refreshToken = req.headers.authorization as string

		// show error message if refreshToken is not available
		if (!refreshToken) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				'No Refresh Token received for cookies',
			)
		}

		const loginInfo = await AuthServices.getNewAccessToken(refreshToken)

		// send accessToken in cookies
		// res.cookie('accessToken', loginInfo.accessToken, {
		// 	httpOnly: true,
		// 	secure: false,
		// })
		setAuthCookie(res, loginInfo)

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.CREATED,
			message: 'New Access Token Generate successfully',
			data: {
				accessToken: loginInfo.accessToken,
			},
		})
	},
)

const logout = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		// ❌ Clear access token cookie
		res.clearCookie('accessToken', {
			httpOnly: true,
			secure: false, // ✅ Set to true in production (HTTPS)
			sameSite: 'lax',
		})

		// ❌ Clear refresh token cookie
		res.clearCookie('refreshToken', {
			httpOnly: true,
			secure: false,
			sameSite: 'lax',
		})

		// ✅ Send logout confirmation
		sendResponse(res, {
			success: true,
			statusCode: httpStatus.CREATED,
			message: 'User Logged Out Successfully',
			data: null,
		})
	},
)

export const AuthControllers = {
	credentialsLogin,
	getNewAccessToken,
	logout,
}
