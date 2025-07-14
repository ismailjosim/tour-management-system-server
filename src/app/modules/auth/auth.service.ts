import httpStatus from 'http-status-codes'
import { IsActive, IUser } from '../user/user.interface'
import { UserModel } from '../user/user.model'
import AppError from '../../errorHelpers/AppError'
import bcrypt from 'bcryptjs'
// import { generateToken } from '../../utils/jwt'
// import { environmentVariables } from '../../configs/env'
import createUserToken from '../../utils/userTokens'
import { generateToken, verifyToken } from '../../utils/jwt'
import { environmentVariables } from '../../configs/env'
import { JwtPayload } from 'jsonwebtoken'

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
const getNewAccessToken = async (ParamsRefreshToken: string) => {
	const verifyRefreshToken = verifyToken(
		ParamsRefreshToken,
		environmentVariables.REFRESH_TOKEN_SECRET,
	) as JwtPayload

	// ✅ Check if user exists
	const isUserExist = await UserModel.findOne({
		email: verifyRefreshToken.email,
	})
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

	// 🧾 Payload for token
	const tokenPayload = {
		userId: isUserExist._id,
		email: isUserExist.email,
		role: isUserExist.role,
	}

	// 🔑 Generate access token
	const accessToken = generateToken(
		tokenPayload,
		environmentVariables.JWT_ACCESS_SECRET,
		environmentVariables.JWT_ACCESS_EXPIRES, // e.g., '15m'
	)

	return {
		accessToken,
	}
}

export const AuthServices = {
	credentialsLogin,
	getNewAccessToken,
}
