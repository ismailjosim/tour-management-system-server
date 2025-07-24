/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import httpStatus from 'http-status-codes'
import { UserModel } from '../user/user.model'
import AppError from '../../errorHelpers/AppError'
import bcrypt from 'bcryptjs'

import { createNewAccessTokenWithRefreshToken } from '../../utils/userTokens'
import { JwtPayload } from 'jsonwebtoken'
import passwordHashing from '../../utils/passwordHashing'
import { IAuthProvider } from '../user/user.interface'

// const credentialsLogin = async (payload: Partial<IUser>) => {
// 	const { email, password } = payload

// 	// ✅ Check if user exists
// 	const isUserExist = await UserModel.findOne({ email })
// 	if (!isUserExist) {
// 		throw new AppError(httpStatus.BAD_REQUEST, "This user doesn't exist")
// 	}

// 	// 🔐 Verify password
// 	const isPasswordMatched = await bcrypt.compare(
// 		password as string,
// 		isUserExist.password as string,
// 	)
// 	if (!isPasswordMatched) {
// 		throw new AppError(httpStatus.BAD_REQUEST, 'Incorrect password')
// 	}

// 	// generate access & refresh Token
// 	const { accessToken, refreshToken } = createUserToken(isUserExist)

// 	// 🧼 Remove password before returning user data
// 	const userWithoutPassword = isUserExist.toObject()
// 	delete userWithoutPassword.password

// 	return {
// 		accessToken,
// 		refreshToken,
// 		user: userWithoutPassword,
// 	}
// }

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
const changePasswordIntoDB = async (
	oldPassword: string,
	newPassword: string,
	decodedToken: JwtPayload,
) => {
	return {}
}
const setPasswordIntoDB = async (userId: string, plainPassword: string) => {
	const user = await UserModel.findById(userId)
	if (!user) {
		throw new AppError(httpStatus.BAD_REQUEST, 'User not found')
	}

	// check user is google auth or not
	const checkGoogleAuth = user.auths.some(
		(providerObj) => (providerObj.provider = 'google'),
	)
	if (user.password && checkGoogleAuth) {
		// setup user new password
		throw new AppError(
			httpStatus.BAD_REQUEST,
			'Password is already set. change password if you forget your previous password',
		)
	}
	const passHashing = await passwordHashing(plainPassword)
	const credentialProvider: IAuthProvider = {
		provider: 'credentials',
		providerId: user.email,
	}
	const auths: IAuthProvider[] = [...user.auths, credentialProvider]
	user.password = passHashing
	user.auths = auths
	await user.save()
}

export const AuthServices = {
	getNewAccessToken,
	resetPasswordIntoDB,
	setPasswordIntoDB,
	changePasswordIntoDB,
}
