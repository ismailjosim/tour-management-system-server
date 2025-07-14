/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, RequestHandler, Response } from 'express'
import httpStatus from 'http-status-codes'
import { UserServices } from './user.service'
import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import { verifyToken } from '../../utils/jwt'
import { environmentVariables } from '../../configs/env'
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

const updateUser = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const userId = req.params.id
		const token = req.headers.authorization
		// verify token: method-01
		// const tokenVerify = verifyToken(
		// 	token as string,
		// 	environmentVariables.JWT_ACCESS_SECRET,
		// ) as JwtPayload

		// verify token: method-02
		const tokenVerify = req.body

		const payload = req.body

		const result = await UserServices.updateUserIntoDB(
			userId,
			payload,
			tokenVerify,
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
	updateUser,
}
