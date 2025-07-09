/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express'
import { UserModel } from './user.model'
import httpStatus from 'http-status-codes'

const crateUser = async (req: Request, res: Response) => {
	try {
		const { name, email } = req.body
		const user = await UserModel.create({
			name,
			email,
		})
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
