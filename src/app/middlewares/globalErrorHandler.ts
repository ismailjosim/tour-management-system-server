/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose'
import { environmentVariables } from '../configs/env'
import AppError from '../errorHelpers/AppError'
import { ZodError } from 'zod'

export const globalErrorHandler = (
	err: any,
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	let statusCode = 500
	let message = 'Something Went Wrong!!'

	// Mongoose Duplicate Key Error
	if (err.code === 11000) {
		const duplicateVal = err.message.match(/"([^"]*)"/)
		statusCode = 400
		message = `${duplicateVal ? duplicateVal[1] : 'Value'} already exists`
	}

	// Mongoose CastError (invalid ObjectId, etc.)
	else if (err instanceof mongoose.Error.CastError) {
		statusCode = 400
		message = `Invalid MongoDB: ${err.path}: ${err.value}`
	}

	// Mongoose ValidationError
	else if (err instanceof mongoose.Error.ValidationError) {
		statusCode = 400
		message = Object.values(err.errors)
			.map((el) => el.message)
			.join(', ')
	}

	// Zod Validation Error
	else if (err instanceof ZodError) {
		statusCode = 400
		message = err.issues
			.map((issue) => {
				const path = issue.path.join('.') || 'field'
				return `${path}: ${issue.message}`
			})
			.join('; ')
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
		err: environmentVariables.NODE_ENV === 'development' ? err : undefined,
		stack:
			environmentVariables.NODE_ENV === 'development' ? err.stack : undefined,
	})
}
