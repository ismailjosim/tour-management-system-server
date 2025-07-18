/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status-codes'
import { NextFunction, Request, Response } from 'express'
import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import { TourServices } from './tour.service'

const crateTour = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const result = await TourServices.createTourIntoDB(req.body)

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.CREATED,
			message: 'Tour Created successfully',
			data: result,
		})
	},
)

const getAllTour = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const result = await TourServices.getAllTourFromDB()
		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: 'All Tour Retried successfully',
			data: result.data,
			meta: result.meta,
		})
	},
)

// * Tour Type controller
const crateTourType = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const result = await TourServices.createTourTypeIntoDB(req.body)
		sendResponse(res, {
			success: true,
			statusCode: httpStatus.CREATED,
			message: 'Tour Type Created successfully',
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
const updateTourType = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const result = await TourServices.updateTourTypeIntoDB(
			req.params.id,
			req.body,
		)
		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: `Tour Type successfully Update to ${req.body.name}`,
			data: result,
		})
	},
)
const deleteTourType = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const result = await TourServices.deleteTourTypeFromDB(req.params.id)
		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: `Tour Type ${result?.name} Deleted successfully`,
			data: result,
		})
	},
)

export const TourControllers = {
	crateTour,
	getAllTour,
	crateTourType,
	getAllTourType,
	updateTourType,
	deleteTourType,
}
