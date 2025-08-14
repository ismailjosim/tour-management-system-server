/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-non-null-assertion */
import httpStatus from 'http-status-codes'
import { UserModel } from '../user/user.model'
import AppError from '../../errorHelpers/AppError'
import bcrypt from 'bcryptjs'

import { createNewAccessTokenWithRefreshToken } from '../../utils/userTokens'
import { JwtPayload } from 'jsonwebtoken'
import passwordHashing from '../../utils/passwordHashing'
import { IAuthProvider, IsActive } from '../user/user.interface'
import jwt from 'jsonwebtoken'
import { environmentVariables } from '../../configs/env'
import { sendMail } from '../../utils/sendEmail'

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
const changePasswordIntoDB = async (
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
	// check the old password and new password are same
	if (oldPassword === newPassword) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			'New Password must be different from Old Password',
		)
	}
	// password can't be incudes user email
	if (newPassword.includes(user!.email)) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			'Password can not includes user email',
		)
	}

	user!.password = await passwordHashing(newPassword)
	await user!.save()
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

const forgotPasswordIntoDB = async (email: string) => {
	const isUserExist = await UserModel.findOne({ email })
	if (!isUserExist) {
		throw new AppError(httpStatus.BAD_REQUEST, "This user doesn't exist")
	}
	if (
		isUserExist.isActive === IsActive.BLOCKED ||
		isUserExist.isActive === IsActive.INACTIVE
	) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			`User is ${isUserExist.isActive}`,
		)
	}
	if (isUserExist.isDeleted) {
		throw new AppError(httpStatus.BAD_REQUEST, 'user is removed')
	}

	if (!isUserExist.isVerified) {
		throw new AppError(httpStatus.BAD_REQUEST, 'user is not verified')
	}
	const jwtPayload = {
		userId: isUserExist._id,
		email: isUserExist.email,
		role: isUserExist.role,
	}

	const resetToken = jwt.sign(
		jwtPayload,
		environmentVariables.JWT_ACCESS_SECRET,
		{
			expiresIn: '10m',
		},
	)
	const resetUILink = `${environmentVariables.FRONTEND_URL}/reset-password?id=${isUserExist._id}&token=${resetToken}`

	sendMail({
		to: isUserExist.email,
		subject: 'Password Reset',
		templateName: 'forgetPassword',
		templateData: {
			name: isUserExist.name,
			resetUILink,
		},
	})

	// http://localhost:3000/reset-password?id=68834d631567f07b17974762&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODgzNGQ2MzE1NjdmMDdiMTc5NzQ3NjIiLCJlbWFpbCI6Im1kamFzaW0ucGhAZ21haWwuY29tIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3NTM1Mjk1MTYsImV4cCI6MTc1MzUzMDExNn0.6EwtnsSGMutZTv6Ip787IXbeoVUoJOAeokSoRUNJp2I
}
const resetPasswordIntoDB = async (
	payload: Record<string, any>,
	decodedToken: JwtPayload,
) => {
	if (payload.id !== decodedToken.userId) {
		throw new AppError(401, "you don't have permission to change this password")
	}

	const isUserExist = await UserModel.findById(decodedToken.userId)

	if (!isUserExist) {
		throw new AppError(401, "This uer doesn't Exist!")
	}

	isUserExist!.password = await passwordHashing(payload.newPassword)
	await isUserExist!.save()
}
export const AuthServices = {
	getNewAccessToken,
	resetPasswordIntoDB,
	setPasswordIntoDB,
	forgotPasswordIntoDB,
	changePasswordIntoDB,
}
