/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, RequestHandler, Response } from 'express'
import httpStatus from 'http-status-codes'
import { UserServices } from './user.service'
import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import { JwtPayload } from 'jsonwebtoken'

const crateUser = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const result = await UserServices.createUserIntoDB(req.body)
		sendResponse(res, {
			success: true,
			statusCode: httpStatus.CREATED,
			message: 'User Created successfully',
			data: result,
		})
	},
)
const getAllUsers = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const result = await UserServices.getAllUsersFromDB(
			req.query as Record<string, string>,
		)
		sendResponse(res, {
			success: true,
			statusCode: httpStatus.CREATED,
			message: 'All User Retrieved successfully',
			data: result.data,
			meta: result.meta,
		})
	},
)
const getMe = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const decodedToken = req.user as JwtPayload
		const result = await UserServices.getMeFromDB(decodedToken.userId)
		sendResponse(res, {
			success: true,
			statusCode: httpStatus.CREATED,
			message: 'User info Retrieved successfully',
			data: result,
		})
	},
)
const getSingleUser = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const result = await UserServices.getSingleUserFromDB(req.params.id)
		sendResponse(res, {
			success: true,
			statusCode: httpStatus.CREATED,
			message: 'User Retrieved successfully',
			data: result,
		})
	},
)

const updateUser = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const userId = req.params.id
		const decodedToken = req.user as JwtPayload
		const payload = req.body
		const result = await UserServices.updateUserIntoDB(
			userId,
			payload,
			decodedToken,
		)
		sendResponse(res, {
			success: true,
			statusCode: httpStatus.CREATED,
			message: 'User Updated successfully',
			data: result,
		})
	},
)

export const UserControllers = {
	crateUser,
	getAllUsers,
	getSingleUser,
	updateUser,
	getMe,
}
