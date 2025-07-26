/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status-codes'
import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import { NextFunction, Request, Response } from 'express'
import { OTPServices } from './otp.service'

const sendOTP = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { name, email } = req.body
		await OTPServices.sendOTP(name, email)

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.CREATED,
			message: 'OTP Sent successfully',
			data: null,
		})
	},
)
const verifyOTP = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const result = null

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.CREATED,
			message: 'OTP Verified successfully',
			data: null,
		})
	},
)

export const OTPController = {
	sendOTP,
	verifyOTP,
}
