import httpStatus from 'http-status-codes'
import AppError from '../../errorHelpers/AppError'
import { IAuthProvider, IUser, Role } from './user.interface'
import { UserModel } from './user.model'
import passwordHashing from '../../utils/passwordHashing'
import { JwtPayload } from 'jsonwebtoken'
import { QueryBuilder } from '../../utils/QueryBuilder'
import { userSearchableFields } from './user.constant'

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
	const userWithoutPassword = user.toObject()
	delete userWithoutPassword.password

	return userWithoutPassword
}

const getAllUsersFromDB = async (query: Record<string, string>) => {
	const queryBuilder = new QueryBuilder(UserModel.find(), query)
	const users = queryBuilder
		.search(userSearchableFields)
		.filter()
		.sort()
		.fields()
		.paginate()
	const [data, meta] = await Promise.all([
		users.build(),
		queryBuilder.getMeta(),
	])
	return {
		data,
		meta,
	}
}
const getMeFromDB = async (userId: string) => {
	const data = await UserModel.findById(userId).select('-password')
	return data
}

const getSingleUserFromDB = async (id: string) => {
	const user = await UserModel.findById(id).select('-password')
	return user
}

const updateUserIntoDB = async (
	userId: string,
	payload: Partial<IUser>,
	decodedToken: JwtPayload,
) => {
	// Normal user/guide → only update his info
	if (decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE) {
		if (userId !== decodedToken.userId) {
			throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized')
		}

		// Only update specific field
		const allowedFields = ['name', 'phone', 'profileImage', 'address']
		const invalidFields = Object.keys(payload).filter(
			(field) => !allowedFields.includes(field),
		)
		if (invalidFields.length > 0) {
			throw new AppError(
				httpStatus.FORBIDDEN,
				'You are not authorized to update these fields',
			)
		}
	}

	const isUserExist = await UserModel.findById(userId)
	if (!isUserExist) {
		throw new AppError(httpStatus.NOT_FOUND, 'This User is not found')
	}

	// Super Admin protection
	if (
		decodedToken.role !== Role.ADMIN &&
		isUserExist.role === Role.SUPER_ADMIN
	) {
		throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized')
	}

	// role update only for Admin/Super Admin
	if (payload.role) {
		if (decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE) {
			throw new AppError(
				httpStatus.FORBIDDEN,
				'You are not authorized to update role',
			)
		}
	}

	// sensitive flags update protection
	if (payload.isActive || payload.isDeleted || payload.isVerified) {
		if (decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE) {
			throw new AppError(
				httpStatus.FORBIDDEN,
				'You are not authorized to update system fields',
			)
		}
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
	getMeFromDB,
}
/*
 * email can't be updated
 * name, phone, password can be updated by the user.role === 'USER'
 * if password update => re-hashing the password
 * role, isDeleted... => only admin and super_admin can update it.
 * Prevent admin to promote => super_admin. only super_admin can promote super_admin
 */
