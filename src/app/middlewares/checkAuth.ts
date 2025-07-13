import httpStatus from 'http-status-codes'
import { NextFunction, Request, Response } from 'express'
import AppError from '../errorHelpers/AppError'
import { verifyToken } from '../utils/jwt'
import { environmentVariables } from '../configs/env'
import { JwtPayload } from 'jsonwebtoken'

const checkAuth =
	(...authRoles: string[]) =>
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const accessToken = req.headers.authorization

			if (!accessToken) {
				throw new AppError(httpStatus.FORBIDDEN, 'Unauthorized Access')
			}

			const tokenVerification = verifyToken(
				accessToken,
				environmentVariables.JWT_ACCESS_SECRET,
			) as JwtPayload

			if (!authRoles.includes(tokenVerification.role)) {
				throw new AppError(httpStatus.FORBIDDEN, 'Access Denied')
			}
			next()
		} catch (error) {
			next(error)
		}
	}

export default checkAuth
