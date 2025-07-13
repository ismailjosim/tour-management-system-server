import httpStatus from 'http-status-codes'
import { IUser } from '../user/user.interface'
import { UserModel } from '../user/user.model'
import AppError from '../../errorHelpers/AppError'
import bcrypt from 'bcryptjs'
import { generateToken } from '../../utils/jwt'
import { environmentVariables } from '../../configs/env'
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

	const tokenPayload = {
		userId: isExist._id,
		email: isExist.email,
		role: isExist.role,
	}

	// const accessToken = JWT.sign(tokenPayload, 'ITS SECRET', { expiresIn: '1d' })
	const accessToken = generateToken(
		tokenPayload,
		environmentVariables.JWT_ACCESS_SECRET,
		environmentVariables.JWT_ACCESS_EXPIRES,
	)

	return {
		accessToken,
	}
}

export const AuthServices = {
	credentialsLogin,
}
