/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, RequestHandler, Response } from 'express'
import httpStatus from 'http-status-codes'
import { UserServices } from './user.service'
import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'

// const crateUser = async (req: Request, res: Response, next: NextFunction) => {
// 	try {
// 		const user = await UserServices.createUserIntoDB(req.body)

// 		res.status(httpStatus.CREATED).json({
// 			message: 'User created successfully',
// 			user,
// 		})
// 	} catch (err: any) {
// 		next(err)
// 	}
// }

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
		const result = await UserServices.getAllUsersFromDB()
		sendResponse(res, {
			success: true,
			statusCode: httpStatus.CREATED,
			message: 'User Created successfully',
			data: result.data,
			meta: result.meta,
		})
	},
)

export const UserControllers = {
	crateUser,
	getAllUsers,
}
