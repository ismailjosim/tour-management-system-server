/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status-codes'
import { Request, Response, NextFunction } from 'express'
import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import { BookingService } from './booking.service'
import { JwtPayload } from 'jsonwebtoken'

const createBooking = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const decodedToken = req.user as JwtPayload
		const result = await BookingService.createBookingIntoDB(
			req.body,
			decodedToken.userId,
		)

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.CREATED,
			message: 'Booking Created successfully',
			data: result,
		})
	},
)
const getAllBookings = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const result = await BookingService.getAllBookingFromDB()

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: 'Bookings Retrieved successfully',
			data: result,
		})
	},
)
const getUserBookings = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const result = await BookingService.getUserBookingFromDB()

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: 'Bookings Retrieved successfully',
			data: result,
		})
	},
)
const getSingleBooking = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const result = await BookingService.getSingleBookingFromDB()

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: 'Booking Retrieved successfully',
			data: result,
		})
	},
)
const updateBookingStatus = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const result = await BookingService.updateBookingStatusIntoDB()

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: 'Booking Status Updated successfully',
			data: result,
		})
	},
)

export const BookingController = {
	createBooking,
	getAllBookings,
	getUserBookings,
	getSingleBooking,
	updateBookingStatus,
}
