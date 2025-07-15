import httpStatus from 'http-status-codes'
import AppError from '../../errorHelpers/AppError'
import { IAuthProvider, IUser, Role } from './user.interface'
import { UserModel } from './user.model'
// import bcrypt from 'bcryptjs'
// import { environmentVariables } from '../../configs/env'
import passwordHashing from '../../utils/passwordHashing'
import { JwtPayload } from 'jsonwebtoken'

const createUserIntoDB = async (payload: Partial<IUser>) => {
	const { email, password, ...rest } = payload

	const isExist = await UserModel.findOne({ email })
	if (isExist) {
		throw new AppError(httpStatus.BAD_REQUEST, 'This user is already exist.')
	}

	const hashedPassword = await passwordHashing(password as string)

	const authProvider: IAuthProvider = {
		provider: 'credentials',
		providerId: email as string,
	}

	const user = await UserModel.create({
		email,
		password: hashedPassword,
		auths: [authProvider],
		...rest,
	})
	return user
}

const getAllUsersFromDB = async () => {
	const query = {}
	const users = await UserModel.find(query)
	const totalUsers = await UserModel.countDocuments()

	return {
		data: users,
		meta: {
			total: totalUsers,
		},
	}
}

const getSingleUserFromDB = async () => {
	return null
}

const updateUserIntoDB = async (
	userId: string,
	payload: Partial<IUser>,
	decodedToken: JwtPayload,
) => {
	// if user is not found
	const isUserExist = await UserModel.findById(userId)
	if (!isUserExist) {
		throw new AppError(httpStatus.NOT_FOUND, 'This User is not found')
	}

	/*
	 * email can't be updated
	 * name, phone, password can be updated by the user.role === 'USER'
	 * if password update => re-hashing the password
	 * role, isDeleted... => only admin and super_admin can update it.
	 * Prevent admin to promote => super_admin. only super_admin can promote super_admin
	 */

	// * update user role
	if (payload.role) {
		if (decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE) {
			throw new AppError(
				httpStatus.FORBIDDEN,
				'You are not authorized to this action',
			)
		}

		if (payload.role === Role.SUPER_ADMIN && decodedToken.role === Role.ADMIN) {
			throw new AppError(
				httpStatus.FORBIDDEN,
				'You are not authorized to this action FROM SECOND IF',
			)
		}
	}

	if (payload.isActive || payload.isDeleted || payload.isVerified) {
		if (decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE) {
			throw new AppError(
				httpStatus.FORBIDDEN,
				'You are not authorized to this action',
			)
		}
	}

	// update password
	if (payload.password) {
		payload.password = await passwordHashing(payload.password)
	}
	const newUpdatedUser = await UserModel.findByIdAndUpdate(userId, payload, {
		new: true,
		runValidators: true,
	})
	return newUpdatedUser
}

export const UserServices = {
	createUserIntoDB,
	getAllUsersFromDB,
	getSingleUserFromDB,
	updateUserIntoDB,
}
