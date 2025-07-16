/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status-codes'
import { NextFunction, Request, Response } from 'express'
import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import { AuthServices } from './auth.service'
import AppError from '../../errorHelpers/AppError'
import { setAuthCookie } from '../../utils/setCookie'
import { JwtPayload } from 'jsonwebtoken'
import { createUserToken } from '../../utils/userTokens'
import { environmentVariables } from '../../configs/env'

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

const resetPassword = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const newPassword = req.body.newPassword
		const oldPassword = req.body.oldPassword
		const decodedToken = req.user

		await AuthServices.resetPasswordIntoDB(
			oldPassword,
			newPassword,
			decodedToken as JwtPayload,
		)

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: 'Password reset Successfully',
			data: null,
		})
	},
)
const googleCallbackController = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		let redirectTo = req.query.state ? (req.query.state as string) : ''

		if (redirectTo.startsWith('/')) {
			redirectTo = redirectTo.slice(1)
		}

		const user = req.user
		// console.log(user)
		if (!user) {
			throw new AppError(httpStatus.NOT_FOUND, 'User Not Found')
		}
		const token = createUserToken(user)
		setAuthCookie(res, token)

		res.redirect(`${environmentVariables.FRONTEND_URL}/${redirectTo}`)
	},
)

// after user successfully login via google if he want to navigate to a route then we can do that
// for frontend part: http://localhost:5000/login?redirect=/booking [for example booking]
// for backend res.redirect(`${environmentVariables.FRONTEND_URL}`/booking)

export const AuthControllers = {
	credentialsLogin,
	getNewAccessToken,
	logout,
	resetPassword,
	googleCallbackController,
}
