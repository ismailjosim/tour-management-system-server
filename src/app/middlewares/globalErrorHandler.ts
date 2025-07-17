/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose'
import { environmentVariables } from '../configs/env'
import AppError from '../errorHelpers/AppError'
import { ZodError } from 'zod'
import { TErrorSources } from '../interfaces/error.types'

export const globalErrorHandler = (
	err: any,
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	if (environmentVariables.NODE_ENV === 'development') {
		console.log(err)
	}

	const errorSources: TErrorSources[] = [
		// {
		// 	path: 'isDeleted',
		// 	message: 'Cast Failed',
		// },
	]
	let statusCode = 500
	let message = 'Something Went Wrong!!'

	// Mongoose Duplicate Key Error
	if (err.code === 11000) {
		const duplicateVal = err.message.match(/"([^"]*)"/)
		statusCode = 400
		message = `${duplicateVal ? duplicateVal[1] : 'Value'} already exists`

		// const simplifiedError = handlerDuplicateError(err)
		// statusCode = simplifiedError.statusCode
		// message = simplifiedError.message
	}

	// Mongoose CastError (invalid ObjectId, etc.)
	else if (err instanceof mongoose.Error.CastError) {
		statusCode = 400
		message = `Invalid MongoDB: ${err.path}: ${err.value}`
	}

	// Mongoose ValidationError
	else if (err instanceof mongoose.Error.ValidationError) {
		statusCode = 400
		const errors = Object.values(err.errors)
		errors.forEach((item: any) =>
			errorSources.push({
				path: item.path,
				message: item.message,
			}),
		)
		message = 'Validation Error Occurred ❌'
	}

	// Zod Validation Error
	else if (err instanceof ZodError) {
		statusCode = 400
		message = 'Zod Error Occurred ❌'

		err.issues.forEach((item: any) =>
			errorSources.push({
				// path: "nickname inside lastName inside name ❌"
				path: `${item.path.slice().reverse().join(' inside ')} is required ❌`,
				message: item.message,
			}),
		)
	}

	// Custom AppError
	else if (err instanceof AppError) {
		statusCode = err.statusCode
		message = err.message
	}

	// General JS Error
	else if (err instanceof Error) {
		message = err.message
	}

	res.status(statusCode).json({
		success: false,
		message,
		errorSources,
		// err: environmentVariables.NODE_ENV === 'development' ? err : undefined,
		stack:
			environmentVariables.NODE_ENV === 'development' ? err.stack : undefined,
	})
}
