import httpStatus from 'http-status-codes'
import AppError from '../../errorHelpers/AppError'
import { IAuthProvider, IUser } from './user.interface'
import { UserModel } from './user.model'
import bcrypt from 'bcryptjs'
import { environmentVariables } from '../../configs/env'

const createUserIntoDB = async (payload: Partial<IUser>) => {
	const { email, password, ...rest } = payload

	const isExist = await UserModel.findOne({ email })
	if (isExist) {
		throw new AppError(httpStatus.BAD_REQUEST, 'This user is already exist.')
	}

	const hashedPassword = await bcrypt.hash(
		password as string,
		Number(environmentVariables.BCRYPT_SALT_ROUND),
	)

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

const createSingleUserFromDB = async () => {
	return null
}

export const UserServices = {
	createUserIntoDB,
	getAllUsersFromDB,
	createSingleUserFromDB,
}
