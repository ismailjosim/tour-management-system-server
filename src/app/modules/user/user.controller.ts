/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express'
import httpStatus from 'http-status-codes'
import { UserServices } from './user.service'

const crateUser = async (req: Request, res: Response) => {
	try {
		const user = await UserServices.createUserIntoDB(req.body)

		res.status(httpStatus.CREATED).json({
			message: 'User created successfully',
			user,
		})
	} catch (err: any) {
		res.status(httpStatus.BAD_REQUEST).json({
			message: `Error creating user: ${err.message}`,
		})
	}
}

export const UserControllers = {
	crateUser,
}
