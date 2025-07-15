import { environmentVariables } from '../configs/env'
import { IUser } from '../modules/user/user.interface'
import { generateToken } from './jwt'

const createUserToken = (user: Partial<IUser>) => {
	// 🧾 Payload for token
	const tokenPayload = {
		userId: user._id,
		email: user.email,
		role: user.role,
	}

	// 🔑 Generate access token
	const accessToken = generateToken(
		tokenPayload,
		environmentVariables.JWT_ACCESS_SECRET,
		environmentVariables.JWT_ACCESS_EXPIRES, // e.g., '15m'
	)

	// 🔄 Generate refresh token
	const refreshToken = generateToken(
		tokenPayload,
		environmentVariables.REFRESH_TOKEN_SECRET,
		environmentVariables.REFRESH_TOKEN_EXPIRES, // e.g., '7d'
	)

	return { accessToken, refreshToken }
}
export default createUserToken
