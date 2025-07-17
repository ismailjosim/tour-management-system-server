/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status-codes'
import { NextFunction, Request, Response } from 'express'
import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import { TourServices } from './tour.service'

// * Tour Type controller
const crateTourType = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const result = await TourServices.createTourTypeIntoDB(req.body)
		sendResponse(res, {
			success: true,
			statusCode: httpStatus.CREATED,
			message: 'Tour Type Crated successfully',
			data: result,
		})
	},
)
const getAllTourType = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const result = await TourServices.getAllTourTypeFromDB()
		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: 'All Tour Type Retried successfully',
			data: result.data,
			meta: result.meta,
		})
	},
)

export const TourControllers = {
	crateTourType,
	getAllTourType,
}
