/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status-codes'
import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import { NextFunction, Request, Response } from 'express'
import { StatsService } from './stats.service'

const getUserStats = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const result = await StatsService.getUserStatsFromDB()
		sendResponse(res, {
			success: true,
			statusCode: httpStatus.CREATED,
			message: 'All User Stats Retrieved Successfully',
			data: result,
		})
	},
)

const getTourStats = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const result = await StatsService.getTourStatsFromDB()

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.CREATED,
			message: 'All Tour Stats Retrieved Successfully',
			data: result,
		})
	},
)

const getBookingStats = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const result = await StatsService.getBookingStatsFromDB()

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.CREATED,
			message: 'All Booking Stats Retrieved Successfully',
			data: result,
		})
	},
)

const getPaymentStats = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const result = await StatsService.getPaymentStatsFromDB()
		sendResponse(res, {
			success: true,
			statusCode: httpStatus.CREATED,
			message: 'All Payment Stats Retrieved Successfully',
			data: result,
		})
	},
)

export const StatsController = {
	getBookingStats,
	getPaymentStats,
	getUserStats,
	getTourStats,
}
