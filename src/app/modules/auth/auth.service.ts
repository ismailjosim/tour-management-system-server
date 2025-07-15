/* eslint-disable @typescript-eslint/no-non-null-assertion */
import httpStatus from 'http-status-codes'
import { IUser } from '../user/user.interface'
import { UserModel } from '../user/user.model'
import AppError from '../../errorHelpers/AppError'
import bcrypt from 'bcryptjs'

import {
	createNewAccessTokenWithRefreshToken,
	createUserToken,
} from '../../utils/userTokens'
import { JwtPayload } from 'jsonwebtoken'
import passwordHashing from '../../utils/passwordHashing'

const credentialsLogin = async (payload: Partial<IUser>) => {
	const { email, password } = payload

	// ✅ Check if user exists
	const isUserExist = await UserModel.findOne({ email })
	if (!isUserExist) {
		throw new AppError(httpStatus.BAD_REQUEST, "This user doesn't exist")
	}

	// 🔐 Verify password
	const isPasswordMatched = await bcrypt.compare(
		password as string,
		isUserExist.password as string,
	)
	if (!isPasswordMatched) {
		throw new AppError(httpStatus.BAD_REQUEST, 'Incorrect password')
	}

	// generate access & refresh Token
	const { accessToken, refreshToken } = createUserToken(isUserExist)

	// 🧼 Remove password before returning user data
	const userWithoutPassword = isUserExist.toObject()
	delete userWithoutPassword.password

	return {
		accessToken,
		refreshToken,
		user: userWithoutPassword,
	}
}
const getNewAccessToken = async (refreshToken: string) => {
	const newAccessToken = await createNewAccessTokenWithRefreshToken(
		refreshToken,
	)

	return {
		accessToken: newAccessToken,
	}
}
const resetPasswordIntoDB = async (
	oldPassword: string,
	newPassword: string,
	decodedToken: JwtPayload,
) => {
	const user = await UserModel.findById(decodedToken.userId)
	const isOldPasswordMatch = await bcrypt.compare(
		oldPassword,
		user!.password as string,
	)
	if (!isOldPasswordMatch) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Old Password doesn't match")
	}
	user!.password = await passwordHashing(newPassword)
	user!.save()
}

export const AuthServices = {
	credentialsLogin,
	getNewAccessToken,
	resetPasswordIntoDB,
}
