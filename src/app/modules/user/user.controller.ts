/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express'
import httpStatus from 'http-status-codes'
import { UserServices } from './user.service'

const crateUser = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user = await UserServices.createUserIntoDB(req.body)

		res.status(httpStatus.CREATED).json({
			message: 'User created successfully',
			user,
		})
	} catch (err: any) {
		next(err)
	}
}

export const UserControllers = {
	crateUser,
}
