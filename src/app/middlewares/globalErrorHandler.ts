/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express'
import { environmentVariables } from '../configs/env'

export const globalErrorHandler = (
	err: any,
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const statusCode = 500
	const message = `Something Went Wrong!! ${err.message} from globalErrorHandler file`
	res.status(statusCode).json({
		success: false,
		message,
		err,
		stack: environmentVariables.NODE_ENV === 'development' ? err.stack : null,
	})
}
