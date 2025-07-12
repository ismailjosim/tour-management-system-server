import httpStatus from 'http-status-codes'
import { IUser } from '../user/user.interface'
import { UserModel } from '../user/user.model'
import AppError from '../../errorHelpers/AppError'
import bcrypt from 'bcryptjs'
const credentialsLogin = async (payload: Partial<IUser>) => {
	const { email, password } = payload
	const isExist = await UserModel.findOne({ email })
	if (!isExist) {
		throw new AppError(httpStatus.BAD_REQUEST, "This User Don't Exist")
	}

	const isPasswordMatched = await bcrypt.compare(
		password as string,
		isExist.password as string,
	)
	if (!isPasswordMatched) {
		throw new AppError(httpStatus.BAD_REQUEST, 'Incorrect Password')
	}

	return {
		email: isExist.email,
	}
}

export const AuthServices = {
	credentialsLogin,
}
