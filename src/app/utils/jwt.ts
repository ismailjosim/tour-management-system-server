import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken'

export const generateToken = (
	payload: JwtPayload,
	secret: string,
	expiresIn: string,
) => {
	const tokenSignature = jwt.sign(payload, secret, { expiresIn } as SignOptions)
	return tokenSignature
}

export const verifyToken = (token: string, secret: string) => {
	const verifiedToken = jwt.verify(token, secret)
	return verifiedToken
}
