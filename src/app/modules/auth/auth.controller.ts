/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status-codes'
import { NextFunction, Request, Response } from 'express'
import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import { AuthServices } from './auth.service'
import AppError from '../../errorHelpers/AppError'

const credentialsLogin = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const loginInfo = await AuthServices.credentialsLogin(req.body)

		// send accessToken in cookies
		res.cookie('accessToken', loginInfo.accessToken, {
			httpOnly: true,
			secure: false,
		})
		// send refreshToken in cookies
		res.cookie('refreshToken', loginInfo.refreshToken, {
			httpOnly: true,
			secure: false,
		})

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
		res.cookie('accessToken', loginInfo.accessToken, {
			httpOnly: true,
			secure: false,
		})

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.CREATED,
			message: 'New Access Token Generate successfully',
			data: loginInfo,
		})
	},
)

export const AuthControllers = {
	credentialsLogin,
	getNewAccessToken,
}
